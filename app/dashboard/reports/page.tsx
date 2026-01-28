"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileSearch,
  Filter,
  Calendar,
  MapPin,
  Layers,
  Truck,
  AlertTriangle,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import VehicleInwardMovements from "@/app/components/VehicleInwardReport";
import VehicleOutwardMovements from "@/app/components/vehicleOutwardReport";
import DOReportList from "@/app/components/DOReportList";
import LabourRecordsList from "@/app/components/LabourRecordsList";

/* ---------------- TYPES ---------------- */
type ReportType =
  | "Inventory Snapshot"
  | "Movement Summary"
  | "Vehicle Utilization"
  | "Rejected Coal Analysis"
  | "Area Performance";

/* ---------------- MOCK DATA ---------------- */
const recentVehicleActivity = [
  {
    time: "16:42",
    vehicle: "CG04 MA 7845",
    type: "Tipper",
    action: "Entered",
    status: "success",
  },
  {
    time: "16:35",
    vehicle: "CG07 KB 2319",
    type: "Trailer",
    action: "Exited",
    status: "success",
  },
  {
    time: "16:28",
    vehicle: "CG04 JK 1190",
    type: "Tipper",
    action: "Waiting >45min",
    status: "warning",
  },
  {
    time: "16:15",
    vehicle: "CG12 PL 4502",
    type: "Dumper",
    action: "Entered",
    status: "success",
  },
  {
    time: "15:58",
    vehicle: "CG08 TR 6721",
    type: "Trailer",
    action: "Exited",
    status: "success",
  },
];

const weighbridgeDailySummary = [
  {
    date: "12-01-2026",
    vehicleIn: 42,
    vehicleOut: 39,
    inwardWt: 1240,
    outwardWt: 1185,
  },
  {
    date: "13-01-2026",
    vehicleIn: 31,
    vehicleOut: 29,
    inwardWt: 980,
    outwardWt: 945,
  },
  {
    date: "14-01-2026",
    vehicleIn: 38,
    vehicleOut: 36,
    inwardWt: 1120,
    outwardWt: 1090,
  },
];

/* ---------------- PAGE ---------------- */
export default function ReportsPage() {
  const router = useRouter();
  const [reportType, setReportType] =
    useState<ReportType>("Inventory Snapshot");

  // Download Weighbridge Summary as CSV
  const handleDownloadWeighbridge = () => {
    if (weighbridgeDailySummary.length === 0) return;

    const headers = [
      "Date",
      "Vehicles In",
      "Vehicles Out",
      "Inward (MT)",
      "Outward (MT)",
      "Net (MT)",
    ];

    const rows = weighbridgeDailySummary.map((row) => {
      const net = row.inwardWt - row.outwardWt;
      return [
        row.date,
        row.vehicleIn,
        row.vehicleOut,
        row.inwardWt,
        row.outwardWt,
        net,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `weighbridge_summary_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download Vehicle Movements as CSV
  const handleDownloadVehicleLogs = () => {
    if (recentVehicleActivity.length === 0) return;

    const headers = ["Time", "Vehicle Number", "Type", "Action", "Status"];

    const rows = recentVehicleActivity.map((item) => [
      item.time,
      item.vehicle,
      item.type,
      item.action,
      item.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `vehicle_movements_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-10">
      {/* ================= HEADER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg">
              <FileSearch className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Reports & Analytics
              </h1>
              <p className="text-gray-400 mt-1.5">
                Generate, analyze and export operational reports
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-12">
        {/* ================= REPORT GENERATOR ================= */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold">Generate Report</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm text-gray-400 font-medium">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              >
                <option>Inventory Snapshot</option>
                <option>Movement Summary</option>
                <option>Vehicle Utilization</option>
                <option>Rejected Coal Analysis</option>
                <option>Area Performance</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm text-gray-400 font-medium">
                From Date
              </label>
              <input
                type="date"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm text-gray-400 font-medium">
                To Date
              </label>
              <input
                type="date"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {reportType !== "Vehicle Utilization" && (
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-400 font-medium">
                  Area
                </label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
                  <option>All Areas</option>
                  {["A", "B", "C", "D", "E", "F", "G"].map((a) => (
                    <option key={a}>Area {a}</option>
                  ))}
                </select>
              </div>
            )}

            {(reportType === "Inventory Snapshot" ||
              reportType === "Rejected Coal Analysis") && (
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-400 font-medium">
                  Grade
                </label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
                  <option>All Grades</option>
                  <option>E</option>
                  <option>F</option>
                  <option>B</option>
                </select>
              </div>
            )}

            {(reportType === "Vehicle Utilization" ||
              reportType === "Movement Summary") && (
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-400 font-medium">
                  Vehicle Number
                </label>
                <input
                  placeholder="e.g. CG04 MA 7845"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={() => router.push("/dashboard/reports/view")}
              className="flex-1 sm:flex-none min-w-[180px] px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Export as PDF
            </button>

            <button className="flex-1 sm:flex-none min-w-[180px] px-6 py-3 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200 font-medium rounded-xl transition-all flex items-center justify-center gap-2">
              <Download size={18} />
              Export as CSV
            </button>
          </div>
        </section>


        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <VehicleInwardMovements />
        </section>
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <VehicleOutwardMovements />
        </section>
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <DOReportList />
        </section>
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <LabourRecordsList />
        </section>
      </main>
    </div>
  );
}
