"use client";

import { create } from "zustand";
import axios from "axios";

/* =======================
   API CONFIG
======================= */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.29.23:8000";

/* =======================
   TYPES (MATCH BACKEND)
======================= */
export interface DOReport {
  _id: string;
  doNumber: string;
  supplier: string;
  volume: string;
  rate: string;

  financerName: string;
  financerOrganization: string;
  financerCost: string;

  issueDate: string;
  expiryDate: string;

  lifterName?: string;
  lifterCharges: string;
  transportCharges: string;

  liftedQty: string;
  liftedvehicleCount: string;

  createdAt: string;
}

export interface CreateDOReportPayload {
  doNumber: string;
  supplier: string;
  volume: string;
  rate: string;

  financerName: string;
  financerOrganization: string;
  financerCost: string;

  issueDate: string;
  expiryDate: string;

  lifterName?: string;
  lifterCharges: string;
  transportCharges: string;

  liftedQty: string;
  liftedvehicleCount: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DOStore {
  loading: boolean;
  error: string | null;

  doReports: DOReport[];
  meta: PaginationMeta | null;

  fetchByDoNumber: (doNumber: string) => Promise<void>;
  fetchAll: (page?: number, limit?: number) => Promise<void>;
  createDOReport: (payload: CreateDOReportPayload) => Promise<boolean>;
  clearStore: () => void;
}

/* =======================
   AXIOS INSTANCE
======================= */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =======================
   ZUSTAND STORE
======================= */
export const useDOStore = create<DOStore>((set) => ({
  loading: false,
  error: null,
  doReports: [],
  meta: null,

  /* 🔹 Fetch by DO Number */
  fetchByDoNumber: async (doNumber: string) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get<DOReport[]>(`/do-report/do-number/${doNumber}`);

      set({
        doReports: res.data,
        loading: false,
      });
    } catch (err: any) {
      set({
        error:
          err?.response?.data?.message ||
          err.message ||
          "Failed to fetch DO report",
        loading: false,
      });
    }
  },

  /* 🔹 Fetch All DO Reports (Pagination) */
  fetchAll: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/do-report/all`, {
        params: { page, limit },
      });

      set({
        doReports: res.data.data,
        meta: res.data.meta,
        loading: false,
      });
    } catch (err: any) {
      set({
        error:
          err?.response?.data?.message ||
          err.message ||
          "Failed to fetch DO reports",
        loading: false,
      });
    }
  },

  /* 🔹 CREATE DO REPORT */
  createDOReport: async (payload) => {
    try {
      set({ loading: true, error: null });

      await api.post("/do-report/create-do-report", payload);

      // refresh first page after create
      const res = await api.get(`/do-report/all`, {
        params: { page: 1, limit: 10 },
      });

      set({
        doReports: res.data.data,
        meta: res.data.meta,
        loading: false,
      });

      return true;
    } catch (err: any) {
      set({
        error:
          err?.response?.data?.message ||
          err.message ||
          "Failed to create DO report",
        loading: false,
      });

      return false;
    }
  },

  /* 🔹 Clear Store */
  clearStore: () => {
    set({
      doReports: [],
      meta: null,
      error: null,
      loading: false,
    });
  },
}));
