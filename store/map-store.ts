// src/store/mapStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Point = { x: number; y: number };

export interface Area {
  points: Point[];
  name: string;
  isClosed: boolean;
}

interface MapState {
  // Map metadata
  mapName: string;
  imageUrl: string;
  mapId?: string;        // when loaded from backend

  // Boundary (outer shape)
  boundaryPoints: Point[];
  isBoundaryClosed: boolean;

  // Areas (internal blocks)
  areas: Area[];
  currentAreaPoints: Point[];

  // UI / editing flags
  isDrawing: boolean;
  selectedAreaIndex: number | null;

  // Actions
  setMapName: (name: string) => void;
  setImageUrl: (url: string) => void;
  setMapId: (id?: string) => void;

  addBoundaryPoint: (point: Point) => void;
  closeBoundary: () => void;
  resetBoundary: () => void;

  startNewArea: () => void;
  addAreaPoint: (point: Point) => void;
  closeCurrentArea: (name?: string) => void;
  cancelCurrentArea: () => void;

  updateAreaName: (index: number, name: string) => void;
  deleteArea: (index: number) => void;

  setSelectedArea: (index: number | null) => void;

  resetAll: () => void;

  // For loading from backend
  loadFromBackend: (data: {
    name: string;
    imageUrl: string;
    layout: {
      boundary: Point[];
      areas: { name: string; areaCode: string; points: Point[] }[];
    };
  }) => void;

  // Prepare data for API
  getCreatePayload: () => {
    name: string;
    imageUrl: string;
    layout: {
      boundary: Point[];
      areas: { name: string; areaCode: string; points: Point[] }[];
    };
  };
}

export const useMapStore = create<MapState>()(
  devtools(
    persist(
      (set, get) => ({
        mapName: 'New Map',
        imageUrl: '/Map.png',
        mapId: undefined,

        boundaryPoints: [],
        isBoundaryClosed: false,

        areas: [],
        currentAreaPoints: [],

        isDrawing: true,
        selectedAreaIndex: null,

        setMapName: (name) => set({ mapName: name }),
        setImageUrl: (url) => set({ imageUrl: url }),
        setMapId: (id) => set({ mapId: id }),

        addBoundaryPoint: (point) =>
          set((state) => {
            if (state.isBoundaryClosed) return state;
            return { boundaryPoints: [...state.boundaryPoints, point] };
          }),

        closeBoundary: () =>
          set((state) => ({
            isBoundaryClosed: true,
            isDrawing: state.areas.length === 0,
          })),

        resetBoundary: () =>
          set({
            boundaryPoints: [],
            isBoundaryClosed: false,
            isDrawing: true,
          }),

        startNewArea: () =>
          set((state) => {
            if (!state.isBoundaryClosed) return state;
            return { currentAreaPoints: [] };
          }),

        addAreaPoint: (point) =>
          set((state) => {
            if (!state.isBoundaryClosed) return state;
            return {
              currentAreaPoints: [...state.currentAreaPoints, point],
            };
          }),

        closeCurrentArea: (name = '') =>
          set((state) => {
            if (state.currentAreaPoints.length < 3) return state;

            const newArea: Area = {
              points: [...state.currentAreaPoints],
              name: name || `Area ${state.areas.length + 1}`,
              isClosed: true,
            };

            return {
              areas: [...state.areas, newArea],
              currentAreaPoints: [],
            };
          }),

        cancelCurrentArea: () => set({ currentAreaPoints: [] }),

        updateAreaName: (index, name) =>
          set((state) => ({
            areas: state.areas.map((area, i) =>
              i === index ? { ...area, name } : area
            ),
          })),

        deleteArea: (index) =>
          set((state) => ({
            areas: state.areas.filter((_, i) => i !== index),
          })),

        setSelectedArea: (index) => set({ selectedAreaIndex: index }),

        resetAll: () =>
          set({
            mapName: 'New Map',
            boundaryPoints: [],
            isBoundaryClosed: false,
            areas: [],
            currentAreaPoints: [],
            selectedAreaIndex: null,
            isDrawing: true,
          }),

        loadFromBackend: (data) =>
          set({
            mapName: data.name,
            imageUrl: data.imageUrl,
            boundaryPoints: data.layout.boundary,
            isBoundaryClosed: true,
            areas: data.layout.areas.map((a) => ({
              points: a.points,
              name: a.name,
              isClosed: true,
            })),
            currentAreaPoints: [],
            isDrawing: false,
          }),

        getCreatePayload: () => {
          const state = get();
          return {
            name: state.mapName,
            imageUrl: state.imageUrl,
            layout: {
              boundary: state.boundaryPoints,
              areas: state.areas.map((area, i) => ({
                name: area.name,
                areaCode: area.name
                  .toUpperCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^A-Z0-9-]/g, '')
                  .slice(0, 12) || `A${i + 1}`,
                points: area.points,
              })),
            },
          };
        },
      }),
      {
        name: 'map-editor-storage',
        partialize: (state) => ({
          mapName: state.mapName,
          imageUrl: state.imageUrl,
          boundaryPoints: state.boundaryPoints,
          isBoundaryClosed: state.isBoundaryClosed,
          areas: state.areas,
        }),
      }
    )
  )
);