'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useMapStore } from '@/store/map-store';

const GRID_SIZE = 20;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function MapDrawPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    mapName,
    setMapName,
    boundaryPoints,
    isBoundaryClosed,
    areas,
    currentAreaPoints,
    addBoundaryPoint,
    closeBoundary,
    addAreaPoint,
    closeCurrentArea,
    cancelCurrentArea,
    resetAll,
    getCreatePayload,
  } = useMapStore();

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [undoStack, setUndoStack] = useState<any[]>([]); // simple undo (can be improved later)

  // Save state for undo
  const saveForUndo = useCallback(() => {
    setUndoStack((prev) => [
      ...prev.slice(-19), // keep last 20 actions max
      {
        boundaryPoints: [...boundaryPoints],
        isBoundaryClosed,
        areas: areas.map((a) => ({ ...a, points: [...a.points] })),
        currentAreaPoints: [...currentAreaPoints],
      },
    ]);
  }, [boundaryPoints, isBoundaryClosed, areas, currentAreaPoints]);

  // Canvas setup & resize handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Only update if size actually changed
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        redraw();
      }
    };

    updateCanvasSize();

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 80);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Set context once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (context) {
      context.lineWidth = 2.5;
      context.lineJoin = 'round';
      context.lineCap = 'round';
      setCtx(context);
    }
  }, []);

  const redraw = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    ctx.clearRect(0, 0, w, h);

    // Draw boundary
    if (boundaryPoints.length > 0) {
      ctx.strokeStyle = '#22d3ee';
      ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.beginPath();
      ctx.moveTo(boundaryPoints[0].x, boundaryPoints[0].y);
      boundaryPoints.forEach((p) => ctx.lineTo(p.x, p.y));
      if (isBoundaryClosed) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      boundaryPoints.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 13px Arial';
        ctx.fillText(`${i + 1}`, p.x + 12, p.y - 12);
        ctx.fillStyle = '#22d3ee';
      });
    }

    // Draw saved areas
    areas.forEach((area) => {
      if (area.points.length < 2) return;
      ctx.strokeStyle = '#fbbf24';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
      ctx.beginPath();
      ctx.moveTo(area.points[0].x, area.points[0].y);
      area.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      area.points.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`${i + 1}`, p.x + 10, p.y - 10);
      });

      if (area.name) {
        const cx = area.points.reduce((s, p) => s + p.x, 0) / area.points.length;
        const cy = area.points.reduce((s, p) => s + p.y, 0) / area.points.length;
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(area.name, cx, cy + 6);
        ctx.textAlign = 'left';
      }
    });

    // Current area (dashed)
    if (currentAreaPoints.length > 0) {
      ctx.strokeStyle = '#fcd34d';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(currentAreaPoints[0].x, currentAreaPoints[0].y);
      currentAreaPoints.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fcd34d';
      currentAreaPoints.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [ctx, boundaryPoints, isBoundaryClosed, areas, currentAreaPoints]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getSnappedPos = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
    const y = Math.round((clientY - rect.top) / GRID_SIZE) * GRID_SIZE;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getSnappedPos(e.clientX, e.clientY);

    saveForUndo();

    if (!isBoundaryClosed) {
      if (boundaryPoints.length > 2) {
        const first = boundaryPoints[0];
        if (Math.hypot(pos.x - first.x, pos.y - first.y) < 40) {
          setShowNameInput(true);
          setPendingName('Outer Boundary');
          return;
        }
      }
      addBoundaryPoint(pos);
    } else {
      if (currentAreaPoints.length > 2) {
        const first = currentAreaPoints[0];
        if (Math.hypot(pos.x - first.x, pos.y - first.y) < 40) {
          setShowNameInput(true);
          setPendingName(`Area ${areas.length + 1}`);
          return;
        }
      }
      addAreaPoint(pos);
    }
  };

  const handleSaveName = () => {
    if (pendingName.trim()) {
      if (!isBoundaryClosed) {
        closeBoundary();
      } else {
        closeCurrentArea(pendingName.trim());
      }
    }
    setShowNameInput(false);
    setPendingName('');
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const lastState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    useMapStore.setState({
      boundaryPoints: lastState.boundaryPoints,
      isBoundaryClosed: lastState.isBoundaryClosed,
      areas: lastState.areas,
      currentAreaPoints: lastState.currentAreaPoints,
    });
  };

  const handleSaveMap = async () => {
    if (!isBoundaryClosed) {
      alert('Please close the outer boundary first');
      return;
    }
    if (areas.length === 0) {
      alert('Create at least one area');
      return;
    }

    setIsSaving(true);

    const payload = getCreatePayload();

    try {
      const res = await fetch(`${API_BASE_URL}/map/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Save failed');
      }

      const json = await res.json();
      alert(`Map saved successfully!\nID: ${json.data._id}`);
    } catch (err: any) {
      console.error(err);
      alert('Error saving map: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Map Editor</h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">
              {!isBoundaryClosed
                ? 'Phase 1: Draw outer boundary → close near first point'
                : 'Phase 2: Draw internal areas → close near first point of each area'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={resetAll}
              className="px-5 py-2 bg-red-700/90 hover:bg-red-600 rounded-lg transition text-sm sm:text-base"
            >
              Reset All
            </button>

            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className={`px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm sm:text-base ${
                undoStack.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Undo
            </button>

            {isBoundaryClosed && (
              <button
                onClick={handleSaveMap}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                  isSaving ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Map'}
              </button>
            )}
          </div>
        </div>

        {/* Map Name */}
        <div className="mb-5">
          <label className="block text-gray-300 mb-2 text-sm sm:text-base">Map Name</label>
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            className="w-full max-w-md sm:max-w-lg px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-sm sm:text-base"
            placeholder="e.g. Coal Stockyard - Raipur"
          />
        </div>

        {/* Canvas Container – fixed aspect ratio */}
        <div
          ref={containerRef}
          className="relative w-full pb-[56.25%] max-h-[80vh] border border-gray-700 rounded-xl overflow-hidden bg-gray-900 shadow-2xl mx-auto"
        >
          <div className="absolute inset-0">
            <Image
              src="/Map.png"
              alt="Background map"
              fill
              className="object-contain opacity-40 pointer-events-none select-none"
            />

            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
              onPointerDown={handlePointerDown}
            />
          </div>
        </div>

        {/* Name modal */}
        {showNameInput && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
            <div className="bg-gray-900 p-6 rounded-xl border border-cyan-600/40 w-full max-w-md">
              <h3 className="text-xl font-semibold text-cyan-300 mb-4">
                Name {isBoundaryClosed ? 'this area' : 'the boundary'}
              </h3>

              <input
                type="text"
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value)}
                placeholder="Required"
                autoFocus
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg mb-5 focus:outline-none focus:border-cyan-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSaveName}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowNameInput(false);
                    setPendingName('');
                    if (isBoundaryClosed) cancelCurrentArea();
                  }}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}