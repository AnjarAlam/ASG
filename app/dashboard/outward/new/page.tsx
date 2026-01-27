"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpFromLine,
  Globe,
  Building,
} from "lucide-react";

import GlobalOutwardForm from "../../../components/globalOutwardForm";
import LocalOutwardForm from "../../../components/localOutwardForm";

export default function OutwardEntryPage() {
  const router = useRouter();

  const [formType, setFormType] = useState<"global" | "local">("global");


const [token] = useState(() => {
  function generateOutwardToken(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const sec = String(now.getSeconds()).padStart(2, "0");

    const dateKey = `${yyyy}-${mm}-${dd}`;
    const storageKey = `outward-token-counter-${dateKey}`;

    let count = Number(localStorage.getItem(storageKey) || "0");
    count += 1;
    localStorage.setItem(storageKey, String(count));

    return `TO-${dateKey}:${hh}${min}${sec}-${count.toString().padStart(3, "0")}`;
  }

  return generateOutwardToken();
});



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-12">
      {/* ── Sticky Header with Toggle ───────────────────────────────── */}
      <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-gray-800/60 bg-gray-950/80 px-4 py-5 sm:px-6 sm:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-lg shadow-emerald-900/30">
              <ArrowUpFromLine className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                New Outward Entry
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Record outgoing coal / material
              </p>
            </div>
          </div>

          {/* Toggle: Global (ASG) ↔ Local (AIN) */}
          <div className="inline-flex rounded-full bg-gray-900/70 p-1.5 border border-gray-800/60 backdrop-blur-md">
            <button
              onClick={() => setFormType("global")}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${formType === "global"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/40"
                  : "text-gray-300 hover:bg-gray-800/70"}
              `}
            >
              <Globe className="h-4 w-4" />
              ASG
            </button>

            <button
              onClick={() => setFormType("local")}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${formType === "local"
                  ? "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-900/40"
                  : "text-gray-300 hover:bg-gray-800/70"}
              `}
            >
              <Building className="h-4 w-4" />
              AIN
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
                Outward Token
              </p>
              {token ? (
                <p className="text-xl sm:text-2xl font-mono font-bold text-violet-300 tracking-wider">
                  {token}
                </p>
              ) : (
                <p className="text-xl text-gray-500 animate-pulse">
                  Generating token...
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>
              {formType === "global" ? "Global (ASG)" : "Local (AIN)"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Content ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {formType === "global" ? (
          <GlobalOutwardForm outwardToken={token} />
        ) : (
          <LocalOutwardForm outwardToken={token} />
        )}
      </main>
    </div>
  );
}