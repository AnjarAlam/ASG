import { create } from "zustand";
import axios from "@/lib/axios";

/* ===================== ENUMS ===================== */

export enum VehicleSize {
  SMALL = "SMALL",
  LARGE = "LARGE",
} 

export type InwardType = "GLOBAL" | "LOCAL";

/* ===================== ENTITY TYPE ===================== */

export interface Inward {
  _id: string;

  // Vehicle
  vehicleNumber: string;
  tokenNumber: string;
  vehicleSize: VehicleSize;

  // Supplier
  supplierName: string;
  supplier: string; // COLLIARY | PARTY

  doNumber?: string;
  munshiana?: string;
  note?: string;

  // Date & Time
  inwardDateTime: string;

  // Coal
  coalGrade: string;
  coalType: string;
  coalSize: string;

  // Area
  area: string;

  // Weight
  grossWeight: string;
  tareWeight: string;
  netWeight: string;

  overloadingWeight?: string;
  overloadingRate?: string;
  overloadingAmount?: string;

  rstNumber: string;

  // Documents
  images: string[];
  documents: string[];

  inwardType: InwardType;

  // Audit
  createdBy: string;
  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}

/* ===================== STORE STATE ===================== */

interface InwardState {
  inwards: Inward[];
  localInwards: Inward[];
  loading: boolean;
  error: string | null;

  // Pagination
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  // Actions
  createInward: (data: Partial<Inward>) => Promise<void>;
  fetchInwards: (page?: number, limit?: number) => Promise<void>;
  fetchLocalInwards: () => Promise<void>;
  getInwardById: (id: string) => Promise<Inward | null>;
  updateInward: (id: string, data: Partial<Inward>) => Promise<void>;
  deleteInward: (id: string) => Promise<void>;
}

/* ===================== ZUSTAND STORE ===================== */

export const useInwardStore = create<InwardState>((set, get) => ({
  inwards: [],
  localInwards: [],
  loading: false,
  error: null,

  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,

  /* ---------- CREATE (GLOBAL / LOCAL) ---------- */
  createInward: async (data) => {
    console.log("creating")
    try {
      set({ loading: true, error: null });

      const endpoint =
        data.inwardType === "LOCAL"
          ? "/inward/create-local-inward"
          : "/inward/create-inward";

      console.log("endpoint", endpoint);

      await axios.post(endpoint, data);

      if (data.inwardType === "LOCAL") {
        await get().fetchLocalInwards();
      } else {
        await get().fetchInwards(get().page, get().limit);
      }
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to create inward",
      });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- FETCH ALL (PAGINATED) ---------- */
  fetchInwards: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.get("/inward/all", {
        params: { page, limit },
      });

      set({
        inwards: res.data.inwards,
        total: res.data.meta.total,
        totalPages: res.data.meta.totalPages,
        page,
        limit,
      });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to fetch inwards",
      });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- FETCH LOCAL ---------- */
  fetchLocalInwards: async () => {
    try {
      set({ loading: true, error: null });

      const res = await axios.get("/inward/get-local");
      set({ localInwards: res.data });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to fetch local inwards",
      });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- GET BY ID ---------- */
  getInwardById: async (id) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.get(`/inward/${id}`);
      return res.data.data as Inward;
    } catch {
      return null;
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- UPDATE ---------- */
  updateInward: async (id, data) => {
    try {
      set({ loading: true, error: null });

      await axios.patch(`/inward/update/${id}`, data);
      await get().fetchInwards(get().page, get().limit);
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to update inward",
      });
    } finally {
      set({ loading: false });
    }
  },

  /* ---------- SOFT DELETE ---------- */
  deleteInward: async (id) => {
    try {
      set({ loading: true, error: null });

      await axios.delete(`/inward/delete/${id}`);
      await get().fetchInwards(get().page, get().limit);
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to delete inward",
      });
    } finally {
      set({ loading: false });
    }
  },
}));
