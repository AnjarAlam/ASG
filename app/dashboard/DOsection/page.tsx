// app/dashboard/DOsection/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Truck,
  Plus,
  Calendar,
  Search,
  Download,
  TrendingUp,
  Eye,
  IndianRupee,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

// ── Type (status field removed) ────────────────────────────────────
type DORecord = {
  id: string;
  doNumber: string;
  colliery: string;
  volumeMT: number;
  rateWithGST: number;
  financerName: string;
  receiveDate: string;
  returnDate: string;
  liftedQuantity: number;
  liftedVehicleCount: number;
  createdAt: string;
};

// ── Mock data (status removed) ─────────────────────────────────────
const mockDOs: DORecord[] = [
  {
    id: "DO-042",
    doNumber: "DO/2026/JAN/042",
    colliery: "Gevra Mines",
    volumeMT: 1200,
    rateWithGST: 6850,
    financerName: "Rakesh Finance Pvt Ltd",
    receiveDate: "2026-01-19",
    returnDate: "2026-02-15",
    liftedQuantity: 450,
    liftedVehicleCount: 18,
    createdAt: "2026-01-19",
  },
  {
    id: "DO-039",
    doNumber: "DO/2026/JAN/039",
    colliery: "Dhanbad Colliery",
    volumeMT: 850,
    rateWithGST: 7200,
    financerName: "Sharma Capital",
    receiveDate: "2026-01-19",
    returnDate: "2026-02-10",
    liftedQuantity: 0,
    liftedVehicleCount: 0,
    createdAt: "2026-01-19",
  },
  {
    id: "DO-035",
    doNumber: "DO/2026/JAN/035",
    colliery: "Jharsuguda",
    volumeMT: 2000,
    rateWithGST: 6980,
    financerName: "Vikas Finance",
    receiveDate: "2026-01-18",
    returnDate: "2026-02-05",
    liftedQuantity: 2000,
    liftedVehicleCount: 82,
    createdAt: "2026-01-18",
  },
  {
    id: "DO-028",
    doNumber: "DO/2026/JAN/028",
    colliery: "Talcher",
    volumeMT: 950,
    rateWithGST: 7100,
    financerName: "Aditya Money",
    receiveDate: "2026-01-17",
    returnDate: "2026-02-20",
    liftedQuantity: 620,
    liftedVehicleCount: 25,
    createdAt: "2026-01-17",
  },
];

export default function DODashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Calculate KPIs ───────────────────────────────────────────────
  const totalDOs = mockDOs.length;
  const totalVolume = mockDOs.reduce((sum, d) => sum + d.volumeMT, 0);
  const totalLifted = mockDOs.reduce((sum, d) => sum + d.liftedQuantity, 0);
  const pendingLifting = totalVolume - totalLifted;
  const totalExposure = mockDOs.reduce(
    (sum, d) => sum + d.volumeMT * d.rateWithGST,
    0
  );

  // ── Filter records ───────────────────────────────────────────────
  const filteredDOs = mockDOs.filter(
    (d) =>
      d.doNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.colliery.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.financerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Chart data (example) ─────────────────────────────────────────
  const chartData = [
    { date: "Jan 13", Planned: 4200, Lifted: 3800 },
    { date: "Jan 14", Planned: 3800, Lifted: 3550 },
    { date: "Jan 15", Planned: 4500, Lifted: 4100 },
    { date: "Jan 16", Planned: 4100, Lifted: 3920 },
    { date: "Jan 17", Planned: 3900, Lifted: 3650 },
    { date: "Jan 18", Planned: 4800, Lifted: 4400 },
    { date: "Jan 19", Planned: 5200, Lifted: 4700 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-12">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/40">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">DO Section Dashboard</h1>
              <div className="mt-1.5 flex items-center gap-2 text-gray-400 text-sm">
                <Calendar size={15} />
                <span>{today}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/DOsection/new")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 rounded-xl text-white font-medium shadow-lg transition-all"
          >
            <Plus size={18} />
            New DO Entry
          </button>
        </header>

        {/* KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gray-900/70 border border-gray-800/70 rounded-2xl p-5 shadow-lg">
            <p className="text-sm text-gray-400">Total DOs</p>
            <p className="text-3xl font-bold text-indigo-400 mt-1">{totalDOs}</p>
          </div>

          <div className="bg-gray-900/70 border border-gray-800/70 rounded-2xl p-5 shadow-lg">
            <p className="text-sm text-gray-400">Total Planned Volume</p>
            <p className="text-3xl font-bold text-indigo-300 mt-1">
              {totalVolume.toLocaleString()} MT
            </p>
          </div>

          <div className="bg-gray-900/70 border border-gray-800/70 rounded-2xl p-5 shadow-lg">
            <p className="text-sm text-gray-400">Pending Lifting</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">
              {pendingLifting.toLocaleString()} MT
            </p>
          </div>

          <div className="bg-gray-900/70 border border-gray-800/70 rounded-2xl p-5 shadow-lg">
            <p className="text-sm text-gray-400">Financer Exposure</p>
            <p className="text-3xl font-bold text-violet-400 mt-1">
              ₹ {(totalExposure / 10000000).toFixed(2)} Cr
            </p>
          </div>
        </section>

        {/* TABLE SECTION – no status column */}
        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 shadow-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <Truck className="text-indigo-400" size={22} />
              Delivery Orders
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search DO, colliery, financer..."
                  className="h-10 w-full sm:w-72 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <button className="h-10 px-5 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center gap-2 hover:bg-gray-700 transition text-sm">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead>
                <tr className="text-xs uppercase text-gray-400 tracking-wider">
                  <th className="px-6 py-4 text-left">DO Number</th>
                  <th className="px-6 py-4 text-left">Colliery</th>
                  <th className="px-6 py-4 text-center">Volume (MT)</th>
                  <th className="px-6 py-4 text-left">Financer</th>
                  <th className="px-6 py-4 text-center">Lifted</th>
                  <th className="px-6 py-4 text-center">Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredDOs.map((doItem) => (
                  <tr
                    key={doItem.id}
                    className="hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-indigo-300">
                      {doItem.doNumber}
                    </td>
                    <td className="px-6 py-4">{doItem.colliery}</td>
                    <td className="px-6 py-4 text-center font-medium">
                      {doItem.volumeMT.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{doItem.financerName}</td>
                    <td className="px-6 py-4 text-center text-violet-300">
                      {doItem.liftedQuantity} / {doItem.volumeMT} MT
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">
                      {new Date(doItem.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button

                        className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-900/30 hover:text-indigo-300 transition"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDOs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No delivery orders found matching your search.
              </div>
            )}
          </div>
        </section>

        {/* VOLUME TREND CHART */}
        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold flex items-center gap-3 mb-6">
            <TrendingUp className="text-indigo-400" size={22} />
            Planned vs Lifted Volume Trend (MT)
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Planned"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Lifted"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}