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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-8 md:pb-8">

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 md:gap-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-md flex-shrink-0">
              <ArrowDownToLine className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Inward Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Monitor incoming coal movements
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/inward/new")}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-medium rounded-lg sm:rounded-xl hover:brightness-110 transition-all shadow-md text-xs sm:text-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">New Inward</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="bg-red-950/60 border border-red-800 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3 text-red-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <p className="break-words">{error}</p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 md:space-y-10">
        {/* KPI CARDS */}
        <section>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 md:mb-6 text-gray-200">
            Today's Inward Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              { label: "Vehicles Today", value: stats.totalVehiclesToday, color: "text-indigo-400" },
              { label: "Coal Inward", value: stats.totalCoalInwardToday, color: "text-green-400" },
              { label: "Avg Net Weight", value: stats.averageNetWeight, color: "text-cyan-400" },
              { label: "Rejected Coal", value: stats.rejectedCoalToday, color: "text-red-400" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gray-900/80 border border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:border-indigo-500/50 transition-all duration-200 shadow-sm"
              >
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="text-base sm:text-lg md:text-2xl font-bold mt-1 sm:mt-1.5 text-white truncate">
                  {item.value}
                </p>
                <p className={`text-xs mt-0.5 sm:mt-1 ${item.color}`}>Today</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent lists */}
        <section className="space-y-6 sm:space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 md:gap-8">
          {/* Recent Inward Entries */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 md:mb-5 flex items-center gap-2 truncate">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-400 flex-shrink-0" />
              <span className="truncate">Recent Inward Entries</span>
            </h3>

            <div className="space-y-3 sm:space-y-4 min-h-[200px] sm:min-h-[260px]">
              {recentInwards.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent inward entries</p>
              ) : (
                recentInwards.map((entry, i) => (
                  <div
                    key={i}
                    className="p-3 sm:p-4 bg-gray-900/50 rounded-lg sm:rounded-xl border-l-4 border-indigo-500/40 hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white text-xs sm:text-sm md:text-base truncate">
                          {entry.vehicle} • {entry.supplier}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {entry.netWeight} • Grade {entry.grade} • {entry.type} • {entry.size}mm → Area {entry.area}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{entry.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Tokens */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 md:mb-5 flex items-center gap-2 truncate">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-400 flex-shrink-0" />
              <span className="truncate">Recent Inward Tokens</span>
            </h3>

            <div className="space-y-3 sm:space-y-4 min-h-[200px] sm:min-h-[260px]">
              {recentTokens.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent tokens</p>
              ) : (
                recentTokens.map((token, i) => (
                  <div
                    key={i}
                    className="p-3 sm:p-4 bg-gray-900/50 rounded-lg sm:rounded-xl border-l-4 border-indigo-500/40 hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white text-xs sm:text-sm md:text-base truncate">
                          {token.tokenNumber} • {token.vehicle}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {token.supplier} • {token.netWeight} • Grade {token.grade} • {token.type} • {token.size}mm → Area {token.area}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{token.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Grade Distribution */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-400 flex-shrink-0" />
            <span className="truncate">Grade-wise Inward Today (MT)</span>
          </h3>

          <div className="h-48 sm:h-64 md:h-72 pt-2 sm:pt-4">
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
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  domain={[0, "dataMax + 10"]}
                />

                <Tooltip
                  cursor={{ stroke: "#6366f1", strokeWidth: 1.5, strokeDasharray: "5 5" }}
                  contentStyle={{
                    backgroundColor: "rgba(31, 41, 55, 0.92)",
                    border: "1px solid #6366f122",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} MT`, "Value"]}
                />

                <Line
                  type="monotoneX"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  dot={{ r: 4, stroke: "#6366f1", strokeWidth: 2, fill: "#111827", opacity: 0.9 }}
                  activeDot={{ r: 7, stroke: "#6366f1", strokeWidth: 3, fill: "#fff" }}
                  fill="url(#gradeGlow)"
                  fillOpacity={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Inward Trend */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md overflow-hidden">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 md:mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-400 flex-shrink-0" />
            <span className="truncate">Inward Trend (Last 7 Days)</span>
          </h3>

          <div className="h-56 sm:h-80 md:h-96 -mx-4 sm:-mx-5 md:-mx-6 px-4 sm:px-5 md:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={inwardTrend}
                margin={{ top: 10, right: 20, left: -20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d8b4fe" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#d8b4fe" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0abfc" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f0abfc" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbb6ce" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#fbb6ce" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" vertical={false} />

                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(31,41,55,0.94)",
                    border: "none",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px -5px rgba(99,102,241,0.25)",
                    fontSize: "12px",
                  }}
                />

                <Legend
                  wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
                  iconType="circle"
                />

                <Line
                  type="monotone"
                  dataKey="A"
                  name="Area A"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  fill="url(#fillA)"
                />
                <Line
                  type="monotone"
                  dataKey="B"
                  name="Area B"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  fill="url(#fillB)"
                />
                <Line
                  type="monotone"
                  dataKey="C"
                  name="Area C"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  fill="url(#fillC)"
                />
                <Line
                  type="monotone"
                  dataKey="D"
                  name="Area D"
                  stroke="#c084fc"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  fill="url(#fillD)"
                />
                <Line
                  type="monotone"
                  dataKey="E"
                  name="Area E"
                  stroke="#d8b4fe"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  fill="url(#fillE)"
                />
                <Line
                  type="monotone"
                  dataKey="F"
                  name="Area F"
                  stroke="#f0abfc"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  fill="url(#fillF)"
                />
                <Line
                  type="monotone"
                  dataKey="G"
                  name="Area G"
                  stroke="#fbb6ce"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  fill="url(#fillG)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}