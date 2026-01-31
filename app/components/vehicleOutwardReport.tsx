"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Truck, Calendar, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useOutwardStore } from "@/store/outward-store";

const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = ["Date","Time", "Vehicle No.", "Type", "Customer", "Net Weight", "Action"];
  const rows = data.map((item) => [
    item.time,
    item.vehicle,
    item.type,
    item.customer,
    item.netWeight,
    item.action,
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

export default function VehicleOutwardMovements() {
  const {
    outwards,
    localOutwards,
    loading,
    error,
    fetchOutwards,
    fetchLocalOutwards,
  } = useOutwardStore();

  // Date Range State
  const [dateRange, setDateRange] = useState({
    start: dayjs().startOf("day").format("YYYY-MM-DD"),
    end: dayjs().endOf("day").format("YYYY-MM-DD"),
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOutwards(1, Number.MAX_SAFE_INTEGER);
    fetchLocalOutwards();
  }, [fetchOutwards, fetchLocalOutwards]);

  // Combine global + local outwards
  const allOutwards = useMemo(() => {
    return [...(outwards || []), ...(localOutwards || [])].filter((o) => !o.isDeleted);
  }, [outwards, localOutwards]);

  // Quick preset: Today
  const setToday = () => {
    setDateRange({
      start: dayjs().startOf("day").format("YYYY-MM-DD"),
      end: dayjs().endOf("day").format("YYYY-MM-DD"),
    });
    setCurrentPage(1);
  };

  // Filtered & Sorted Movements
  const filteredMovements = useMemo(() => {
    const startDate = dayjs(dateRange.start).startOf("day");
    const endDate = dayjs(dateRange.end).endOf("day");

    return allOutwards
      .filter((entry) => {
        const entryTime = dayjs(entry.dispatchDateTime || entry.createdAt);
        return entryTime.isAfter(startDate) && entryTime.isBefore(endDate);
      })
      .sort((a, b) => {
        const timeA = new Date(a.dispatchDateTime || a.createdAt).getTime();
        const timeB = new Date(b.dispatchDateTime || b.createdAt).getTime();
        return timeB - timeA; // newest first
      })
      .map((entry) => ({
        time: dayjs(entry.dispatchDateTime || entry.createdAt).format("DD MMM, hh:mm A"),
        vehicle: entry.vehicleNumber || "—",
        type: entry.outwardType || "LOCAL",
        action: entry.outwardType === "GLOBAL" ? "Global Dispatch" : "Local Dispatch",
        status: entry.netWeight && Number(entry.netWeight) > 0 ? "success" : "pending",
        customer: entry.customerName || "—",
        netWeight: entry.netWeight ? `${(Number(entry.netWeight) / 10).toFixed(2)} MT` : "—",
      }));
  }, [allOutwards, dateRange]);

  // Pagination Logic
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
    const filename = `outward-vehicle-movements-${dateRange.start}${
      dateRange.start !== dateRange.end ? `-to-${dateRange.end}` : ""
    }.csv`;
    downloadCSV(filteredMovements, filename);
  };

  if (loading && allOutwards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4 text-indigo-400">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm">Loading outward movements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center text-red-300">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Header + Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold">Recent Outward Vehicle Movements</h2>
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
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-5">
        {paginatedData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No outward vehicle movements found in selected date range
          </p>
        ) : (
          paginatedData.map((item, i) => (
            <div
              key={i}
              className="bg-gray-900/60 rounded-xl p-5 border border-gray-800 hover:border-indigo-500/30 transition-all shadow-sm"
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

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        {paginatedData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No outward vehicle movements found in selected date range
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Time</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Vehicle No.</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Type</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Customer</th>
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
                  <td className="px-6 py-4 text-gray-300">{item.customer}</td>
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

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={20} />
            </button>

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
                    className={`w-8 h-8 rounded-lg font-medium ${
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
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}