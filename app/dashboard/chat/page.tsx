'use client';

import { useEffect, useRef, useState } from 'react'; 
import { ArrowLeft, MoveHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ShapeType = 'rect';

interface Area {
  id: string;
  label: string;
  shape: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  desiredWidth: number;
  desiredHeight: number;
}

const GRID_SIZE = 20;
const MIN_SIZE = 60;
const STORAGE_KEY = 'coal-washery-areas'; // unique key for localStorage

export default function AreaDivisionCanvas() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });

  // Load from localStorage or use initial data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Optional: basic validation
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAreas(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to load saved areas:', e);
      }
    }

    // Fallback - initial data if nothing saved or invalid
    const initialAreas: Area[] = [
      { id: 'A', label: 'A', shape: 'rect', x: 0,   y: 0,   width: 240, height: 320, desiredWidth: 240, desiredHeight: 320 },
      { id: 'B', label: 'B', shape: 'rect', x: 240, y: 0,   width: 240, height: 320, desiredWidth: 240, desiredHeight: 320 },
      { id: 'C', label: 'C', shape: 'rect', x: 480, y: 0,   width: 220, height: 240, desiredWidth: 220, desiredHeight: 240 },
      { id: 'D', label: 'D', shape: 'rect', x: 0,   y: 320, width: 360, height: 240, desiredWidth: 360, desiredHeight: 240 },
      { id: 'E', label: 'E', shape: 'rect', x: 360, y: 320, width: 340, height: 240, desiredWidth: 340, desiredHeight: 240 },
      { id: 'F', label: 'F', shape: 'rect', x: 700, y: 0,   width: 300, height: 560, desiredWidth: 300, desiredHeight: 560 },
      { id: 'G', label: 'G', shape: 'rect', x: 0,   y: 560, width: 1000, height: 140, desiredWidth: 1000, desiredHeight: 140 },
    ];

    const snapped = initialAreas.map(area => ({
      ...area,
      x: Math.round(area.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(area.y / GRID_SIZE) * GRID_SIZE,
      width: Math.round(area.width / GRID_SIZE) * GRID_SIZE,
      height: Math.round(area.height / GRID_SIZE) * GRID_SIZE,
    }));

    setAreas(snapped);
  }, []);

  // Save to localStorage whenever areas change
  useEffect(() => {
    if (areas.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
    }
  }, [areas]);

  // Rest of your container size handling...
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const snap = (v: number) => Math.round(Math.max(0, v) / GRID_SIZE) * GRID_SIZE;
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

  const rectsOverlap = (a: Area, b: Area) => {
    return !(
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
    );
  };

  const wouldOverlap = (proposed: Area, allAreas: Area[], excludeId: string) => {
    return allAreas.some(area => area.id !== excludeId && rectsOverlap(proposed, area));
  };

  const scaleAreasToContainer = (areasToScale: Area[]): Area[] => {
    if (areasToScale.length === 0) return areasToScale;

    const maxX = Math.max(...areasToScale.map(a => a.x + a.width));
    const maxY = Math.max(...areasToScale.map(a => a.y + a.height));

    if (maxX <= 0 || maxY <= 0) return areasToScale;

    const scaleX = containerSize.width / maxX;
    const scaleY = containerSize.height / maxY;

    return areasToScale.map(area => {
      const scaled = { ...area };
      scaled.x = snap(area.x * scaleX);
      scaled.y = snap(area.y * scaleY);
      scaled.width = snap(area.width * scaleX);
      scaled.height = snap(area.height * scaleY);
      scaled.desiredWidth = scaled.width;
      scaled.desiredHeight = scaled.height;
      return scaled;
    });
  };

  const startResize = (
    areaId: string,
    handle: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  ) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const area = areas.find(a => a.id === areaId);
    if (!area) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = area.x;
    const startTop = area.y;
    const startW = area.width;
    const startH = area.height;

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      setAreas(prev => {
        return prev.map(a => {
          if (a.id !== areaId) return a;

          const next = { ...a };
          let proposed: Area = { ...next };

          switch (handle) {
            case 'right':
              proposed.width = snap(clamp(startW + dx, MIN_SIZE, containerSize.width - proposed.x));
              break;
            case 'left':
              const newLeftW = startW - dx;
              const newLeft = startLeft + dx;
              if (newLeftW >= MIN_SIZE && newLeft >= 0) {
                proposed.x = snap(newLeft);
                proposed.width = snap(newLeftW);
              }
              break;
            case 'bottom':
              proposed.height = snap(clamp(startH + dy, MIN_SIZE, containerSize.height - proposed.y));
              break;
            case 'top':
              const newTopH = startH - dy;
              const newTop = startTop + dy;
              if (newTopH >= MIN_SIZE && newTop >= 0) {
                proposed.y = snap(newTop);
                proposed.height = snap(newTopH);
              }
              break;
            case 'top-left':
              const tlW = startW - dx;
              const tlH = startH - dy;
              const tlX = startLeft + dx;
              const tlY = startTop + dy;
              if (tlW >= MIN_SIZE && tlH >= MIN_SIZE && tlX >= 0 && tlY >= 0) {
                proposed.x = snap(tlX);
                proposed.y = snap(tlY);
                proposed.width = snap(tlW);
                proposed.height = snap(tlH);
              }
              break;
            case 'top-right':
              const trW = startW + dx;
              const trH = startH - dy;
              const trY = startTop + dy;
              if (trW >= MIN_SIZE && trH >= MIN_SIZE && trY >= 0) {
                proposed.y = snap(trY);
                proposed.width = snap(trW);
                proposed.height = snap(trH);
              }
              break;
            case 'bottom-left':
              const blW = startW - dx;
              const blH = startH + dy;
              const blX = startLeft + dx;
              if (blW >= MIN_SIZE && blH >= MIN_SIZE && blX >= 0) {
                proposed.x = snap(blX);
                proposed.width = snap(blW);
                proposed.height = snap(blH);
              }
              break;
            case 'bottom-right':
              proposed.width = snap(clamp(startW + dx, MIN_SIZE, containerSize.width - proposed.x));
              proposed.height = snap(clamp(startH + dy, MIN_SIZE, containerSize.height - proposed.y));
              break;
          }

          proposed.desiredWidth = proposed.width;
          proposed.desiredHeight = proposed.height;

          if (!wouldOverlap(proposed, prev, areaId)) {
            return proposed;
          }

          return next;
        });
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setAreas(prev => scaleAreasToContainer(prev));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    if (areas.length > 0) {
      setAreas(prev => scaleAreasToContainer(prev));
    }
  }, [containerSize]);

  const totalArea = containerSize.width * containerSize.height;
  const areasWithPercent = areas.map(area => {
    const areaPx = area.width * area.height;
    const percent = totalArea > 0 ? ((areaPx / totalArea) * 100).toFixed(1) : '0.0';
    return { ...area, percent };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-700/60 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Coal Washery Area Division
          </h1>
        </div>

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="relative bg-gray-900/40 backdrop-blur-sm border border-gray-700/70 rounded-2xl overflow-hidden shadow-2xl h-[75vh] min-h-[500px]"
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(99,102,241,0.08) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(99,102,241,0.08) 1px, transparent 1px)`,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            }}
          />

          {/* Areas */}
          {areas.map(area => (
            <div
              key={area.id}
              className="absolute bg-gradient-to-br from-indigo-900/40 to-purple-900/30 border border-indigo-500/50 rounded-lg shadow-lg flex items-center justify-center text-4xl md:text-5xl font-bold text-white backdrop-blur-sm transition-all duration-200 hover:border-indigo-400 hover:shadow-indigo-500/20"
              style={{
                left: `${area.x}px`,
                top: `${area.y}px`,
                width: `${area.width}px`,
                height: `${area.height}px`,
              }}
            >
              {area.label}

              {/* Resize handles */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-16 bg-gray-800/80 hover:bg-indigo-600/90 cursor-col-resize z-20 rounded-r" onMouseDown={startResize(area.id, 'left')} />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-16 bg-gray-800/80 hover:bg-indigo-600/90 cursor-col-resize z-20 rounded-l" onMouseDown={startResize(area.id, 'right')} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-6 bg-gray-800/80 hover:bg-indigo-600/90 cursor-row-resize z-20 rounded-b" onMouseDown={startResize(area.id, 'top')} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-6 bg-gray-800/80 hover:bg-indigo-600/90 cursor-row-resize z-20 rounded-t" onMouseDown={startResize(area.id, 'bottom')} />
              <div className="absolute top-0 left-0 w-8 h-8 bg-gray-800/80 hover:bg-indigo-600/90 cursor-nwse-resize z-20 rounded-br" onMouseDown={startResize(area.id, 'top-left')} />
              <div className="absolute top-0 right-0 w-8 h-8 bg-gray-800/80 hover:bg-indigo-600/90 cursor-nesw-resize z-20 rounded-bl" onMouseDown={startResize(area.id, 'top-right')} />
              <div className="absolute bottom-0 left-0 w-8 h-8 bg-gray-800/80 hover:bg-indigo-600/90 cursor-nesw-resize z-20 rounded-tr" onMouseDown={startResize(area.id, 'bottom-left')} />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800/80 hover:bg-indigo-600/90 cursor-nwse-resize z-20 rounded-tl" onMouseDown={startResize(area.id, 'bottom-right')} />
            </div>
          ))}
        </div>

        {/* Area Distribution Table */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/70 rounded-2xl p-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-6 text-indigo-300 flex items-center gap-3">
            <MoveHorizontal className="w-6 h-6" />
            Area Distribution
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-300">
                  <th className="py-4 text-left pl-4">ID</th>
                  <th className="py-4 text-left">Label</th>
                  <th className="py-4 text-right pr-8">Width (px)</th>
                  <th className="py-4 text-right pr-8">Height (px)</th>
                  <th className="py-4 text-right pr-8">Area (px²)</th>
                  <th className="py-4 text-right pr-8">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {areasWithPercent.map(area => (
                  <tr key={area.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition">
                    <td className="py-4 pl-4 font-medium text-indigo-300">{area.id}</td>
                    <td className="py-4">{area.label}</td>
                    <td className="py-4 text-right pr-8">{area.width}</td>
                    <td className="py-4 text-right pr-8">{area.height}</td>
                    <td className="py-4 text-right pr-8 font-mono">{(area.width * area.height).toLocaleString()}</td>
                    <td className="py-4 text-right pr-8 font-bold text-cyan-400">{area.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          • Areas snap to {GRID_SIZE}px grid • Minimum size: {MIN_SIZE}px • Cannot overlap
        </div>
      </div>
    </div>
  );
} 