"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  Truck,
  Package,
  BarChart3,
  Plus,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
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
import dayjs from "@/lib/dayjs";
import { useInwardStore } from "@/store/inward-store";

export default function InwardDashboard() {
  const router = useRouter();

  const { inwards, loading, error, fetchInwards } = useInwardStore();

  // Fetch data
  useEffect(() => {
    fetchInwards(1, Number.MAX_SAFE_INTEGER);
  }, [fetchInwards]);


  const today = dayjs().format("YYYY-MM-DD");

  const todayInwards = useMemo(
    () =>
      inwards
        .filter((i) => !i.isDeleted)
        .filter((i) => dayjs(i.createdAt).format("YYYY-MM-DD") === today),
    [inwards],
  );


  const stats = useMemo(() => {
    const totalNet = todayInwards.reduce((sum, i) => sum + (i.netWeight || 0), 0);

    return {
      totalVehiclesToday: todayInwards.length,
      totalCoalInwardToday: `${totalNet.toFixed(2)} MT`,
      averageNetWeight: todayInwards.length
        ? `${(totalNet / todayInwards.length).toFixed(2)} MT`
        : "0.00 MT",
      rejectedCoalToday: "—",
    };
  }, [todayInwards]);


  const recentInwards = useMemo(() => {
    return inwards
      .filter((i) => !i.isDeleted)
      .slice(0, 3)
      .map((entry) => ({
        vehicle: entry.vehicleNumber || "—",
        supplier: entry.supplierName || "—",
        netWeight: `${(entry.netWeight || 0).toFixed(2)} MT`,
        grade: entry.coalGrade || "—",
        type: entry.coalType || "—",
        size: entry.coalSize || "—",
        area: entry.area || "—",
        time: dayjs(entry.createdAt).fromNow(),
      }));
  }, [inwards]);

  const recentTokens = useMemo(() => {
    return inwards
      .filter((i) => !i.isDeleted)
      .slice(0, 3)
      .map((entry) => ({
        tokenNumber: entry.tokenNumber || `TI-${entry._id?.slice(-8) || "XXXX"}`,
        vehicle: entry.vehicleNumber || "—",
        supplier: entry.supplierName || "—",
        netWeight: `${(entry.netWeight || 0).toFixed(2)} MT`,
        grade: entry.coalGrade || "—",
        type: entry.coalType || "—",
        size: entry.coalSize || "—",
        area: entry.area || "—",
        time: dayjs(entry.createdAt).fromNow(),
      }));
  }, [inwards]);


  const gradeDistribution = useMemo(() => {
    const map: Record<string, number> = {};

    todayInwards.forEach((i) => {
      const grade = i.coalGrade || "Unknown";
      map[grade] = (map[grade] || 0) + (i.netWeight || 0);
    });

    return Object.entries(map)
      .map(([grade, value]) => ({
        grade,
        value: Number(value.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [todayInwards]);


  const inwardTrend = useMemo(() => {
    const areas = ["A", "B", "C", "D", "E", "F", "G"];

    return Array.from({ length: 7 })
      .map((_, i) => {
        const day = dayjs().subtract(6 - i, "day");
        const dayStr = day.format("YYYY-MM-DD");
        const dayLabel = day.format("MMM DD");

        const dayData = inwards.filter(
          (i) => dayjs(i.createdAt).format("YYYY-MM-DD") === dayStr && !i.isDeleted,
        );

        const row: Record<string, any> = { date: dayLabel };

        areas.forEach((area) => {
          row[area] = dayData
            .filter((i) => i.area === area)
            .reduce((sum, i) => sum + (i.netWeight || 0), 0);
        });

        return row;
      });
  }, [inwards]);


  if (loading && inwards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="flex flex-col items-center gap-4 text-indigo-400">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-lg">Loading inward data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-8">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-md">
              <ArrowDownToLine className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Inward Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Monitor incoming coal movements
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/inward/new")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-medium rounded-xl hover:brightness-110 transition-all shadow-md text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            New Inward
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-950/60 border border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* KPI CARDS */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-200">
            Today's Inward Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Vehicles Today", value: stats.totalVehiclesToday, color: "text-indigo-400" },
              { label: "Coal Inward", value: stats.totalCoalInwardToday, color: "text-green-400" },
              { label: "Avg Net Weight", value: stats.averageNetWeight, color: "text-cyan-400" },
              { label: "Rejected Coal", value: stats.rejectedCoalToday, color: "text-red-400" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 sm:p-5 hover:border-indigo-500/50 transition-all duration-200 shadow-sm"
              >
                <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1.5 text-white">
                  {item.value}
                </p>
                <p className={`text-xs mt-1 ${item.color}`}>Today</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent lists – now matching outward style */}
        <section className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Recent Inward Entries */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 flex items-center gap-2.5">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              Recent Inward Entries
            </h3>

            <div className="space-y-4 min-h-[260px]">
              {recentInwards.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No recent inward entries</p>
              ) : (
                recentInwards.map((entry, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-900/50 rounded-xl border-l-4 border-indigo-500/40 hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-white text-sm sm:text-base">
                          {entry.vehicle} • {entry.supplier}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                          {entry.netWeight} • Grade {entry.grade} • {entry.type} •{" "}
                          {entry.size}mm → Area {entry.area}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-4 h-4" />
                        {entry.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Tokens */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 flex items-center gap-2.5">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              Recent Inward Tokens
            </h3>

            <div className="space-y-4 min-h-[260px]">
              {recentTokens.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No recent tokens</p>
              ) : (
                recentTokens.map((token, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-900/50 rounded-xl border-l-4 border-indigo-500/40 hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-white text-sm sm:text-base">
                          {token.tokenNumber} • {token.vehicle}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                          {token.supplier} • {token.netWeight} • Grade {token.grade} •{" "}
                          {token.type} • {token.size}mm → Area {token.area}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-4 h-4" />
                        {token.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Grade Distribution */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <h3 className="text-lg sm:text-xl font-semibold mb-5 flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            Grade-wise Inward Today (MT)
          </h3>

          <div className="h-64 sm:h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={gradeDistribution}
                margin={{ top: 15, right: 15, left: -25, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gradeGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 5" stroke="#1f2937" vertical={false} opacity={0.6} />

                <XAxis
                  dataKey="grade"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 13, fontWeight: 500 }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  domain={[0, "dataMax + 10"]}
                />

                <Tooltip
                  cursor={{ stroke: "#6366f1", strokeWidth: 1.5, strokeDasharray: "5 5" }}
                  contentStyle={{
                    backgroundColor: "rgba(31, 41, 55, 0.92)",
                    border: "1px solid #6366f122",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`${value} MT`, "Value"]}
                />

                <Line
                  type="monotoneX"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  dot={{ r: 5, stroke: "#6366f1", strokeWidth: 2.5, fill: "#111827", opacity: 0.9 }}
                  activeDot={{ r: 9, stroke: "#6366f1", strokeWidth: 4, fill: "#fff" }}
                  fill="url(#gradeGlow)"
                  fillOpacity={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Inward Trend */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            Inward Trend (Last 7 Days)
          </h3>

          <div className="h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={inwardTrend}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                {/* Gradients */}
                <defs>
                  <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05} />
                  </linearGradient>
                  {/* ... other gradients ... */}
                </defs>

                <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" vertical={false} />

                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(31,41,55,0.94)",
                    border: "none",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px -5px rgba(99,102,241,0.25)",
                  }}
                />

                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} iconType="circle" />

                <Line type="monotone" dataKey="A" name="Area A" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3.5 }} activeDot={{ r: 6 }} fill="url(#fillA)" />
                <Line type="monotone" dataKey="B" name="Area B" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 3.5 }} activeDot={{ r: 6 }} fill="url(#fillB)" />
                {/* Add remaining lines C-G similarly */}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}