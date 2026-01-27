"use client";

import { create } from "zustand";
import axios from "@/lib/axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export enum VehicleSize {
  SMALL = "SMALL",
  LARGE = "LARGE",
}

export type OutwardType = "GLOBAL" | "LOCAL";

export interface CreateLocalOutwardPayload {
  vehicleNumber: string;
  customerName: string;
  tokenNumber: string;
  vehicleSize: VehicleSize;
  munshiana: string;
  note: string;
  coalGrade: string;
  coalType: string;
  coalSize: string;
  area: string;
  grossWeight: number;
  tareWeight: number;
  dispatchDateTime: string;
  gst: string;
  billingRate: string;
  actualRate: string;
  tcsRate: string | number;
  labourIds: string[];
  instructions: string[];
  halfBilling?: number | string;
  halfWeightBilling?: number | string;
  differentMaterial?: string;
  images?: string[];
  documents?: string[];
}

interface OutwardLocalStore {
  loading: boolean;
  error: string | null;
  createLocalOutward: (payload: CreateLocalOutwardPayload) => Promise<void>;
}

export const useOutwardLocalStore = create<OutwardLocalStore>((set) => ({
  loading: false,
  error: null,

  createLocalOutward: async (payload) => {
    try {
      set({ loading: true, error: null });

      await axios.post(
        `${API_BASE_URL}/outward/create-local-outward`,
        payload
      );

      set({ loading: false });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to create local outward entry";

      set({
        loading: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  },
}));