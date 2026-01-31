'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useMapStore } from '@/store/map-store';
import { MapPin, Trash2, Undo2, Save, AlertCircle } from 'lucide-react';

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
  const [undoStack, setUndoStack] = useState<Array<{ boundaryPoints: {x: number; y: number}[]; isBoundaryClosed: boolean; areas: {name: string; points: {x: number; y: number}[]; isClosed: boolean}[]; currentAreaPoints: {x: number; y: number}[] }>>([]); // simple undo (can be improved later)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      currentAreaPoints.forEach((p) => {
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
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      alert('Error saving map: ' + errMsg);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-linear-to-br from-cyan-500 to-blue-600 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Map Editor</h1>
                <p className="text-gray-400 mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {!isBoundaryClosed
                    ? 'Phase 1: Draw the outer boundary'
                    : 'Phase 2: Draw internal areas'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title="Undo last action"
                className={`p-2.5 sm:p-3 rounded-lg transition flex items-center gap-2 text-sm font-medium ${
                  undoStack.length === 0
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <Undo2 className="w-5 h-5" />
                <span className="hidden sm:inline">Undo</span>
              </button>

              <button
                onClick={resetAll}
                title="Reset all drawings"
                className="p-2.5 sm:p-3 rounded-lg bg-red-900/80 hover:bg-red-800 transition flex items-center gap-2 text-sm font-medium text-red-100"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {isBoundaryClosed && (
                <button
                  onClick={handleSaveMap}
                  disabled={isSaving}
                  title="Save map to database"
                  className={`p-2.5 sm:p-3 rounded-lg transition flex items-center gap-2 text-sm font-medium ${
                    isSaving
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Map'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Map Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-200 mb-3">Map Name</label>
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            placeholder="e.g., Coal Stockyard - Sector A"
            className="w-full max-w-xl px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-sm transition"
          />
        </div>

        {/* Canvas Container */}
        <div className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-black">
          <div
            ref={containerRef}
            className="relative w-full bg-linear-to-br from-gray-900 to-gray-950"
            style={{ aspectRatio: '16/9', minHeight: '500px', maxHeight: '70vh' }}
          >
            <Image
              src="/Map.png"
              alt="Background map"
              fill
              className="object-contain opacity-30 pointer-events-none select-none"
            />

            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
              onPointerDown={handlePointerDown}
            />

            {/* Grid Overlay Info */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-2 rounded-lg border border-gray-700/50 text-xs text-gray-300">
              Grid: {GRID_SIZE}px
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Boundary Points</p>
            <p className="text-2xl font-bold text-cyan-400">{boundaryPoints.length}</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Areas Created</p>
            <p className="text-2xl font-bold text-amber-400">{areas.length}</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Status</p>
            <p className={`text-lg font-bold ${isBoundaryClosed ? 'text-green-400' : 'text-orange-400'}`}>
              {isBoundaryClosed ? 'Boundary ✓' : 'Drawing Boundary'}
            </p>
          </div>
        </div>

        {/* Name Modal */}
        {showNameInput && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
            <div className="bg-gray-900 border border-cyan-600/40 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-linear-to-r from-cyan-600/20 to-blue-600/20 border-b border-gray-700 px-6 py-4">
                <h3 className="text-xl font-bold text-cyan-300">
                  {isBoundaryClosed ? 'Name This Area' : 'Name the Boundary'}
                </h3>
              </div>

              <div className="p-6">
                <input
                  type="text"
                  value={pendingName}
                  onChange={(e) => setPendingName(e.target.value)}
                  placeholder="Enter name..."
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg mb-6 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-sm transition"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveName}
                    className="flex-1 py-3 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-semibold transition text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowNameInput(false);
                      setPendingName('');
                      if (isBoundaryClosed) cancelCurrentArea();
                    }}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}