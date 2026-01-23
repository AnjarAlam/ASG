"use client";

import {
  Layers,
  Building2,
  BarChart3,
  Truck,
  AlertTriangle,
  FileText,
  Warehouse,
  PackageCheck,
  Gauge,
  Home,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ================= DATA ================= */

const kpis = [
  { label: "Total Stock", value: "1,040 MT", icon: Warehouse },
  { label: "Active Areas", value: "7", icon: Building2 },
  { label: "Rejected Coal", value: "98 MT", icon: AlertTriangle },
  { label: "Vehicle Movements", value: "64", icon: Truck },
  { label: "Avg Stock / Area", value: "149 MT", icon: Gauge },
  { label: "Turnover Rate", value: "78%", icon: PackageCheck },
];

const areaStock = [
  { area: "A", qty: 120 },
  { area: "B", qty: 180 },
  { area: "C", qty: 95 },
  { area: "D", qty: 210 },
  { area: "E", qty: 160 },
  { area: "F", qty: 75 },
  { area: "G", qty: 60 },
];

const gradeDistribution = [
  { name: "Grade E", value: 48 },
  { name: "Grade F", value: 32 },
  { name: "Grade B", value: 20 },
];

const COLORS = ["#6366f1", "#a855f7", "#c084fc"];

const inventoryRows = [
  { area: "A", grade: "E", type: "ROM", size: "20–50", qty: 120 },
  { area: "B", grade: "F", type: "Steam", size: "50–80", qty: 180 },
  { area: "C", grade: "B", type: "Boulders", size: "50–80", qty: 95 },
  { area: "D", grade: "E", type: "ROM", size: "20–50", qty: 210 },
  { area: "E", grade: "F", type: "Steam", size: "50–80", qty: 160 },
  { area: "F", grade: "B", type: "Boulders", size: "10–20", qty: 75 },
  { area: "G", grade: "E", type: "ROM", size: "20–50", qty: 60 },
];

/* ================= PAGE ================= */

export default function InventoryDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 space-y-8">
        {/* ===== HEADER ===== */}
        <header className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/40">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Inventory Overview</h1>
            <p className="text-sm text-gray-400 mt-1">
              Live stock • areas • grades • distribution
            </p>
          </div>
        </header>

        {/* ===== KPI GRID ===== */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="h-24 bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-indigo-500/40 transition-all duration-200"
              >
                <div>
                  <p className="text-xs text-gray-400">{k.label}</p>
                  <p className="text-xl font-semibold mt-1">{k.value}</p>
                </div>
                <k.icon className="w-7 h-7 text-indigo-400" />
              </div>
            ))}
          </div>
        </section>

        {/* ===== CHART SECTION ===== */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area-wise Stock - Bigger chart */}
          <div className="lg:col-span-2 bg-gray-900/70 border border-gray-800 rounded-2xl p-6 h-[340px] hover:border-indigo-500/40 transition-all duration-300">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Building2 className="text-indigo-400" />
              Area-wise Coal Stock (MT)
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={areaStock}>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qty" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade Distribution (Pie) */}
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 h-[340px] hover:border-indigo-500/40 transition-all duration-300">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="text-indigo-400" />
              Grade Distribution
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={85}
                  label
                >
                  {gradeDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ===== INVENTORY TABLE ===== */}
        <section className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-all duration-300">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="text-indigo-400" />
            Current Inventory Details
          </h3>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-4">
            {inventoryRows.map((row, i) => (
              <div
                key={i}
                className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
              >
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Area</p>
                    {row.area}
                  </div>
                  <div>
                    <p className="text-gray-400">Grade</p>
                    {row.grade}
                  </div>
                  <div>
                    <p className="text-gray-400">Type</p>
                    {row.type}
                  </div>
                  <div>
                    <p className="text-gray-400">Size</p>
                    {row.size} mm
                  </div>
                  <div className="col-span-2 font-semibold text-indigo-300">
                    {row.qty} MT
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-3 text-left px-2">Area</th>
                  <th className="py-3 text-center px-2">Grade</th>
                  <th className="py-3 text-center px-2">Type</th>
                  <th className="py-3 text-center px-2">Size (mm)</th>
                  <th className="py-3 text-right px-2">Quantity (MT)</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-3 px-2">{row.area}</td>
                    <td className="py-3 px-2 text-center">{row.grade}</td>
                    <td className="py-3 px-2 text-center">{row.type}</td>
                    <td className="py-3 px-2 text-center">{row.size}</td>
                    <td className="py-3 px-2 text-right font-semibold text-indigo-300">
                      {row.qty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}