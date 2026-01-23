"use client";

import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-12">
      
      {/* ── Sticky Header with Toggle ───────────────────────────────── */}
      <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-gray-800/60 bg-gray-950/80 px-4 py-5 sm:px-6 sm:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Left - Title */}
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

          {/* Right - Toggle */}
          <div className="inline-flex rounded-full bg-gray-900/70 p-1.5 border border-gray-800/60 backdrop-blur-md">
            <button
              onClick={() => setFormType("global")}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${formType === "global"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-emerald-900/40"
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
                  ? "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg shadow-teal-900/40"
                  : "text-gray-300 hover:bg-gray-800/70"}
              `}
            >
              <Building className="h-4 w-4" />
              AIN
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-5">
        {formType === "global" ? <GlobalOutwardForm /> : <LocalOutwardForm />}
      </main>
    </div>
  );
}
