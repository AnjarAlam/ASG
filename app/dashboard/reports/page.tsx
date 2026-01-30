"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSearch, Filter, RefreshCw, Download } from "lucide-react";

import VehicleInwardMovements from "@/app/components/VehicleInwardReport";
import VehicleOutwardMovements from "@/app/components/vehicleOutwardReport";
import DOReportList from "@/app/components/DOReportList";
import LabourRecordsList from "@/app/components/LabourRecordsList";

// ── TYPES ────────────────────────────────────────────────
type ReportType =
  | "All Reports"
  | "Vehicle inward Movements"
  | "Outward Vehicle Movements"
  | "DO Reports"
  | "Labour Records";

interface ReportConfig {
  key: ReportType;
  title: string;
  component: React.ComponentType;
}

const reports: ReportConfig[] = [
  {
    key: "Vehicle inward Movements",
    title: "Vehicle Inward Movements",
    component: VehicleInwardMovements,
  },
  {
    key: "Outward Vehicle Movements",
    title: "Outward Vehicle Movements",
    component: VehicleOutwardMovements,
  },
  {
    key: "DO Reports",
    title: "DO Reports",
    component: DOReportList,
  },
  {
    key: "Labour Records",
    title: "Labour Records",
    component: LabourRecordsList,
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ReportType>("All Reports");

  // Filter reports to show
  const visibleReports =
    selectedType === "All Reports"
      ? reports
      : reports.filter((r) => r.key === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-16">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 lg:gap-120 ">
  {/* Left part */}
  <div className="flex items-center gap-4 sm:gap-5">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-xl flex-shrink-0">
      <FileSearch className="w-8 h-8 text-white" />
    </div>
    
    <div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        Reports & Analytics
      </h1>
      <p className="text-gray-400 mt-1 text-base md:text-lg">
        View and export operational reports
      </p>
    </div>
  </div>

  {/* Right part – dropdown */}
  <div className="w-full md:w-72 lg:w-80 min-w-[260px]">
    <label className="block text-sm text-gray-300 font-medium mb-1.5 md:mb-1">
      Report Type
    </label>
    <select
      value={selectedType}
      onChange={(e) => setSelectedType(e.target.value as ReportType)}
      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
    >
      <option value="All Reports">All Reports</option>
      {reports.map((report) => (
        <option key={report.key} value={report.key}>
          {report.title}
        </option>
      ))}
    </select>
  </div>
</div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-12">
        <div className="space-y-10">
          {visibleReports.map((report) => (
            <section
              key={report.key}
              className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 md:p-8 shadow-xl transition-all duration-200 hover:shadow-2xl"
            >
              <div className="mb-6 pb-4 border-b border-gray-800/60">
                <h3 className="text-2xl font-semibold text-indigo-300">
                  {report.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1.5">
                  Data for selected period • Last updated: just now
                </p>
              </div>

              <div className="overflow-x-auto">
                <report.component />
              </div>
            </section>
          ))}

          {visibleReports.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              No reports match the selected filter
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
