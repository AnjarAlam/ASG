'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useMapStore } from '@/store/map-store';
import { MapPin, Trash2, Undo2, Save, AlertCircle, Edit2, Plus } from 'lucide-react';

const GRID_SIZE = 1;
const POINT_RADIUS = 6;
const POINT_SNAP_RADIUS = 15;
const EDGE_SNAP_RADIUS = 12;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Device detection for responsive behavior
const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

// Utility function to check if a point is inside a polygon (ray casting algorithm)
const isPointInPolygon = (point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean => {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Utility function to check if two polygons overlap (including edge intersections)
const doPolygonsOverlap = (poly1: { x: number; y: number }[], poly2: { x: number; y: number }[]): boolean => {
  if (poly1.length < 3 || poly2.length < 3) return false;

  // Check if any vertex of poly1 is inside poly2
  for (const point of poly1) {
    if (isPointInPolygon(point, poly2)) return true;
  }

  // Check if any vertex of poly2 is inside poly1
  for (const point of poly2) {
    if (isPointInPolygon(point, poly1)) return true;
  }

  // Check for edge intersections
  for (let i = 0; i < poly1.length; i++) {
    const p1 = poly1[i];
    const p2 = poly1[(i + 1) % poly1.length];

    for (let j = 0; j < poly2.length; j++) {
      const p3 = poly2[j];
      const p4 = poly2[(j + 1) % poly2.length];

      if (lineSegmentsIntersect(p1, p2, p3, p4)) {
        return true;
      }
    }
  }

  return false;
};

// Line segment intersection detection
const lineSegmentsIntersect = (
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): boolean => {
  const ccw = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) => {
    return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  };
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
};

// Find closest point on a line segment
const getClosestPointOnSegment = (
  point: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): { x: number; y: number } & { distance: number; isOnSegment: boolean } => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    const dist = Math.hypot(point.x - p1.x, point.y - p1.y);
    return { x: p1.x, y: p1.y, distance: dist, isOnSegment: dist < EDGE_SNAP_RADIUS };
  }

  let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = p1.x + t * dx;
  const closestY = p1.y + t * dy;
  const distance = Math.hypot(point.x - closestX, point.y - closestY);

  return {
    x: closestX,
    y: closestY,
    distance,
    isOnSegment: distance < EDGE_SNAP_RADIUS && t > 0.05 && t < 0.95, // Avoid too close to endpoints
  };
};

// Detect if cursor is near an edge and return insertion info
interface EdgeInsertInfo {
  edgeIndex: number;
  insertPoint: { x: number; y: number };
  distance: number;
}

const detectNearbyEdge = (pos: { x: number; y: number }, polygon: { x: number; y: number }[]): EdgeInsertInfo | null => {
  if (polygon.length < 2) return null;

  let closestEdge: EdgeInsertInfo | null = null;

  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const closest = getClosestPointOnSegment(pos, p1, p2);

    if (closest.isOnSegment && (!closestEdge || closest.distance < closestEdge.distance)) {
      closestEdge = {
        edgeIndex: i,
        insertPoint: { x: Math.round(closest.x / GRID_SIZE) * GRID_SIZE, y: Math.round(closest.y / GRID_SIZE) * GRID_SIZE },
        distance: closest.distance,
      };
    }
  }

  return closestEdge;
};


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
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(null);
  const [isEditingArea, setIsEditingArea] = useState(false);
  const [editingPointIndex, setEditingPointIndex] = useState<number | null>(null);
  const [nearbyEdgeInfo, setNearbyEdgeInfo] = useState<EdgeInsertInfo | null>(null);
  const [overlapWarning, setOverlapWarning] = useState<string>('');
  const [boundaryViolation, setBoundaryViolation] = useState<string>('');
  const [undoStack, setUndoStack] = useState<Array<{ boundaryPoints: {x: number; y: number}[]; isBoundaryClosed: boolean; areas: {name: string; points: {x: number; y: number}[]; isClosed: boolean}[]; currentAreaPoints: {x: number; y: number}[] }>>([]); // simple undo

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

      // Set canvas resolution to match display size (device pixel ratio aware)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // Scale canvas context for high DPI displays
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
      }

      redraw();
    };

    updateCanvasSize();

    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', debouncedResize);
      clearTimeout(resizeTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx]);

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

    // Draw boundary (locked after Phase 1)
    if (boundaryPoints.length > 0) {
      ctx.strokeStyle = '#EE2D22';
      ctx.fillStyle = 'rgba(238, 34, 34, 0.1)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(boundaryPoints[0].x, boundaryPoints[0].y);
      boundaryPoints.forEach((p) => ctx.lineTo(p.x, p.y));
      if (isBoundaryClosed) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      // Draw boundary points
      if (!isBoundaryClosed) {
        ctx.fillStyle = '#EE2D22';
        boundaryPoints.forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.font = 'bold 13px Arial';
          ctx.fillText(`${i + 1}`, p.x + 12, p.y - 12);
          ctx.fillStyle = '#EE2D22';
        });
      }
    }

    // Draw saved areas
    areas.forEach((area, areaIdx) => {
      if (area.points.length < 2) return;

      const isSelected = selectedAreaIndex === areaIdx;
      const hasWarning = overlapWarning.includes(`Area ${areaIdx}`);

      // Area fill and stroke
      ctx.strokeStyle = isSelected ? '#22d3ee' : hasWarning ? '#fca5a5' : '#EE2D22';
      ctx.fillStyle = isSelected 
        ? 'rgba(34, 211, 238, 0.25)' 
        : hasWarning 
        ? 'rgba(252, 165, 165, 0.15)' 
        : 'rgba(238, 34, 34, 0.1)';

      ctx.lineWidth = isSelected ? 3 : 2.5;
      ctx.beginPath();
      ctx.moveTo(area.points[0].x, area.points[0].y);
      area.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw area points
      area.points.forEach((p, i) => {
        ctx.beginPath();
        const pointRadius = editingPointIndex === i && isSelected ? 8 : 6;
        ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#22d3ee' : '#EE2D22';
        ctx.fill();
        
        if (pointRadius > 6) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Highlight nearby edges when in editing mode
      if (isSelected && isEditingArea && nearbyEdgeInfo) {
        const edge = area.points[nearbyEdgeInfo.edgeIndex];
        const nextEdge = area.points[(nearbyEdgeInfo.edgeIndex + 1) % area.points.length];
        
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(edge.x, edge.y);
        ctx.lineTo(nextEdge.x, nextEdge.y);
        ctx.stroke();

        // Draw insertion point indicator
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(nearbyEdgeInfo.insertPoint.x, nearbyEdgeInfo.insertPoint.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Area name
      if (area.name) {
        const cx = area.points.reduce((s, p) => s + p.x, 0) / area.points.length;
        const cy = area.points.reduce((s, p) => s + p.y, 0) / area.points.length;
        ctx.fillStyle = isSelected ? '#22d3ee' : '#fbbf24';
        ctx.font = `bold ${isSelected ? 18 : 16}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(area.name, cx, cy + 6);
        ctx.textAlign = 'left';
      }

      // Selection indicator
      if (isSelected) {
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          Math.min(...area.points.map(p => p.x)) - 5,
          Math.min(...area.points.map(p => p.y)) - 5,
          Math.max(...area.points.map(p => p.x)) - Math.min(...area.points.map(p => p.x)) + 10,
          Math.max(...area.points.map(p => p.y)) - Math.min(...area.points.map(p => p.y)) + 10
        );
        ctx.setLineDash([]);
      }
    });

    // Draw current area being created (dashed)
    if (currentAreaPoints.length > 0) {
      ctx.strokeStyle = '#fcd34d';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2.5;
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
  }, [ctx, boundaryPoints, isBoundaryClosed, areas, currentAreaPoints, selectedAreaIndex, editingPointIndex, overlapWarning, isEditingArea, nearbyEdgeInfo]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getSnappedPos = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Account for device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvasRef.current.width / dpr;
    const canvasHeight = canvasRef.current.height / dpr;
    
    // Calculate position relative to canvas display size
    const x = Math.round(((clientX - rect.left) / (rect.width)) * canvasWidth / GRID_SIZE) * GRID_SIZE;
    const y = Math.round(((clientY - rect.top) / (rect.height)) * canvasHeight / GRID_SIZE) * GRID_SIZE;
    
    // Clamp to canvas bounds
    return {
      x: Math.max(0, Math.min(x, canvasWidth - 1)),
      y: Math.max(0, Math.min(y, canvasHeight - 1)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getSnappedPos(e.clientX, e.clientY);

    saveForUndo();

    // Phase 1: Drawing boundary
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
      return;
    }

    // Phase 2: Boundary is closed
    // If in editing mode, handle point dragging or edge point insertion
    if (isEditingArea && selectedAreaIndex !== null) {
      const selectedArea = areas[selectedAreaIndex];
      
      // Check if clicking on nearby edge to insert new point
      if (nearbyEdgeInfo) {
        const newPoints = [...selectedArea.points];
        newPoints.splice(nearbyEdgeInfo.edgeIndex + 1, 0, nearbyEdgeInfo.insertPoint);

        // Validate: new point must be within boundary and not cause overlaps
        if (isPointInPolygon(nearbyEdgeInfo.insertPoint, boundaryPoints)) {
          const updatedAreas = [...areas];
          updatedAreas[selectedAreaIndex] = { ...selectedArea, points: newPoints };
          
          // Check for overlaps with other areas
          let hasOverlap = false;
          for (let i = 0; i < updatedAreas.length; i++) {
            if (i === selectedAreaIndex) continue;
            if (doPolygonsOverlap(newPoints, updatedAreas[i].points)) {
              hasOverlap = true;
              break;
            }
          }

          if (!hasOverlap) {
            useMapStore.setState({ areas: updatedAreas });
            setOverlapWarning('');
            setBoundaryViolation('');
          } else {
            setOverlapWarning('Cannot insert point: would cause overlap with another area');
            setTimeout(() => setOverlapWarning(''), 3000);
          }
        } else {
          setBoundaryViolation('Cannot insert point: would exceed boundary');
          setTimeout(() => setBoundaryViolation(''), 3000);
        }
        return;
      }
      
      // Check if clicking on existing point to drag it
      const clickedPointIdx = selectedArea.points.findIndex(
        (p) => Math.hypot(pos.x - p.x, pos.y - p.y) < POINT_SNAP_RADIUS
      );
      
      if (clickedPointIdx !== -1) {
        setEditingPointIndex(clickedPointIdx);
        return;
      }
      
      // Otherwise, cancel editing
      setIsEditingArea(false);
      setEditingPointIndex(null);
      setNearbyEdgeInfo(null);
      return;
    }

    // Phase 2: Not in editing mode - check if clicking inside any existing area to select it
    for (let i = 0; i < areas.length; i++) {
      if (isPointInPolygon(pos, areas[i].points)) {
        setSelectedAreaIndex(i);
        return;
      }
    }
    
    // Clicked in empty space - deselect
    setSelectedAreaIndex(null);
    setNearbyEdgeInfo(null);

    // Handle drawing a new area
    if (currentAreaPoints.length > 2) {
      const first = currentAreaPoints[0];
      if (Math.hypot(pos.x - first.x, pos.y - first.y) < 40) {
        // Validate area before saving
        const newAreaPoints = currentAreaPoints;
        
        // Check 1: All points must be within boundary
        const allPointsInBoundary = newAreaPoints.every(p => isPointInPolygon(p, boundaryPoints));
        if (!allPointsInBoundary) {
          setBoundaryViolation('Cannot save area: some points are outside the boundary');
          setTimeout(() => setBoundaryViolation(''), 4000);
          return;
        }

        // Check 2: No overlaps with existing areas
        let hasOverlap = false;
        const overlappingIndices: number[] = [];
        
        for (let i = 0; i < areas.length; i++) {
          if (doPolygonsOverlap(newAreaPoints, areas[i].points)) {
            hasOverlap = true;
            overlappingIndices.push(i);
          }
        }

        if (hasOverlap) {
          const overlappingAreas = overlappingIndices.map(i => `${areas[i].name}`).join(', ');
          setOverlapWarning(`Cannot save: overlaps with ${overlappingAreas}`);
          setTimeout(() => setOverlapWarning(''), 4000);
          return;
        }

        setShowNameInput(true);
        setPendingName(`Area ${areas.length + 1}`);
        setOverlapWarning('');
        setBoundaryViolation('');
        return;
      }
    }
    
    // Add point to current area being drawn
    if (isPointInPolygon(pos, boundaryPoints)) {
      addAreaPoint(pos);
    } else {
      setBoundaryViolation('Point must be within the outer boundary');
      setTimeout(() => setBoundaryViolation(''), 3000);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = getSnappedPos(e.clientX, e.clientY);

    // When editing an area, show edge insertion indicators
    if (isEditingArea && selectedAreaIndex !== null) {
      const selectedArea = areas[selectedAreaIndex];
      const edgeInfo = detectNearbyEdge(pos, selectedArea.points);
      setNearbyEdgeInfo(edgeInfo);
    }

    // Handle point dragging during editing
    if (editingPointIndex === null || selectedAreaIndex === null) return;

    const updatedArea = { ...areas[selectedAreaIndex] };
    updatedArea.points = [...updatedArea.points];
    updatedArea.points[editingPointIndex] = pos;

    // Validation 1: Point must stay within boundary
    if (!isPointInPolygon(pos, boundaryPoints)) {
      setBoundaryViolation('Point must stay within boundary');
      return;
    }

    // Validation 2: Check if new position causes overlap with other areas
    let hasOverlap = false;
    for (let i = 0; i < areas.length; i++) {
      if (i === selectedAreaIndex) continue;
      if (doPolygonsOverlap(updatedArea.points, areas[i].points)) {
        hasOverlap = true;
        break;
      }
    }

    if (hasOverlap) {
      setOverlapWarning('Cannot move: would cause overlap with another area');
      return;
    }

    // Update is valid
    const updatedAreas = [...areas];
    updatedAreas[selectedAreaIndex] = updatedArea;
    useMapStore.setState({ areas: updatedAreas });
    setOverlapWarning('');
    setBoundaryViolation('');
  };

  const handlePointerUp = () => {
    setEditingPointIndex(null);
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

  const handleDeleteArea = (index: number) => {
    const updatedAreas = areas.filter((_, i) => i !== index);
    useMapStore.setState({ areas: updatedAreas });
    setSelectedAreaIndex(null);
    setIsEditingArea(false);
    setEditingPointIndex(null);
  };

  const handleEditArea = () => {
    setIsEditingArea(!isEditingArea);
    setEditingPointIndex(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 pb-24 md:pb-8">
      <div className="max-w-full lg:max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex-shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white truncate">Map Editor</h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1.5 flex-wrap">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {!isBoundaryClosed
                      ? 'Phase 1: Draw outer boundary'
                      : 'Phase 2: Draw internal areas'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title="Undo last action"
                className={`p-2 sm:p-2.5 md:p-3 rounded-lg transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium flex-shrink-0 ${
                  undoStack.length === 0
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <Undo2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Undo</span>
              </button>

              <button
                onClick={resetAll}
                title="Reset all drawings"
                className="p-2 sm:p-2.5 md:p-3 rounded-lg bg-red-900/80 hover:bg-red-800 transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-red-100 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {isBoundaryClosed && (
                <button
                  onClick={handleSaveMap}
                  disabled={isSaving}
                  title="Save map to database"
                  className={`p-2 sm:p-2.5 md:p-3 rounded-lg transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium flex-shrink-0 ${
                    isSaving
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                  }`}
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Map'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Map Name Input */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">Map Name</label>
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            placeholder="e.g., Coal Stockyard - Sector A"
            className="w-full max-w-2xl px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-xs sm:text-sm transition"
          />
        </div>

        {/* Canvas Container */}
        <div className="rounded-lg sm:rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-black mb-4 sm:mb-6 md:mb-8">
          <div
            ref={containerRef}
            className="relative w-full bg-gradient-to-br from-gray-900 to-gray-950"
            style={{ 
              aspectRatio: '16/9',
              minHeight: 'min(60vh, 400px)',
              maxHeight: '75vh',
            }}
          >
            <Image
              src="/Map.png"
              alt="Background map"
              fill
              className="object-contain opacity-30 pointer-events-none select-none"
              priority
            />

            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{
                background: 'transparent',
                border: 'none',
              }}
            />

            {/* Grid Overlay Info */}
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 md:bottom-4 md:right-4 bg-black/60 backdrop-blur px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-700/50 text-xs text-gray-300">
              Grid: {GRID_SIZE}px
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 sm:p-4 md:p-5">
            <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Boundary Points</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-400 truncate">{boundaryPoints.length}</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 sm:p-4 md:p-5">
            <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Areas Created</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-400 truncate">{areas.length}</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 sm:p-4 md:p-5">
            <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Status</p>
            <p className={`text-sm sm:text-base md:text-lg font-bold ${isBoundaryClosed ? 'text-green-400' : 'text-orange-400'}`}>
              {isBoundaryClosed ? '✓ Boundary' : 'Drawing'}
            </p>
          </div>
        </div>

        {/* Warning Messages */}
        {overlapWarning && (
          <div className="mb-4 p-3 sm:p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex items-start gap-2 sm:gap-3 animate-in fade-in slide-in-from-top">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-200 text-xs sm:text-sm leading-relaxed">{overlapWarning}</p>
          </div>
        )}

        {boundaryViolation && (
          <div className="mb-4 p-3 sm:p-4 bg-orange-900/30 border border-orange-600/50 rounded-lg flex items-start gap-2 sm:gap-3 animate-in fade-in slide-in-from-top">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-orange-200 text-xs sm:text-sm leading-relaxed">{boundaryViolation}</p>
          </div>
        )}

        {/* Area Management Panel */}
        {isBoundaryClosed && selectedAreaIndex !== null && (
          <div className="mb-4 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-600/40 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-cyan-300 flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">{areas[selectedAreaIndex].name}</span>
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                  {areas[selectedAreaIndex].points.length} points • {isEditingArea ? 'Edit Mode' : 'View Mode'}
                  {isEditingArea && nearbyEdgeInfo && (
                    <span className="ml-1 sm:ml-2 text-green-400 block sm:inline">• Click edge to add point</span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleEditArea}
                  className={`p-2 sm:p-2.5 md:p-3 rounded-lg transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium flex-shrink-0 ${
                    isEditingArea
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{isEditingArea ? 'Done Editing' : 'Edit Area'}</span>
                  <span className="sm:hidden">{isEditingArea ? 'Done' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => handleDeleteArea(selectedAreaIndex)}
                  className="p-2 sm:p-2.5 md:p-3 rounded-lg bg-red-900/80 hover:bg-red-800 transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-red-100 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phase Guidance */}
        {isBoundaryClosed && (
          <div className="mb-4 p-3 sm:p-4 bg-blue-900/20 border border-blue-600/40 rounded-lg">
            <p className="text-blue-200 text-xs sm:text-sm leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0 flex-shrink-0" />
              <span>
                {isEditingArea
                  ? `Edit Mode: Drag points to move, click on edges to add points (green highlight). Areas must stay within boundary and cannot overlap.`
                  : 'Click inside any area to select it. Use "Edit Area" to modify. All areas must be within the boundary and cannot overlap.'}
              </span>
            </p>
          </div>
        )}

        {/* Name Modal */}
        {showNameInput && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
            <div className="bg-gray-900 border border-cyan-600/40 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4">
                <h3 className="text-lg sm:text-xl font-bold text-cyan-300">
                  {isBoundaryClosed ? 'Name This Area' : 'Name the Boundary'}
                </h3>
              </div>

              <div className="p-4 sm:p-6">
                <input
                  type="text"
                  value={pendingName}
                  onChange={(e) => setPendingName(e.target.value)}
                  placeholder="Enter name..."
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg mb-4 sm:mb-6 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-xs sm:text-sm transition"
                />

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleSaveName}
                    className="flex-1 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-semibold transition text-white text-sm sm:text-base"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowNameInput(false);
                      setPendingName('');
                      if (isBoundaryClosed) cancelCurrentArea();
                    }}
                    className="flex-1 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition text-gray-200 text-sm sm:text-base"
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