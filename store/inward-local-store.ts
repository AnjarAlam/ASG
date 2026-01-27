"use client";

import { create } from "zustand";
import axios from "axios";

/* ======================
   API CONFIG
====================== */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ======================
   TYPES (DTO MATCH)
====================== */
export enum VehicleSize {
  SMALL = "SMALL",
  LARGE = "LARGE",
}

export type InwardType = "GLOBAL" | "LOCAL";

export interface CreateLocalInwardPayload {
  vehicleNumber: string;
  tokenNumber: string;
  vehicleSize: VehicleSize;
  supplierName: string;
  supplier: string;
  inwardDateTime: string;

  coalGrade: string;
  coalType: string;
  coalSize: string;
  area: string;

  grossWeight: number;
  tareWeight: number;
  netWeight?: number;
  inwardType: InwardType;

  images?: string[];
  documents?: string[];
}

/* ======================
   STORE STATE
====================== */
interface InwardLocalStore {
  loading: boolean;
  error: string | null;

  createLocalInward: (payload: CreateLocalInwardPayload) => Promise<void>;
}

/* ======================
   ZUSTAND STORE
====================== */
export const useInwardLocalStore = create<InwardLocalStore>((set) => ({
  loading: false,
  error: null,

  createLocalInward: async (payload) => {
    try {
      set({ loading: true, error: null });

      await axios.post(
        `${API_BASE_URL}/inward/create-local-inward`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      set({ loading: false });
    } catch (err: any) {
      console.error("Local inward error:", err);

      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          "Failed to create local inward entry",
      });

      throw err;
    }
  },
}));
