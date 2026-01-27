import { create } from "zustand";
import { devtools } from "zustand/middleware"; // optional – very useful for debugging
import axios from "@/lib/axios"; // or use your preferred http client (fetch, etc.)

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.29.23:8000";

// Adjust these types according to your actual API response shape
export interface InventoryItem {
  _id: string;
  area: string;
  grade: "E" | "F" | "B";
  type: "ROM" | "STEAM" | "BOULDERS" | "REJECTED";
  size: "0-10" | "10-20" | "20-50" | "50-80" | "80-175";
  quantityMT: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface AreaSummary {
  _id: string; // area name
  totalQuantity: number;
}

export interface GradeSizeSummary {
  _id: {
    grade: string;
    size: string;
  };
  totalQuantity: number;
}

interface InventoryState {
  // Main data
  inventory: InventoryItem[];
  areaSummaries: AreaSummary[];
  gradeSizeSummaries: GradeSizeSummary[];

  // KPI related derived/computed values (we can compute them or fetch separately)
  totalStockMT: number;
  activeAreasCount: number;
  rejectedCoalMT: number;

  // UI states
  loading: boolean;
  error: string | null;

  // Actions
  fetchAllInventory: () => Promise<void>;
  fetchAreaWiseSummary: () => Promise<void>;
  fetchGradeSizeSummary: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Optional: if you want to update stock from frontend too (adjust/increase/decrease)
  // adjustStock: (dto: AdjustStockDto, mode: 'increase' | 'decrease') => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      inventory: [],
      areaSummaries: [],
      gradeSizeSummaries: [],

      totalStockMT: 0,
      activeAreasCount: 0,
      rejectedCoalMT: 0,

      loading: false,
      error: null,

      async fetchAllInventory() {
        set({ loading: true, error: null });
        try {
          const res = await axios.get(`${API_BASE_URL}/inventory`); // ← adjust your route
          // or: await axios.get('/api/inventory/all') if you use getAll()
          const data = res.data;

          // Assuming response shape from your findAll() or getAll()
          const items = Array.isArray(data) ? data : data.inventory || [];

          set({
            inventory: items,
            totalStockMT: items.reduce(
              (sum: number, it: InventoryItem) => sum + it.quantityMT,
              0,
            ),
            activeAreasCount: new Set(items.map((it: InventoryItem) => it.area))
              .size,
            rejectedCoalMT: items
              .filter((it: InventoryItem) => it.type === "REJECTED")
              .reduce(
                (sum: number, it: InventoryItem) => sum + it.quantityMT,
                0,
              ),
            loading: false,
          });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || "Failed to load inventory",
            loading: false,
          });
        }
      },

      async fetchAreaWiseSummary() {
        set({ loading: true, error: null });
        try {
          const res = await axios.get(`${API_BASE_URL}/inventory/summary/area`);
          set({ areaSummaries: res.data, loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },

      async fetchGradeSizeSummary() {
        set({ loading: true, error: null });
        try {
          const res = await axios.get(`${API_BASE_URL}/inventory/summary/grade-size`);
          set({ gradeSizeSummaries: res.data, loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },

      async refreshAll() {
        set({ loading: true });
        await Promise.all([
          get().fetchAllInventory(),
          get().fetchAreaWiseSummary(),
          // get().fetchGradeSizeSummary(),   // uncomment if you want to use it
        ]);
        set({ loading: false });
      },
    }),
    { name: "InventoryStore" }, // nice name in devtools
  ),
);
