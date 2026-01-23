"use client";

import { create } from "zustand";
import axios from "axios";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export interface LabourRecord {
  _id: string;
  labourAgentName: string;
  agentPhone: string;
  mukhiyaName: string;
  mukhiyaPhone: string;
  village: string;
  totalLabour: number;
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
  data: {
    message: string;
    meta: PaginationMeta;
    data: LabourRecord[];
  };
}

interface LabourState {
  records: LabourRecord[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;

  fetchRecords: (params?: { page?: number; limit?: number }) => Promise<void>;
  clear: () => void;
}


export const useLabourStore = create<LabourState>((set) => ({
  records: [],
  pagination: null,
  loading: false,
  error: null,

  fetchRecords: async ({ page = 1, limit = 10 } = {}) => {
    if (!API_BASE_URL) {
      console.error("❌ NEXT_PUBLIC_API_URL is missing");
      set({
        loading: false,
        error: "API URL not configured",
      });
      return;
    }

    set({ loading: true, error: null });
    console.log("➡️ Fetching labour records...");

    try {
      const res = await axios.get<LabourApiResponse>(
        `${API_BASE_URL}/labour-detail/all`,
        {
          params: { page, limit },
          timeout: 15000,
        }
      );

      console.log("✅ Labour API response:", res.data);

      const apiData = res.data.data;

      set({
        records: apiData.data ?? [],
        pagination: apiData.meta ?? null,
        loading: false,
      });
    } catch (err: any) {
      console.error("❌ Labour fetch error:", err);

      set({
        loading: false,
        error: err?.message || "Network error while fetching labour records",
      });
    }
  },

  clear: () =>
    set({
      records: [],
      pagination: null,
      loading: false,
      error: null,
    }),
}));
