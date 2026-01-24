'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

const GRID_SIZE = 20;

type Point = { x: number; y: number };

interface InternalShape {
  points: Point[];
  name: string;
  isClosed: boolean;
}

export default function ImageOutlineDrawer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Outer Boundary ───────────────────────────────────────────────
  const [boundaryPoints, setBoundaryPoints] = useState<Point[]>([]);
  const [boundaryHistory, setBoundaryHistory] = useState<Point[][]>([]);
  const [boundaryRedoStack, setBoundaryRedoStack] = useState<Point[][]>([]);
  const [isBoundaryClosed, setIsBoundaryClosed] = useState(false);

  // ── Multiple Internal Blocks ─────────────────────────────────────
  const [internalShapes, setInternalShapes] = useState<InternalShape[]>([]);
  const [currentInternalPoints, setCurrentInternalPoints] = useState<Point[]>([]);
  const [internalHistory, setInternalHistory] = useState<Point[][]>([]);
  const [internalRedoStack, setInternalRedoStack] = useState<Point[][]>([]);

  // ── Name Modal State ─────────────────────────────────────────────
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingPoints, setPendingPoints] = useState<Point[]>([]);
  const [pendingName, setPendingName] = useState('');
  const [isNamingBoundary, setIsNamingBoundary] = useState(false); // true = boundary, false = internal

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    canvas.width = containerRef.current.offsetWidth;
    canvas.height = containerRef.current.offsetHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineWidth = 2.5;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    setCtx(context);

    // Handle resize
    const handleResize = () => {
      canvas.width = containerRef.current!.offsetWidth;
      canvas.height = containerRef.current!.offsetHeight;
      redraw();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPointInsidePolygon = (point: Point, polygon: Point[]): boolean => {
    if (polygon.length < 3) return false;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 1e-10) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const redraw = () => {
    if (!ctx || !canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    ctx.clearRect(0, 0, w, h);

    // Dim outside when boundary closed
    if (isBoundaryClosed && boundaryPoints.length >= 3) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(boundaryPoints[0].x, boundaryPoints[0].y);
      boundaryPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // Draw boundary
    if (boundaryPoints.length > 0) {
      ctx.strokeStyle = '#22d3ee';
      ctx.fillStyle = 'rgba(34, 211, 238, 0.20)';

      ctx.beginPath();
      ctx.moveTo(boundaryPoints[0].x, boundaryPoints[0].y);
      boundaryPoints.forEach(p => ctx.lineTo(p.x, p.y));

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
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Arial';
        ctx.fillText(String(i + 1), p.x + 12, p.y - 12);
        ctx.fillStyle = '#22d3ee';
      });
    }

    // Draw internal shapes
    internalShapes.forEach((shape) => {
      if (shape.points.length < 2) return;

      ctx.strokeStyle = '#fbbf24';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';

      ctx.beginPath();
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      shape.points.forEach(p => ctx.lineTo(p.x, p.y));

      if (shape.isClosed) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      shape.points.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(String(i + 1), p.x + 10, p.y - 10);
        ctx.fillStyle = '#fbbf24';
      });

      // Name centered
      if (shape.isClosed && shape.name) {
        const cx = shape.points.reduce((sum, p) => sum + p.x, 0) / shape.points.length;
        const cy = shape.points.reduce((sum, p) => sum + p.y, 0) / shape.points.length;
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(shape.name, cx, cy + 6);
        ctx.textAlign = 'left';
      }
    });

    // Current internal block
    if (currentInternalPoints.length > 0 && isBoundaryClosed) {
      ctx.strokeStyle = '#fcd34d';
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(currentInternalPoints[0].x, currentInternalPoints[0].y);
      currentInternalPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fcd34d';
      currentInternalPoints.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(String(i + 1), p.x + 10, p.y - 10);
        ctx.fillStyle = '#fcd34d';
      });
    }
  };

  useEffect(() => {
    redraw();
  }, [boundaryPoints, internalShapes, currentInternalPoints, isBoundaryClosed]);

  const getSnappedPos = (e: React.MouseEvent): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
    const y = Math.round((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;
    return { x, y };
  };

  const handleClick = (e: React.MouseEvent) => {
  const pos = getSnappedPos(e);

  if (!isBoundaryClosed) {
    // Phase 1: Boundary
    if (boundaryPoints.length > 0) {
      const first = boundaryPoints[0];
      const dist = Math.hypot(pos.x - first.x, pos.y - first.y);
      if (dist < 35 && boundaryPoints.length >= 3) {
        setIsNamingBoundary(true);
        setPendingPoints(boundaryPoints);
        setShowNameModal(true);
        setPendingName('Outer Boundary');
        return;
      }
    }

    setBoundaryPoints((prev) => {
      const updated = [...prev, pos];
      setBoundaryHistory((h) => [...h, updated]);
      setBoundaryRedoStack([]);
      return updated;
    });
  } else {
    // Phase 2: Internal blocks
    if (!isPointInsidePolygon(pos, boundaryPoints)) return;

    if (currentInternalPoints.length > 0) {
      const first = currentInternalPoints[0];
      const dist = Math.hypot(pos.x - first.x, pos.y - first.y);
      if (dist < 35 && currentInternalPoints.length >= 3) {
        // Generate next alphabet letter (A, B, C, ...)
        const nextLetter = String.fromCharCode(
          65 + internalShapes.length // 65 = 'A'
        );

        setIsNamingBoundary(false);
        setPendingPoints(currentInternalPoints);
        setShowNameModal(true);
        setPendingName(`AREA ${nextLetter}`);
        return;
      }
    }

    setCurrentInternalPoints((prev) => {
      const updated = [...prev, pos];
      setInternalHistory((h) => [...h, updated]);
      setInternalRedoStack([]);
      return updated;
    });
  }
};

  const handleSaveName = () => {
    if (isNamingBoundary) {
      // Save boundary
      setIsBoundaryClosed(true);
      setBoundaryHistory(prev => [...prev, [...boundaryPoints]]);
      setBoundaryRedoStack([]);
    } else {
      // Save internal block
      setInternalShapes(prev => [
        ...prev,
        { points: pendingPoints, name: pendingName.trim() || `Block ${prev.length + 1}`, isClosed: true }
      ]);
      setInternalHistory(h => [...h, pendingPoints]);
      setInternalRedoStack([]);
    }

    setShowNameModal(false);
    setCurrentInternalPoints([]);
    setPendingPoints([]);
    setPendingName('');
  };

  // ── Undo / Redo ──────────────────────────────────────────────────
  const undoBoundary = () => {
    if (boundaryHistory.length === 0) return;
    const prev = boundaryHistory[boundaryHistory.length - 1];
    setBoundaryRedoStack([boundaryPoints, ...boundaryRedoStack]);
    setBoundaryPoints(prev);
    setBoundaryHistory(boundaryHistory.slice(0, -1));
  };

  const redoBoundary = () => {
    if (boundaryRedoStack.length === 0) return;
    const next = boundaryRedoStack[0];
    setBoundaryHistory([...boundaryHistory, boundaryPoints]);
    setBoundaryPoints(next);
    setBoundaryRedoStack(boundaryRedoStack.slice(1));
  };

  const undoInternal = () => {
    if (internalHistory.length === 0) return;
    const prev = internalHistory[internalHistory.length - 1];
    setInternalRedoStack([currentInternalPoints, ...internalRedoStack]);
    setCurrentInternalPoints(prev);
    setInternalHistory(internalHistory.slice(0, -1));
  };

  const redoInternal = () => {
    if (internalRedoStack.length === 0) return;
    const next = internalRedoStack[0];
    setInternalHistory([...internalHistory, currentInternalPoints]);
    setCurrentInternalPoints(next);
    setInternalRedoStack(internalRedoStack.slice(1));
  };

  const resetAll = () => {
    setBoundaryPoints([]);
    setBoundaryHistory([]);
    setBoundaryRedoStack([]);
    setInternalShapes([]);
    setCurrentInternalPoints([]);
    setInternalHistory([]);
    setInternalRedoStack([]);
    setIsBoundaryClosed(false);
    setShowNameModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 tracking-tight">
              Multi-Block Area Mapping Tool
            </h1>
            <p className="text-gray-400 text-lg">
              {!isBoundaryClosed
                ? "Phase 1: Draw outer boundary → click near first dot to close & name"
                : "Phase 2: Create & name multiple internal blocks → click near first amber dot to close"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={resetAll}
              className="px-6 py-3 bg-red-700/90 hover:bg-red-600 rounded-lg font-medium transition shadow-md"
            >
              Reset Everything
            </button>

            {isBoundaryClosed && (
              <button
                onClick={() => alert('Areas saved! (extend to API / download later)')}
                className="px-6 py-3 bg-green-700/90 hover:bg-green-600 rounded-lg font-medium transition shadow-md"
              >
                Save All Areas
              </button>
            )}
          </div>
        </div>

        {/* Undo / Redo Controls */}
        <div className="flex flex-wrap gap-6 mb-4">
          <div className="flex items-center gap-4 bg-gray-800/70 px-5 py-3 rounded-xl border border-gray-700 shadow-sm">
            <span className="text-cyan-300 font-medium">Boundary:</span>
            <button
              onClick={undoBoundary}
              disabled={boundaryHistory.length === 0}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40 transition font-medium"
            >
              Undo
            </button>
            <button
              onClick={redoBoundary}
              disabled={boundaryRedoStack.length === 0}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40 transition font-medium"
            >
              Redo
            </button>
          </div>

          {isBoundaryClosed && (
            <div className="flex items-center gap-4 bg-gray-800/70 px-5 py-3 rounded-xl border border-gray-700 shadow-sm">
              <span className="text-amber-300 font-medium">Internal Blocks:</span>
              <button
                onClick={undoInternal}
                disabled={internalHistory.length === 0}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40 transition font-medium"
              >
                Undo
              </button>
              <button
                onClick={redoInternal}
                disabled={internalRedoStack.length === 0}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40 transition font-medium"
              >
                Redo
              </button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative w-full aspect-[16/9] max-h-[75vh] border-2 border-gray-700 rounded-2xl overflow-hidden bg-gray-900 shadow-2xl"
        >
          <Image
            src="/Map.png"
            alt="Site Map"
            fill
            priority
            className="object-contain opacity-45 pointer-events-none select-none"
          />

          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(99,102,241,0.09) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(99,102,241,0.09) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            }}
          />

          <canvas
            ref={canvasRef}
            className={`absolute inset-0 ${!isBoundaryClosed ? 'cursor-crosshair' : 'cursor-cell'}`}
            onClick={handleClick}
          />
        </div>

        {/* Status Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 shadow-inner">
            <p className="text-cyan-300 font-semibold text-lg mb-3">Outer Boundary</p>
            <p className="text-gray-300 text-base">{boundaryPoints.length} points</p>
            {isBoundaryClosed && (
              <p className="text-green-400 mt-3 font-medium">✓ Closed & Protected</p>
            )}
          </div>

          <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 shadow-inner">
            <p className="text-amber-300 font-semibold text-lg mb-3">Internal Blocks</p>
            <p className="text-gray-300 text-base">{internalShapes.length} blocks created</p>
            {currentInternalPoints.length > 0 && (
              <p className="text-yellow-400 mt-3">
                Current block: {currentInternalPoints.length} points
              </p>
            )}
          </div>

          <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 shadow-inner">
            <p className="text-gray-300 font-semibold text-lg mb-3">Quick Guide</p>
            <ul className="text-gray-400 text-sm space-y-2 list-disc pl-5">
              <li>Click to place points (exact grid snap)</li>
              <li>Click near first dot → close shape & name it</li>
              <li>After boundary → create multiple named internal blocks</li>
              <li>Use Undo/Redo anytime</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Name Modal (Top Center Popup) */}
      {showNameModal && (
        <>
          {/* Backdrop blur */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

          {/* Modal at top center */}
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="bg-gray-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl p-6 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-cyan-300">
                  {isNamingBoundary ? 'Name Outer Boundary' : 'Name This Block'}
                </h3>
                <button
                  onClick={() => setShowNameModal(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <input
                type="text"
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                }}
                placeholder="e.g. Main Area / Plot A / Zone 1"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition"
                autoFocus
              />

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSaveName}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition shadow-md"
                >
                  Save & Continue
                </button>
                <button
                  onClick={() => setShowNameModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}