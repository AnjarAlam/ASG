"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  Truck,
  BarChart3,
  Plus,
  Clock,
  TrendingUp,
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

export default function InwardDashboard() {
  const router = useRouter();
  const stats = {
    totalVehiclesToday: 32,
    totalCoalInwardToday: "1,428 MT",
    averageNetWeight: "44.63 MT",
    rejectedCoalToday: "98 MT",
  };
  const recentInwards = [
    {
      vehicle: "GJ-01-AB-1234",
      supplier: "ABC Suppliers",
      netWeight: "45.2 MT",
      grade: "E",
      type: "ROM",
      size: "20-50",
      area: "A",
      time: "8 min ago",
    },
    {
      vehicle: "GJ-05-CD-5678",
      supplier: "XYZ Mining",
      netWeight: "43.1 MT",
      grade: "F",
      type: "Steam",
      size: "10-20",
      area: "B",
      time: "15 min ago",
    },
    {
      vehicle: "GJ-12-EF-9012",
      supplier: "Coal Corp",
      netWeight: "46.8 MT",
      grade: "B",
      type: "Boulders",
      size: "50-80",
      area: "C",
      time: "32 min ago",
    },
    {
      vehicle: "GJ-03-GH-3456",
      supplier: "National Coal Ltd",
      netWeight: "44.0 MT",
      grade: "E",
      type: "Rejected",
      size: "0-10",
      area: "D",
      time: "1 hr ago",
    },
  ];
  const inwardTrend = [
    { date: "Jan 03", A: 420, B: 380, C: 310, D: 130, E: 180, F: 90, G: 50 },
    { date: "Jan 04", A: 510, B: 450, C: 380, D: 220, E: 210, F: 110, G: 70 },
    { date: "Jan 05", A: 460, B: 390, C: 340, D: 150, E: 190, F: 100, G: 60 },
    { date: "Jan 06", A: 580, B: 520, C: 410, D: 180, E: 240, F: 130, G: 80 },
    { date: "Jan 07", A: 490, B: 430, C: 360, D: 200, E: 220, F: 120, G: 65 },
    { date: "Jan 08", A: 540, B: 480, C: 390, D: 200, E: 230, F: 125, G: 75 },
    { date: "Jan 09", A: 470, B: 410, C: 350, D: 198, E: 205, F: 115, G: 68 },
  ];
  const gradeDistribution = [
    { grade: "E", value: 48 },
    { grade: "F", value: 32 },
    { grade: "B", value: 20 },
  ];

  // New sample data for recent tokens, mirroring the structure of recentInwards
  // Token number formatted as "TO [Date] [Time] [Sequence]" e.g., "TO 2026-01-22 18:22 01"
  const recentTokens = [
    {
      tokenNumber: "TO 2026-01-22 18:22 01",
      vehicle: "GJ-01-AB-1234",
      supplier: "ABC Suppliers",
      netWeight: "45.2 MT",
      grade: "E",
      type: "ROM",
      size: "20-50",
      area: "A",
      time: "8 min ago",
    },
    {
      tokenNumber: "TO 2026-01-22 18:07 02",
      vehicle: "GJ-05-CD-5678",
      supplier: "XYZ Mining",
      netWeight: "43.1 MT",
      grade: "F",
      type: "Steam",
      size: "10-20",
      area: "B",
      time: "15 min ago",
    },
    {
      tokenNumber: "TO 2026-01-22 17:50 03",
      vehicle: "GJ-12-EF-9012",
      supplier: "Coal Corp",
      netWeight: "46.8 MT",
      grade: "B",
      type: "Boulders",
      size: "50-80",
      area: "C",
      time: "32 min ago",
    },
    {
      tokenNumber: "TO 2026-01-22 17:22 04",
      vehicle: "GJ-03-GH-3456",
      supplier: "National Coal Ltd",
      netWeight: "44.0 MT",
      grade: "E",
      type: "Rejected",
      size: "0-10",
      area: "D",
      time: "1 hr ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-8">
      {/* ================= HEADER ================= */}
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
            New Entry
          </button>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* ================= KPI CARDS ================= */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-200">
            Today's Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                label: "Vehicles Today",
                value: stats.totalVehiclesToday,
                color: "text-indigo-400",
              },
              {
                label: "Coal Inward",
                value: stats.totalCoalInwardToday,
                color: "text-indigo-400",
              },
              {
                label: "Avg Net Weight",
                value: stats.averageNetWeight,
                color: "text-cyan-400",
              },
              {
                label: "Rejected Coal",
                value: stats.rejectedCoalToday,
                color: "text-rose-400",
              },
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

        
        {/* ================= CHARTS ================= */}
        <section className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Recent Inwards */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 flex items-center gap-2.5">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              Recent Inward Entries
            </h3>
            <div className="space-y-4">
              {recentInwards.map((entry, i) => (
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
              ))}
            </div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 flex items-center gap-2.5">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              Recent Tokens
            </h3>
            <div className="space-y-4">
              {recentTokens.map((token, i) => (
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
                        {token.supplier} • {token.netWeight} • Grade {token.grade} • {token.type} •{" "}
                        {token.size}mm → Area {token.area}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-4 h-4" />
                      {token.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </section>

        <section className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-1 lg:gap-8">
         {/* Grade Distribution - Updated to indigo theme */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-md">
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
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity={0.55}
                      />
                      <stop
                        offset="50%"
                        stopColor="#6366f1"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 5"
                    stroke="#1f2937"
                    vertical={false}
                    opacity={0.6}
                  />
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
                    domain={[0, "dataMax + 15"]}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "#6366f1",
                      strokeWidth: 1.5,
                      strokeDasharray: "5 5",
                    }}
                    contentStyle={{
                      backgroundColor: "rgba(31, 41, 55, 0.92)",
                      border: "1px solid #6366f122",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      boxShadow: "0 12px 30px -8px rgba(99, 102, 241, 0.35)",
                    }}
                    labelStyle={{ color: "#6366f1", fontWeight: 600 }}
                    formatter={(value: number) => [`${value} MT`, "Value"]}
                  />
                  <Line
                    type="monotoneX"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    dot={{
                      r: 5,
                      stroke: "#6366f1",
                      strokeWidth: 2.5,
                      fill: "#111827",
                      opacity: 0.9,
                    }}
                    activeDot={{
                      r: 9,
                      stroke: "#6366f1",
                      strokeWidth: 4,
                      fill: "#fff",
                    }}
                    fill="url(#gradeGlow)"
                    fillOpacity={1}
                    animationDuration={1800}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
        
        {/* ================= INWARD TREND ================= */}
        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            Inward Trend (Last 7 Days)
          </h3>
          <div className="h-64 sm:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={inwardTrend}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                {/* === Gradients for better visual effect === */}
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
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#1f2937"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(31, 41, 55, 0.94)",
                    border: "none",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px -5px rgba(99,102,241,0.25)",
                    fontSize: "13px",
                    padding: "10px 14px",
                  }}
                  labelStyle={{ color: "#e5e7eb", fontWeight: 600 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                  layout="horizontal"
                  verticalAlign="bottom"
                />
                <Line
                  type="monotone"
                  dataKey="A"
                  stroke="#6366f1" // indigo-500
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Area A"
                  fill="url(#fillA)"
                />
                <Line
                  type="monotone"
                  dataKey="B"
                  stroke="#818cf8" // indigo-400
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Area B"
                  fill="url(#fillB)"
                />
                <Line
                  type="monotone"
                  dataKey="C"
                  stroke="#a78bfa" // violet-400
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Area C"
                  fill="url(#fillC)"
                />
                <Line
                  type="monotone"
                  dataKey="D"
                  stroke="#c084fc" // purple-400
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Area D"
                  fill="url(#fillD)"
                />
                <Line
                  type="monotone"
                  dataKey="E"
                  stroke="#d8b4fe" // purple-300
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Area E"
                  fill="url(#fillE)"
                />
                <Line
                  type="monotone"
                  dataKey="F"
                  stroke="#f0abfc" // pink-300
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Area F"
                  fill="url(#fillF)"
                />
                <Line
                  type="monotone"
                  dataKey="G"
                  stroke="#fbb6ce" // pink-200
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Area G"
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