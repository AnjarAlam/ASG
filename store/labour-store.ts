"use client";

import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";


export interface LabourRecord {
  _id: string;
  labourAgentName: string;
  agentPhone: string;
  mukhiyaName: string;
  mukhiyaPhone: string;
  village: string;

  totalLabour: number;
  // checkIn: string;
  // checkOut: string;

  ratePerLabour: number;
  totalWages: number;
  transportFee: number;

  documents: string[];

  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LabourApiResponse {
  message: string;
  data: LabourRecord | LabourRecord[];
}

interface LabourListApiResponse {
  message: string;
  data: {
    message: string;
    meta: PaginationMeta;
    data: LabourRecord[];
  };
}

interface LabourState {
  records: LabourRecord[];
  selectedRecord: LabourRecord | null;
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;

  fetchRecords: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchRecordById: (id: string) => Promise<void>;
  createRecord: (payload: any) => Promise<boolean>;
  clear: () => void;
}


export const useLabourStore = create<LabourState>((set) => ({
  records: [],
  selectedRecord: null,
  pagination: null,
  loading: false,
  error: null,

  fetchRecords: async ({ page = 1, limit = 20 } = {}) => {
    if (!API_BASE_URL) {
      set({ error: "API base URL not configured", loading: false });
      return;
    }

    set({ loading: true, error: null });

    try {
      const res = await axios.get<LabourListApiResponse>(
        `${API_BASE_URL}/labour-detail/all`,
        {
          params: { page, limit },
          timeout: 15000,
        }
      );

      const apiData = res.data.data;

      set({
        records: apiData?.data ?? [],
        pagination: apiData?.meta ?? null,
        loading: false,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to fetch records";
      set({ loading: false, error: msg });
      console.error("Fetch records error:", err);
    }
  },

  fetchRecordById: async (id: string) => {
    if (!API_BASE_URL) {
      set({ error: "API base URL not configured" });
      return;
    }

    set({ loading: true, error: null });

    try {
      const res = await axios.get<LabourApiResponse>(
        `${API_BASE_URL}/labour-detail/${id}`,
        { timeout: 15000 }
      );

      const record = res.data.data as LabourRecord;

      set({
        selectedRecord: record,
        loading: false,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to fetch record";
      set({ loading: false, error: msg });
      console.error("Fetch single record error:", err);
    }
  },

  createRecord: async (payload) => {
    if (!API_BASE_URL) {
      alert("API URL not configured");
      return false;
    }

    set({ loading: true, error: null });

    try {
      await axios.post(
        `${API_BASE_URL}/labour-detail/create`,
        payload,
        { timeout: 15000 }
      );

      set({ loading: false });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create record";
      set({ loading: false, error: msg });
      console.error("Create record error:", err);
      return false;
    }
  },

  clear: () =>
    set({
      records: [],
      selectedRecord: null,
      pagination: null,
      loading: false,
      error: null,
    }),
}));