"use client";

import { useEffect, useMemo, useState } from "react";
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

import { useDOStore } from "@/store/do-report-store";

/* =======================
   PAGE
======================= */
export default function DODashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const { fetchAll, doReports, loading, error } = useDOStore();

  /* 🔹 Fetch DO list */
  useEffect(() => {
    fetchAll(1, 50);
  }, [fetchAll]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /* =======================
     KPI CALCULATIONS
  ======================= */
  const totalDOs = doReports.length;

  const totalVolume = doReports.reduce(
    (sum, d) => sum + Number(d.volume || 0),
    0,
  );

  const totalLifted = doReports.reduce(
    (sum, d) => sum + Number(d.liftedQty || 0),
    0,
  );

  const pendingLifting = totalVolume - totalLifted;

  const totalExposure = doReports.reduce(
    (sum, d) => sum + Number(d.volume || 0) * Number(d.financerCost || 0),
    0,
  );

  /* =======================
     SEARCH FILTER
  ======================= */
  const filteredDOs = useMemo(() => {
    return doReports.filter((d) =>
      [d.doNumber, d.supplier, d.financerName]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [doReports, searchTerm]);

  /* =======================
     CHART DATA (Derived)
  ======================= */
  const chartData = useMemo(() => {
    return filteredDOs.map((d) => ({
      date: new Date(d.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      Planned: Number(d.volume || 0),
      Lifted: Number(d.liftedQty || 0),
    }));
  }, [filteredDOs]);

  /* =======================
     RENDER
  ======================= */
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
              <h1 className="text-2xl lg:text-3xl font-bold">
                DO Section Dashboard
              </h1>
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
          <KPI title="Total DOs" value={totalDOs} color="text-indigo-400" />
          <KPI
            title="Total Planned Volume"
            value={`${totalVolume} MT`}
            color="text-indigo-300"
          />
          <KPI
            title="Pending Lifting"
            value={`${pendingLifting} MT`}
            color="text-blue-400"
          />
          <KPI
            title="Financer Exposure"
            value={`₹ ${(totalExposure / 10000000).toFixed(2)} Cr`}
            color="text-violet-400"
          />
        </section>

        {/* TABLE */}
        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <Truck className="text-indigo-400" size={22} />
              Delivery Orders
            </h2>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search DO, supplier, financer..."
                  className="h-10 w-72 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <button className="h-10 px-5 rounded-lg bg-gray-800 border border-gray-700 flex items-center gap-2">
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12 text-gray-400">
              Loading DO reports...
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-400">{error}</div>
          )}

          {!loading && filteredDOs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No DO records found
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead>
                <tr className="text-xs uppercase text-gray-400">
                  <th className="px-6 py-4 text-left">DO Number</th>
                  <th className="px-6 py-4 text-left">Supplier</th>
                  <th className="px-6 py-4 text-center">Volume</th>
                  <th className="px-6 py-4 text-left">Financer</th>
                  <th className="px-6 py-4 text-center">Lifted</th>
                  <th className="px-6 py-4 text-center">Date</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredDOs.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-800/40">
                    <td className="px-6 py-4 text-indigo-300 font-medium">
                      {d.doNumber}
                    </td>
                    <td className="px-6 py-4">{d.supplier}</td>
                    <td className="px-6 py-4 text-center">{d.volume}</td>
                    <td className="px-6 py-4">{d.financerName}</td>
                    <td className="px-6 py-4 text-center text-violet-300">
                      {d.liftedQty} / {d.volume}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">
                      {new Date(d.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-900/30">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CHART */}
        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold flex items-center gap-3 mb-6">
            <TrendingUp className="text-indigo-400" />
            Planned vs Lifted Volume
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Planned"
                  stroke="#6366f1"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="Lifted"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =======================
   KPI COMPONENT
======================= */
function KPI({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-gray-900/70 border border-gray-800/70 rounded-2xl p-5 shadow-lg">
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
