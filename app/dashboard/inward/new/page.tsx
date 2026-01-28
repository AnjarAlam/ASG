"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  Globe,
  Building,
} from "lucide-react";

import GlobalInwardForm from "../../../components/globalInwardForm";
import LocalInwardForm from "../../../components/localInwardForm";

export default function InwardEntryPage() {
  const router = useRouter();

  // ── Generate consistent daily-incrementing token ───────────────────────
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    function generateInwardToken(): string {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const sec = String(now.getSeconds()).padStart(2, "0");

      const dateKey = `${yyyy}-${mm}-${dd}`;
      const storageKey = `inward-token-counter-${dateKey}`;

      // Get or initialize counter
      let count = Number(localStorage.getItem(storageKey) || "0");
      count += 1; // increment by 1
      localStorage.setItem(storageKey, String(count));

      // Format: TI-YYYY-MM-DD:HHMMSS-XXX
      return `TI-${dateKey}:${hh}${min}${sec}-${count.toString().padStart(3, "0")}`;
    }

    const newToken = generateInwardToken();
    setToken(newToken);
  }, []);

  // ── Form Type Toggle ──────────────────────────────────────────────────
  const [formType, setFormType] = useState<"global" | "local">("global");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-12">
      {/* ── Sticky Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-gray-800/60 bg-gray-950/80 px-4 py-5 sm:px-6 sm:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
          {/* Title + Icon */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/30">
              <ArrowDownToLine className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                New Inward Entry
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Record incoming coal / material
              </p>
            </div>
          </div>

          {/* Toggle: Global ↔ Local */}
          <div className="inline-flex rounded-full bg-gray-900/70 p-1.5 border border-gray-800/60 backdrop-blur-md shadow-inner">
            <button
              onClick={() => setFormType("global")}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${
                  formType === "global"
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/40 scale-105"
                    : "text-gray-300 hover:bg-gray-800/70"
                }
              `}
            >
              <Globe className="h-4 w-4" />
              Global (ASG)
            </button>

            <button
              onClick={() => setFormType("local")}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${
                  formType === "local"
                    ? "bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-900/40 scale-105"
                    : "text-gray-300 hover:bg-gray-800/70"
                }
              `}
            >
              <Building className="h-4 w-4" />
              Local (AIN)
            </button>
          </div>
        </div>
      </header>

      {/* ── Token Display ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border border-violet-800/30 rounded-xl px-6 py-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1 font-medium">
                Inward Token
              </p>
              {token ? (
                <p className="text-xl sm:text-2xl font-mono font-bold text-violet-300 tracking-wider">
                  {token}
                </p>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-t-transparent border-gray-400 rounded-full animate-spin" />
                  <span>Generating token...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  formType === "global" ? "bg-indigo-500" : "bg-violet-500"
                }`}
              ></span>
              {formType === "global" ? "Global (ASG)" : "Local (AIN)"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Content ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {formType === "global" ? (
          <GlobalInwardForm inwardToken={token} /> 
        ) : (
          <LocalInwardForm inwardToken={token} />  
        )}
      </main>
    </div>
  );
}