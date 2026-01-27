import { create } from "zustand";
import axios from "@/lib/axios";

/* ===================== ENUMS ===================== */

export enum VehicleSize {
  SMALL = "SMALL",
  LARGE = "LARGE",
}

export type OutwardType = "GLOBAL" | "LOCAL";

/* ===================== ENTITY TYPE ===================== */

export interface Outward {
  _id: string;

  // Vehicle
  vehicleNumber: string;
  tokenNumber?: string;
  vehicleSize: VehicleSize;

  // Customer / Party
  customerName: string;

  doNumber?: string;
  challanNumber?: string;
  munshiana?: string;
  note?: string;

  // Date & Time
  dispatchDateTime: string;

  // Coal
  coalGrade: string;
  coalType: string;
  coalSize: string;

  // Area / Destination
  area: string;

  // Weight
  grossWeight: number;
  tareWeight: number;
  netWeight: number;

  // Rates & Billing
  billingRate?: number;
  actualRate?: number;
  tcsRate?: number;

  // Labour (if applicable)
  labourIds?: string[];

  // Documents
  images: string[];
  documents: string[];

  outwardType: OutwardType;

  // Audit
  createdBy: string;
  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}

/* ===================== STORE STATE ===================== */

interface OutwardState {
  outwards: Outward[];
  localOutwards: Outward[];
  loading: boolean;
  error: string | null;

  // Pagination (only for GLOBAL outwards)
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  // Actions
  createOutward: (data: Partial<Outward>, isLocal?: boolean) => Promise<void>;
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

  /* ---------- CREATE (GLOBAL or LOCAL) ---------- */
  createOutward: async (data, isLocal = false) => {
    try {
      set({ loading: true, error: null });

      const endpoint = isLocal
        ? "/outward/create-local-outward"
        : "/outward/create-outward";

      await axios.post(endpoint, data);

      if (isLocal) {
        await get().fetchLocalOutwards();
      } else {
        await get().fetchOutwards(get().page, get().limit);
      }
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to create outward",
      });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- FETCH PAGINATED GLOBAL OUTWARDS ---------- */
  fetchOutwards: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.get("/outward/all", {
        params: { page, limit },
      });

      set({
        outwards: res.data.outwards || res.data.data?.outwards || [],
        total: res.data.meta?.total || 0,
        totalPages: res.data.meta?.totalPages || 1,
        page,
        limit,
      });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to fetch outwards",
      });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- FETCH LOCAL OUTWARDS (no pagination) ---------- */
  fetchLocalOutwards: async () => {
    try {
      set({ loading: true, error: null });

      const res = await axios.get("/outward/get-local");
      set({ localOutwards: res.data || [] });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to fetch local outwards",
      });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- GET SINGLE OUTWARD BY ID ---------- */
  getOutwardById: async (id) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.get(`/outward/${id}`);
      return res.data.data || res.data || null;
    } catch (err) {
      set({
        error: "Failed to fetch outward details",
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- UPDATE OUTWARD ---------- */
  updateOutward: async (id, data) => {
    try {
      set({ loading: true, error: null });

      await axios.patch(`/outward/update/${id}`, data);

      // Refresh both lists to be safe
      await Promise.all([
        get().fetchOutwards(get().page, get().limit),
        get().fetchLocalOutwards(),
      ]);
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to update outward",
      });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- SOFT DELETE ---------- */
  deleteOutward: async (id) => {
    try {
      set({ loading: true, error: null });

      await axios.delete(`/outward/delete/${id}`);

      // Refresh lists
      await Promise.all([
        get().fetchOutwards(get().page, get().limit),
        get().fetchLocalOutwards(),
      ]);
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to delete outward",
      });
    } finally {
      set({ loading: false });
    }
  },
}));