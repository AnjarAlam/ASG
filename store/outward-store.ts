import { create } from "zustand";
import axios from "@/lib/axios";

/* ===================== ENUMS ===================== */

export enum VehicleSize {
  SMALL = "SMALL",
  LARGE = "LARGE",
}

export type OutwardType = "GLOBAL" | "LOCAL";

/* ===================== ENTITY INTERFACE ===================== */

export interface Outward {
  _id: string;

  // Vehicle & Token
  vehicleNumber: string;
  tokenNumber: string;
  vehicleSize: VehicleSize;

  // Customer / Party
  customerName: string;

  // Transport / Driver
  destination?: string;
  transportingFee?: string;     // or number if you prefer
  advanceFee?: string;
  driverName?: string;
  driverContact?: string;

  // Documents / DO / Challan
  doNumber?: string;
  challanNumber?: string;
  munshiana?: string;
  note?: string;

  // Dispatch Time
  dispatchDateTime: string;

  // Coal Details
  coalGrade: string;            // "B" | "E" | "F"
  coalType: string;             // "ROM" | "STEAM" | "BOULDERS" | "REJECTED"
  coalSize: string;             // "0-10" | "10-20" | ... | "80-175"

  // Area
  area: string;                 // "A" | "B" | ... | "G"

  // Weights (kept as string to match form / JSON consistency)
  grossWeight: string;
  tareWeight: string;
  netWeight: string;            // usually calculated

  // Billing & Rates
  billingRate?: string;
  actualRate?: string;
  tcsRate?: string;
  gst?: string;                 // "18%" or "18"

  // Labour
  labourIds?: string[];

  // Instructions / Special
  instructions?: string[];

  // Billing variants (from your form)
  halfBilling?: string | number;
  halfWeightBilling?: string | number;
  differentMaterial?: string;

  // Documents & Media
  images: string[];
  documents: string[];

  // Type & Audit
  outwardType: OutwardType;
  createdBy: string;
  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}

/* ===================== STORE STATE & ACTIONS ===================== */

interface OutwardState {
  outwards: Outward[];           // GLOBAL outwards (paginated)
  localOutwards: Outward[];      // LOCAL outwards (all)
  loading: boolean;
  error: string | null;

  // Pagination (only for GLOBAL)
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  // Actions
  createOutward: (data: Partial<Outward>) => Promise<void>;
  fetchOutwards: (page?: number, limit?: number) => Promise<void>;
  fetchLocalOutwards: () => Promise<void>;
  getOutwardById: (id: string) => Promise<Outward | null>;
  updateOutward: (id: string, data: Partial<Outward>) => Promise<void>;
  deleteOutward: (id: string) => Promise<void>;
}

/* ===================== ZUSTAND STORE ===================== */

export const useOutwardStore = create<OutwardState>((set, get) => ({
  outwards: [],
  localOutwards: [],
  loading: false,
  error: null,

  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,

  /* ── CREATE (GLOBAL or LOCAL) ─────────────────────────────────────── */
  createOutward: async (data) => {
    try {
      set({ loading: true, error: null });

      const isLocal = data.outwardType === "LOCAL";
      const endpoint = isLocal
        ? "/outward/create-local-outward"
        : "/outward/create-outward";

      await axios.post(endpoint, data);

      // Refresh appropriate list
      if (isLocal) {
        await get().fetchLocalOutwards();
      } else {
        await get().fetchOutwards(get().page, get().limit);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to create outward entry";
      set({ error: message });
      console.error("[createOutward]", message, err);
    } finally {
      set({ loading: false });
    }
  },

  /* ── FETCH PAGINATED GLOBAL OUTWARDS ──────────────────────────────── */
  fetchOutwards: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.get("/outward/all", {
        params: { page, limit },
      });

      const data = res.data;
      set({
        outwards: data.outwards || data.data?.outwards || [],
        total: data.meta?.total || 0,
        totalPages: data.meta?.totalPages || 1,
        page,
        limit,
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to fetch global outwards";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  /* ── FETCH ALL LOCAL OUTWARDS (no pagination) ─────────────────────── */
  fetchLocalOutwards: async () => {
    try {
      set({ loading: true, error: null });

      const res = await axios.get("/outward/get-local");
      set({ localOutwards: res.data || [] });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to fetch local outwards";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  /* ── GET SINGLE OUTWARD BY ID ─────────────────────────────────────── */
  getOutwardById: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.get(`/outward/${id}`);
      return (res.data.data || res.data || null) as Outward | null;
    } catch (err) {
      set({ error: "Failed to fetch outward details" });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  /* ── UPDATE OUTWARD ───────────────────────────────────────────────── */
  updateOutward: async (id: string, data: Partial<Outward>) => {
    try {
      set({ loading: true, error: null });

      await axios.patch(`/outward/update/${id}`, data);

      // Refresh both lists (safe approach)
      await Promise.all([
        get().fetchOutwards(get().page, get().limit),
        get().fetchLocalOutwards(),
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update outward";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  /* ── SOFT DELETE ──────────────────────────────────────────────────── */
  deleteOutward: async (id: string) => {
    try {
      set({ loading: true, error: null });

      await axios.delete(`/outward/delete/${id}`);

      // Refresh both lists
      await Promise.all([
        get().fetchOutwards(get().page, get().limit),
        get().fetchLocalOutwards(),
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to delete outward";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },
}));