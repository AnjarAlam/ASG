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
  Loader2,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useInventoryStore } from "@/store/inventory-store";
import { useInwardStore } from "@/store/inward-store";
import dayjs from "dayjs";
import { useOutwardStore } from "@/store/outward-store";


const COLORS = ["#6366f1", "#a855f7", "#c084fc", "#f472b6", "#fb923c"];

export default function CoalDashboard() {
  const {
    inventory,
    areaSummaries,
    totalStockMT,
    activeAreasCount,
    rejectedCoalMT,
    loading,
    error,
    fetchAllInventory,
    fetchInventory,
    fetchAreaWiseSummary,
    // fetchGradeSizeSummary,
  } = useInventoryStore();
  const { outwards, fetchOutwards } = useOutwardStore();
  const { inwards, fetchInwards } = useInwardStore();

  // Load data on mount
  useEffect(() => {
    fetchInventory();
    fetchAreaWiseSummary();
    fetchInwards(1, Number.MAX_SAFE_INTEGER);
    fetchOutwards(1, Number.MAX_SAFE_INTEGER);
    // fetchGradeSizeSummary(); // if needed
  }, [fetchAllInventory, fetchInventory, fetchAreaWiseSummary, fetchInwards, fetchOutwards]);

  const today = dayjs().format("YYYY-MM-DD");

  const todayInwards = useMemo(
    () =>
      inwards.filter(
        (i) =>
          dayjs(i.createdAt).format("YYYY-MM-DD") === today && !i.isDeleted,
      ),
    [inwards],
  );

  const todayOutwards = useMemo(
    () =>
      outwards.filter(
        (i) =>
          dayjs(i.createdAt).format("YYYY-MM-DD") === today && !i.isDeleted,
      ),
    [outwards],
  );

  const stats = useMemo(() => {
    const totalNet = todayInwards.reduce((sum, i) => sum + i.netWeight, 0);
    const totalNetOut = todayOutwards.reduce((sum, i) => sum + i.netWeight, 0);

    return {
      totalVehiclesToday: todayInwards.length,
      totalCoalInwardToday: `${totalNet.toFixed(2)} MT`,
      totalVehiclesOutToday: todayOutwards.length,
      totalCoalOutwardToday: `${totalNetOut.toFixed(2)} MT`,
      averageNetWeight: todayInwards.length
        ? `${(totalNet / todayInwards.length).toFixed(2)} MT`
        : "0 MT",
      rejectedCoalToday: "—",
    };
  }, [todayInwards, todayOutwards]);

  const coalTypeStats = useMemo(() => {
    const stats = {
      ROM: 0,
      STEAM: 0,
      BOULDERS: 0,
    };

    inventory
      .filter((i) => !i.isDeleted)
      .forEach((item) => {
        if (item.type === "ROM") stats.ROM += item.quantityMT;
        if (item.type === "Steam") stats.STEAM += item.quantityMT;
        if (item.type === "Boulders") stats.BOULDERS += item.quantityMT;
      });

    return stats;
  }, [inventory]);
  console.log("inven", inventory);

  const formatMT = (mt: number) => `${mt.toLocaleString()} MT`;
  console.log("stema", formatMT(coalTypeStats.STEAM));

  const kpis = [
    {
      label: "Total Coal Stock",
      value: formatMT(totalStockMT),
      icon: Warehouse,
    },
    { label: "ROM Coal", value: formatMT(coalTypeStats.ROM), icon: Layers },
    { label: "Steam Coal", value: formatMT(coalTypeStats.STEAM), icon: Layers },
    {
      label: "Boulders",
      value: formatMT(coalTypeStats.BOULDERS),
      icon: Layers,
    },
    {
      label: "Vehicles Inward Today",
      value: stats.totalVehiclesToday,
      icon: ArrowDownCircle,
    },
    {
      label: "Vehicles Outward Today",
      value: todayOutwards.length,
      icon: ArrowUpCircle,
    },
    {
      label: "Coal Inward Today",
      value: stats.totalCoalInwardToday,
      icon: (props: any) => (
        <Truck
          {...props}
          className="scale-x-[-1.25] text-indigo-400 scale-y-125"
        />
      ),
    },
    {
      label: "Coal Outward Today",
      value: stats.totalCoalOutwardToday,
      icon: Truck,
    },

  ];

  // Coal Grades (Pie)
  const gradeDistribution = [
    { name: "Grade E", value: 0 },
    { name: "Grade F", value: 0 },
    { name: "Grade B", value: 0 },
  ];

  inventory.forEach((item) => {
    if (item.grade === "E") gradeDistribution[0].value += item.quantityMT;
    if (item.grade === "F") gradeDistribution[1].value += item.quantityMT;
    if (item.grade === "B") gradeDistribution[2].value += item.quantityMT;
  });

  const GRADE_COLORS = ["#6366f1", "#a855f7", "#c084fc"];

  const monthlyCoalMovement = useMemo(() => {
    const map: Record<string, number> = {};

    [...inwards, ...outwards]
      .filter((i) => !i.isDeleted)
      .forEach((entry) => {
        const month = dayjs(entry.createdAt).format("MMM");
        map[month] = (map[month] || 0) + entry.netWeight;
      });

    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return MONTHS.map((m) => ({
      month: m,
      value: map[m] || 0,
    }));
  }, [inwards, outwards]);

  const dailyCoalMovement = useMemo(() => {
    const map: Record<string, number> = {};

    [...inwards, ...outwards]
      .filter((i) => !i.isDeleted)
      .forEach((entry) => {
        const day = dayjs(entry.createdAt).format("ddd");
        map[day] = (map[day] || 0) + entry.netWeight;
      });

    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return DAYS.map((d) => ({
      day: d,
      value: map[d] || 0,
    }));
  }, [inwards, outwards]);

  // Space Utilization (by area)
  const spaceUtilization = useMemo(() => {
    const map: Record<string, number> = {};

    inventory
      .filter((i) => !i.isDeleted)
      .forEach((item) => {
        map[item.area] = Math.max(map[item.area] || 0, item.quantityMT);
      });

    return Object.entries(map).map(([area, maxObserved]) => {
      const occupied = inventory
        .filter((i) => i.area === area && !i.isDeleted)
        .reduce((s, i) => s + i.quantityMT, 0);

      const capacity = Math.round(maxObserved * 1.2); // 20% buffer
      const percent = Math.min(Math.round((occupied / capacity) * 100), 100);

      return {
        area,
        occupied: percent,
        occupiedMT: occupied,
        capacityMT: capacity,
        color: percent > 85 ? "#ef4444" : percent > 65 ? "#f59e0b" : "#6366f1",
      };
    });
  }, [inventory]);

  // Recent Inwards & Outwards
  const recentInwards = useMemo(() => inwards.slice(0, 3), [inwards]);
  const recentOutwards = useMemo(() => outwards.slice(0, 3), [outwards]);
  // console.log("out", recentOutwards);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="flex flex-col items-center gap-4 text-indigo-400">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 h-[340px] hover:border-indigo-500/40 transition-all">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="text-indigo-400" />
              Grade Distribution
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  label
                >
                  {gradeDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
              <BarChart data={monthlyCoalMovement}>
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
              <LineChart data={dailyCoalMovement}>
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
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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
              <div className="overflow-x-auto hide-scrollbar">
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
                        <td className="py-3 truncate">{r.vehicleNumber}</td>
                        <td className="py-3">{r.netWeight}</td>
                        <td className="py-3">{r.coalGrade}</td>
                        <td className="py-3">{r.coalType}</td>
                        <td className="py-3 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleString()}
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
