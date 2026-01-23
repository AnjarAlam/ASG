"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Truck,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Clock,
  Warehouse,
  Layers,
  Gauge,
  CheckCircle,
  BarChart3,
  Home,
  Grid,
} from "lucide-react";

/* ================= DATA ================= */

// KPIs
const kpis = [
  { label: "Total Coal Stock", value: "15,458 MT", icon: Warehouse },
  { label: "ROM Coal", value: "6,320 MT", icon: Layers },
  { label: "Steam Coal", value: "4,180 MT", icon: Layers },
  { label: "Boulders", value: "2,940 MT", icon: Layers },
  { label: "Vehicles Inward Today", value: "39", icon: ArrowDownCircle },
  { label: "Vehicles Outward Today", value: "26", icon: ArrowUpCircle },
  {
    label: "Coal Inward Today",
    value: "1,428 MT",
    icon: (props: any) => (
      <Truck
        {...props}
        className="scale-x-[-1.25] text-indigo-400 scale-y-125"
      />
    ),
  },
  { label: "Coal Outward Today", value: "1,112 MT", icon: Truck },
  { label: "Rejected Coal", value: "98 MT", icon: AlertTriangle },
  { label: "Avg Weighment Time", value: "3.4 min", icon: Gauge },
  { label: "Pending Vehicles", value: "7", icon: Clock },
  { label: "Completed Trips", value: "124", icon: CheckCircle },
];

// Coal Grades (Pie)
const gradeSplit = [
  { name: "Grade E", value: 48 },
  { name: "Grade F", value: 32 },
  { name: "Grade B", value: 20 },
];

const GRADE_COLORS = ["#6366f1", "#a855f7", "#c084fc"];

// Monthly Coal Inward (MT)
const monthlyInward = [
  { month: "Jan", value: 12500 },
  { month: "Feb", value: 14800 },
  { month: "Mar", value: 16200 },
  { month: "Apr", value: 13900 },
  { month: "May", value: 17800 },
  { month: "Jun", value: 15500 },
  { month: "Jul", value: 19200 },
  { month: "Aug", value: 16800 },
  { month: "Sep", value: 18400 },
  { month: "Oct", value: 15900 },
  { month: "Nov", value: 14200 },
  { month: "Dec", value: 15100 },
];

// Daily Coal Movement (MT)
const dailyFlow = [
  { day: "Sun", value: 4200 },
  { day: "Mon", value: 5800 },
  { day: "Tue", value: 5300 },
  { day: "Wed", value: 7100 },
  { day: "Thu", value: 7600 },
  { day: "Fri", value: 6200 },
  { day: "Sat", value: 6800 },
];

// Space Utilization (by area)
const spaceUtilization = [
  { area: "A", occupied: 45, total: 100, color: "#4f46e5" },
  { area: "B", occupied: 38, total: 100, color: "#7c3aed" },
  { area: "C", occupied: 62, total: 100, color: "#a855f7" },
  { area: "D", occupied: 71, total: 100, color: "#c084fc" },
  { area: "E", occupied: 54, total: 100, color: "#6366f1" },
  { area: "F", occupied: 88, total: 100, color: "#8b5cf6" },
  { area: "G", occupied: 93, total: 100, color: "#a78bfa" },
];

// Recent Inwards & Outwards
const recentInwards = [
  {
    vehicle: "GJ-01-AB-1234",
    quantity: "45.2 MT",
    grade: "E",
    type: "ROM",
    time: "12 min ago",
  },
  {
    vehicle: "GJ-12-EF-9012",
    quantity: "46.8 MT",
    grade: "B",
    type: "Boulders",
    time: "25 min ago",
  },
  {
    vehicle: "GJ-03-GH-3456",
    quantity: "44.0 MT",
    grade: "E",
    type: "Rejected",
    time: "35 min ago",
  },
];

const recentOutwards = [
  {
    vehicle: "GJ-05-CD-5678",
    quantity: "43.1 MT",
    grade: "F",
    type: "Steam",
    time: "15 min ago",
  },
  {
    vehicle: "GJ-12-EF-9012",
    quantity: "46.8 MT",
    grade: "B",
    type: "Boulders",
    time: "30 min ago",
  },
  {
    vehicle: "GJ-03-GH-3456",
    quantity: "44.0 MT",
    grade: "E",
    type: "Rejected",
    time: "45 min ago",
  },
];

/* ================= PAGE ================= */

export default function CoalDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 space-y-8">
        {/* ===== HEADER ===== */}
        <header className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/40">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Live stock • areas • grades • movement
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

        {/* ===== CHART SECTION 1 ===== */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coal Grades (Pie) */}
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 h-[340px] hover:border-indigo-500/40 transition-all duration-300">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="text-indigo-400" />
              Coal Grades
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={gradeSplit}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={85}
                  label
                >
                  {gradeSplit.map((_, i) => (
                    <Cell key={i} fill={GRADE_COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Coal Inward */}
          <div className="lg:col-span-2 bg-gray-900/70 border border-gray-800 rounded-2xl p-6 h-[340px] hover:border-indigo-500/40 transition-all duration-300">
            <h3 className="font-semibold mb-4">Monthly Coal Inward (MT)</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={monthlyInward}>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ===== CHART SECTION 2 ===== */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Space Utilization */}
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-all duration-300">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Grid className="text-indigo-400" />
              Space Utilization
            </h3>

            <div className="space-y-4">
              {spaceUtilization.map((item) => (
                <div key={item.area} className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Area {item.area}</span>
                    <span>{item.occupied}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.occupied}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Coal Movement */}
          <div className="lg:col-span-2 bg-gray-900/70 border border-gray-800 rounded-2xl p-6 h-[420px] hover:border-indigo-500/40 transition-all duration-300">
            <h3 className="font-semibold mb-4">Daily Coal Movement (MT)</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={dailyFlow}>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ===== TABLE SECTION ===== */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              title: "Recent Inwards",
              icon: ArrowDownCircle,
              data: recentInwards,
              color: "text-green-400",
            },
            {
              title: "Recent Outwards",
              icon: ArrowUpCircle,
              data: recentOutwards,
              color: "text-blue-400",
            },
          ].map(({ title, icon: Icon, data, color }) => (
            <div
              key={title}
              className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-all duration-300"
            >
              <h3
                className={`font-semibold mb-4 flex items-center gap-2 ${color}`}
              >
                <Icon className="w-5 h-5" /> {title}
              </h3>

              {/* ❌ Removed overflow-x-auto */}
              <div>
                <table className="w-full text-sm table-fixed">
                  <thead className="text-gray-400 border-b border-gray-700">
                    <tr>
                      <th className="py-3 text-left">Vehicle</th>
                      <th className="py-3 text-left">Quantity</th>
                      <th className="py-3 text-left">Grade</th>
                      <th className="py-3 text-left">Type</th>
                      <th className="py-3 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
                      >
                        <td className="py-3 truncate">{r.vehicle}</td>
                        <td className="py-3">{r.quantity}</td>
                        <td className="py-3">{r.grade}</td>
                        <td className="py-3">{r.type}</td>
                        <td className="py-3 text-xs text-gray-400 whitespace-nowrap">
                          {r.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
