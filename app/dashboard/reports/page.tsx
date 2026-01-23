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

/* ---------------- TYPES ---------------- */
type ReportType =
  | "Inventory Snapshot"
  | "Movement Summary"
  | "Vehicle Utilization"
  | "Rejected Coal Analysis"
  | "Area Performance";

/* ---------------- MOCK DATA ---------------- */
const recentVehicleActivity = [
  { time: "16:42", vehicle: "CG04 MA 7845", type: "Tipper", action: "Entered", status: "success" },
  { time: "16:35", vehicle: "CG07 KB 2319", type: "Trailer", action: "Exited", status: "success" },
  { time: "16:28", vehicle: "CG04 JK 1190", type: "Tipper", action: "Waiting >45min", status: "warning" },
  { time: "16:15", vehicle: "CG12 PL 4502", type: "Dumper", action: "Entered", status: "success" },
  { time: "15:58", vehicle: "CG08 TR 6721", type: "Trailer", action: "Exited", status: "success" },
];

const weighbridgeDailySummary = [
  { date: "12-01-2026", vehicleIn: 42, vehicleOut: 39, inwardWt: 1240, outwardWt: 1185 },
  { date: "13-01-2026", vehicleIn: 31, vehicleOut: 29, inwardWt: 980, outwardWt: 945 },
  { date: "14-01-2026", vehicleIn: 38, vehicleOut: 36, inwardWt: 1120, outwardWt: 1090 },
];

/* ---------------- PAGE ---------------- */
export default function ReportsPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState<ReportType>("Inventory Snapshot");

  // Download Weighbridge Summary as CSV
  const handleDownloadWeighbridge = () => {
    if (weighbridgeDailySummary.length === 0) return;

    const headers = ["Date", "Vehicles In", "Vehicles Out", "Inward (MT)", "Outward (MT)", "Net (MT)"];
    
    const rows = weighbridgeDailySummary.map(row => {
      const net = row.inwardWt - row.outwardWt;
      return [
        row.date,
        row.vehicleIn,
        row.vehicleOut,
        row.inwardWt,
        row.outwardWt,
        net
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `weighbridge_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download Vehicle Movements as CSV
  const handleDownloadVehicleLogs = () => {
    if (recentVehicleActivity.length === 0) return;

    const headers = ["Time", "Vehicle Number", "Type", "Action", "Status"];
    
    const rows = recentVehicleActivity.map(item => [
      item.time,
      item.vehicle,
      item.type,
      item.action,
      item.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vehicle_movements_${new Date().toISOString().split('T')[0]}.csv`);
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
              <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
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
              <label className="block text-sm text-gray-400 font-medium">Report Type</label>
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
              <label className="block text-sm text-gray-400 font-medium">From Date</label>
              <input
                type="date"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm text-gray-400 font-medium">To Date</label>
              <input
                type="date"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {reportType !== "Vehicle Utilization" && (
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-400 font-medium">Area</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
                  <option>All Areas</option>
                  {["A", "B", "C", "D", "E", "F", "G"].map((a) => (
                    <option key={a}>Area {a}</option>
                  ))}
                </select>
              </div>
            )}

            {(reportType === "Inventory Snapshot" || reportType === "Rejected Coal Analysis") && (
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-400 font-medium">Grade</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
                  <option>All Grades</option>
                  <option>E</option>
                  <option>F</option>
                  <option>B</option>
                </select>
              </div>
            )}

            {(reportType === "Vehicle Utilization" || reportType === "Movement Summary") && (
              <div className="space-y-1.5">
                <label className="block text-sm text-gray-400 font-medium">Vehicle Number</label>
                <input
                  placeholder="e.g. CG04 MA 7845"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <button onClick={() => router.push("/dashboard/reports/view")} className="flex-1 sm:flex-none min-w-[180px] px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2">
              <RefreshCw size={18} />
              Export as PDF
            </button>

            <button className="flex-1 sm:flex-none min-w-[180px] px-6 py-3 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200 font-medium rounded-xl transition-all flex items-center justify-center gap-2">
              <Download size={18} />
              Export as CSV
            </button>
          </div>
        </section>

        {/* ================= WEIGHBRIDGE SUMMARY ================= */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-semibold">Recent Weighbridge Summary</h2>
            </div>
          </div>

          {/* Mobile view */}
          <div className="lg:hidden space-y-5">
            {weighbridgeDailySummary.map((row, i) => {
              const net = row.inwardWt - row.outwardWt;
              return (
                <div
                  key={i}
                  className="bg-gray-900/60 rounded-xl p-5 border border-gray-800 hover:border-indigo-500/30 transition-all"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Date</p>
                      <p className="font-medium mt-0.5">{row.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Veh. In/Out</p>
                      <p className="font-medium mt-0.5">
                        {row.vehicleIn} / {row.vehicleOut}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Inward</p>
                      <p className="font-medium mt-0.5">{row.inwardWt} MT</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Outward</p>
                      <p className="font-medium mt-0.5">{row.outwardWt} MT</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Net Weight</p>
                      <p className={`font-bold text-lg mt-0.5 ${net > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {net > 0 ? "+" : ""}{net} MT
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-gray-400">Date</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-400">Veh. In</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-400">Veh. Out</th>
                  <th className="px-6 py-4 text-right font-medium text-gray-400">Inward (MT)</th>
                  <th className="px-6 py-4 text-right font-medium text-gray-400">Outward (MT)</th>
                  <th className="px-6 py-4 text-right font-medium text-indigo-300">Net (MT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {weighbridgeDailySummary.map((row, i) => {
                  const net = row.inwardWt - row.outwardWt;
                  return (
                    <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-200">{row.date}</td>
                      <td className="px-6 py-4 text-center">{row.vehicleIn}</td>
                      <td className="px-6 py-4 text-center">{row.vehicleOut}</td>
                      <td className="px-6 py-4 text-right">{row.inwardWt.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">{row.outwardWt.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-semibold">
                        <span className={net > 0 ? "text-emerald-400" : "text-rose-400"}>
                          {net > 0 ? "+" : ""}{net.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Download Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDownloadWeighbridge}
              disabled={weighbridgeDailySummary.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Download Weighbridge Summary (CSV)
            </button>
          </div>
        </section>

        {/* ================= VEHICLE MOVEMENTS ================= */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-semibold">Recent Vehicle Movements</h2>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-5">
            {recentVehicleActivity.map((item, i) => (
              <div
                key={i}
                className="bg-gray-900/60 rounded-xl p-5 border border-gray-800 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-200">{item.vehicle}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{item.type}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "success"
                        ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/30"
                        : "bg-amber-900/40 text-amber-300 border border-amber-700/30"
                    }`}
                  >
                    {item.action}
                  </span>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Calendar size={14} />
                  {item.time}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-gray-400">Time</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-400">Vehicle No.</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-400">Type</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentVehicleActivity.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{item.time}</td>
                    <td className="px-6 py-4 font-medium text-gray-200">{item.vehicle}</td>
                    <td className="px-6 py-4 text-gray-300">{item.type}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "success"
                            ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/30"
                            : "bg-amber-900/40 text-amber-300 border border-amber-700/30"
                        }`}
                      >
                        {item.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Download Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDownloadVehicleLogs}
              disabled={recentVehicleActivity.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Download Recent Movements (CSV)
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}