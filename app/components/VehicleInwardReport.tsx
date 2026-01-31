"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Truck, Calendar, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useInwardStore } from "@/store/inward-store";


const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = ["Date","Time", "Vehicle No.", "Type", "Action", "Supplier", "Net Weight"];
  const rows = data.map((item) => [
    item.time,
    item.vehicle,
    item.type,
    item.action,
    item.supplier,
    item.netWeight,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function VehicleInwardMovements() {
  const { inwards, loading, fetchInwards } = useInwardStore();

  // ── Date Range State ────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState({
    start: dayjs().startOf("day").format("YYYY-MM-DD"),
    end: dayjs().endOf("day").format("YYYY-MM-DD"),
  });

  // ── Pagination State ────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can change this number

  // Quick preset: Today
  const setToday = () => {
    setDateRange({
      start: dayjs().startOf("day").format("YYYY-MM-DD"),
      end: dayjs().endOf("day").format("YYYY-MM-DD"),
    });
    setCurrentPage(1); 
  };

  useEffect(() => {
    fetchInwards(1, Number.MAX_SAFE_INTEGER); 
  }, [fetchInwards]);

  // Filter inwards based on selected date range
  const filteredMovements = useMemo(() => {
    const startDate = dayjs(dateRange.start).startOf("day");
    const endDate = dayjs(dateRange.end).endOf("day");

    return inwards
      .filter((i) => !i.isDeleted)
      .filter((i) => {
        const entryTime = dayjs(i.createdAt || i.inwardDateTime);
        return entryTime.isAfter(startDate) && entryTime.isBefore(endDate);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((entry) => ({
        time: dayjs(entry.createdAt || entry.inwardDateTime).format("DD MMM, hh:mm A"),
        vehicle: entry.vehicleNumber || "—",
        type: entry.inwardType || "LOCAL",
        action: entry.inwardType === "GLOBAL" ? "Global Entry" : "Local Entry",
        status: entry.netWeight && Number(entry.netWeight) > 0 ? "success" : "pending",
        supplier: entry.supplierName || entry.supplier || "—",
        netWeight: entry.netWeight ? `${Number(entry.netWeight).toFixed(2)} MT` : "—",
      }));
  }, [inwards, dateRange]);

  // ── Pagination Logic ────────────────────────────────────────────────
  const totalItems = filteredMovements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMovements.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMovements, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownloadVehicleLogs = () => {
    const filename = `vehicle-movements-${dateRange.start}${
      dateRange.start !== dateRange.end ? `-to-${dateRange.end}` : ""
    }.csv`;
    downloadCSV(filteredMovements, filename);
  };

  if (loading && filteredMovements.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4 text-indigo-400">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm">Loading vehicle movements...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Header + Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold">Vehicle inward Movements</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* <button
            onClick={setToday}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm transition"
          >
            Today
          </button> */}

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm"
            />
          </div>

          <button
            onClick={handleDownloadVehicleLogs}
            disabled={filteredMovements.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-700 hover:brightness-110 text-white font-medium rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Download size={16} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Content - Mobile Cards */}
      <div className="lg:hidden space-y-5">
        {paginatedData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No vehicle movements found in selected date range
          </p>
        ) : (
          paginatedData.map((item, i) => (
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

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={14} />
                  {item.time}
                </div>
                <div className="text-gray-300 font-medium">{item.netWeight}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Content - Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        {paginatedData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No vehicle movements found in selected date range
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Time</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Vehicle No.</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Type</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Supplier</th>
                <th className="px-6 py-4 text-center font-medium text-gray-400">Net Weight</th>
                <th className="px-6 py-4 text-center font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedData.map((item, i) => (
                <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 text-gray-300">{item.time}</td>
                  <td className="px-6 py-4 font-medium text-gray-200">{item.vehicle}</td>
                  <td className="px-6 py-4 text-gray-300">{item.type}</td>
                  <td className="px-6 py-4 text-gray-300">{item.supplier}</td>
                  <td className="px-6 py-4 text-center text-emerald-300 font-medium">
                    {item.netWeight}
                  </td>
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
        )}
      </div>

      {/* ── Pagination Controls ───────────────────────────────────────────── */}
      {totalItems > itemsPerPage && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Page numbers - show limited range for better UX */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
              )
              .map((page, idx, arr) => (
                <div key={page} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                </div>
              ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}  
