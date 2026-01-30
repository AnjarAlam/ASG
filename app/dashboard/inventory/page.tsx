"use client";

import { useEffect, useMemo, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Loader2,
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

import { useInventoryStore } from "@/store/inventory-store";
import { useInwardStore } from "@/store/inward-store";
import { useOutwardStore } from "@/store/outward-store";
import dayjs from "dayjs";

const COLORS = ["#6366f1", "#a855f7", "#c084fc", "#f472b6", "#fb923c"];
const ITEMS_PER_PAGE = 10;

export default function InventoryDashboard() {
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
  } = useInventoryStore();

  const { outwards, fetchOutwards } = useOutwardStore();
  const { inwards, fetchInwards } = useInwardStore();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAllInventory(1, Number.MAX_SAFE_INTEGER);
    fetchInventory();
    fetchAreaWiseSummary();
    fetchInwards(1, Number.MAX_SAFE_INTEGER);
    fetchOutwards(1, Number.MAX_SAFE_INTEGER);
  }, [
    fetchAllInventory,
    fetchInventory,
    fetchAreaWiseSummary,
    fetchInwards,
    fetchOutwards,
  ]);

  const today = dayjs().format("YYYY-MM-DD");

  const todayInwards = useMemo(
    () =>
      inwards.filter(
        (i) => dayjs(i.createdAt).format("YYYY-MM-DD") === today && !i.isDeleted,
      ),
    [inwards],
  );

  const todayOutwards = useMemo(
    () =>
      outwards.filter(
        (i) => dayjs(i.createdAt).format("YYYY-MM-DD") === today && !i.isDeleted,
      ),
    [outwards],
  );

  const areaStock = areaSummaries.map((s) => ({
    area: s._id,
    qty: Math.round(s.totalQuantity),
  }));

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

  const formatMT = (mt: number) => `${mt.toLocaleString()} MT`;

  // ── Pagination Logic (same as DOReportList) ────────────────────────
  const totalItems = inventory.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

  const paginatedInventory = useMemo(
    () => inventory.slice(startIndex, endIndex),
    [inventory, currentPage],
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate visible page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 4) pages.push("...");

      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 3) pages.push("...");

      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="flex flex-col items-center gap-4 text-indigo-400">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-lg">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        <div className="text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 space-y-8">
        {/* HEADER */}
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

        {/* KPI GRID */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[
              { label: "Total Stock", value: formatMT(totalStockMT), icon: Warehouse },
              { label: "Active Areas", value: activeAreasCount.toString(), icon: Building2 },
              {
                label: "Inward Movements",
                value: todayInwards.length,
                icon: (props: any) => (
                  <Truck {...props} className="scale-x-[-1.05] text-indigo-400 scale-y-125" />
                ),
              },
              { label: "Outward Movements", value: todayOutwards.length, icon: Truck },
              {
                label: "Avg Stock / Area",
                value:
                  activeAreasCount > 0
                    ? formatMT(Math.round(totalStockMT / activeAreasCount))
                    : "0 MT",
                icon: Gauge,
              },
            ].map((k) => (
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

        {/* CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900/70 border border-gray-800 rounded-2xl p-6 h-[340px] hover:border-indigo-500/40 transition-all">
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
        </section>

        {/* INVENTORY TABLE WITH PAGINATION */}
        <section className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="text-indigo-400" />
              Current Inventory Details
            </h3>
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1}–{endIndex} of {totalItems}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-4">
            {paginatedInventory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No inventory records found</p>
            ) : (
              paginatedInventory.map((row) => (
                <div
                  key={row._id}
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
                      {row.quantityMT.toLocaleString()} MT
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            {paginatedInventory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No inventory records found</p>
            ) : (
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
                  {paginatedInventory.map((row) => (
                    <tr
                      key={row._id}
                      className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="py-3 px-2">{row.area}</td>
                      <td className="py-3 px-2 text-center">{row.grade}</td>
                      <td className="py-3 px-2 text-center">{row.type}</td>
                      <td className="py-3 px-2 text-center">{row.size}</td>
                      <td className="py-3 px-2 text-right font-semibold text-indigo-300">
                        {row.quantityMT.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls – same style as DOReportList */}
          {totalItems > ITEMS_PER_PAGE && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <div className="text-gray-400">
                Showing {startIndex + 1}–{endIndex} of {totalItems}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={20} />
                </button>

                {pageNumbers.map((page, idx) =>
                  page === "..." ? (
                    <span key={idx} className="px-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page as number)}
                      className={`w-8 h-8 rounded-lg font-medium ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}