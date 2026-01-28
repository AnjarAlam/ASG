"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Users, Calendar, Loader2, ChevronLeft, ChevronRight, Phone, MapPin } from "lucide-react";
import dayjs from "dayjs";
import { useLabourStore } from "@/store/labour-store"; // adjust path if needed

const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = [
    "Agent Name",
    "Agent Phone",
    "Mukhiya Name",
    "Mukhiya Phone",
    "Village",
    "Total Labour",
    "Rate per Labour",
    "Total Wages",
    "Transport Fee",
  ];

  const rows = data.map((item) => [
    item.labourAgentName || "—",
    item.agentPhone || "—",
    item.mukhiyaName || "—",
    item.mukhiyaPhone || "—",
    item.village || "—",
    item.totalLabour || "—",
    item.ratePerLabour || "—",
    item.totalWages || "—",
    item.transportFee || "—",
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

export default function LabourRecordsList() {
  const { records, loading, error, fetchRecords } = useLabourStore();

  // Date Range State
  const [dateRange, setDateRange] = useState({
    start: dayjs().startOf("day").format("YYYY-MM-DD"),
    end: dayjs().endOf("day").format("YYYY-MM-DD"),
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch labour records
  useEffect(() => {
    fetchRecords({ page: 1, limit: 500 }); // large limit to get most/all
  }, [fetchRecords]);

  // Quick preset: Today
  const setToday = () => {
    setDateRange({
      start: dayjs().startOf("day").format("YYYY-MM-DD"),
      end: dayjs().endOf("day").format("YYYY-MM-DD"),
    });
    setCurrentPage(1);
  };

  // Filter records by date range
  const filteredRecords = useMemo(() => {
    const startDate = dayjs(dateRange.start).startOf("day");
    const endDate = dayjs(dateRange.end).endOf("day");

    return records
      .filter((record) => {
        const checkTime = dayjs(record.checkIn || record.createdAt);
        return checkTime.isAfter(startDate) && checkTime.isBefore(endDate);
      })
      .sort((a, b) => {
        // const timeA = new Date(a.checkIn || a.createdAt).getTime();
        // const timeB = new Date(b.checkIn || b.createdAt).getTime();
        // return timeB - timeA; // newest first
      });
  }, [records, dateRange]);

  // Pagination Logic (only for display)
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownload = () => {
    const filename = `labour-records-${dateRange.start}${
      dateRange.start !== dateRange.end ? `-to-${dateRange.end}` : ""
    }.csv`;
    downloadCSV(filteredRecords, filename);
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4 text-indigo-400">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm">Loading labour records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center text-red-300">
        <p>Error loading labour records: {error}</p>
      </div>
    );
  }

  return (
    <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold">Labour Records</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={setToday}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm transition"
          >
            Today
          </button>

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
            onClick={handleDownload}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-700 hover:brightness-110 text-white font-medium rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Download size={16} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Mobile Cards - paginated */}
      <div className="lg:hidden space-y-5">
        {paginatedData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No labour records found in selected date range
          </p>
        ) : (
          paginatedData.map((item, i) => (
            <div
              key={i}
              className="bg-gray-900/60 rounded-xl p-5 border border-gray-800 hover:border-indigo-500/30 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium text-lg text-gray-200">{item.labourAgentName}</p>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                    <Phone size={14} />
                    {item.agentPhone || "—"}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/40 text-indigo-300 border border-indigo-700/30">
                  Labour Record
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Users size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400">Mukhiya</p>
                    <p className="text-gray-200">{item.mukhiyaName || "—"}</p>
                    <p className="text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Phone size={14} />
                      {item.mukhiyaPhone || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <div>
                    <p className="text-gray-400">Village</p>
                    <p className="text-gray-200">{item.village || "—"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-gray-400">Total Labour</p>
                    <p className="text-lg font-medium text-emerald-300">{item.totalLabour || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Rate / Wages</p>
                    <p className="text-gray-200">
                      ₹{item.ratePerLabour || 0} → ₹{item.totalWages || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Transport Fee</p>
                    <p className="text-gray-200">₹{item.transportFee || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Check-In / Out</p>
                    <p className="text-gray-200">
                      {item.checkIn ? dayjs(item.checkIn).format("hh:mm A") : "—"} /{" "}
                      {item.checkOut ? dayjs(item.checkOut).format("hh:mm A") : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table - paginated */}
      <div className="hidden lg:block overflow-x-auto">
        {paginatedData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No labour records found in selected date range
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Agent / Phone</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Mukhiya / Phone</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Village</th>
                <th className="px-6 py-4 text-center font-medium text-gray-400">Total Labour</th>
                <th className="px-6 py-4 text-center font-medium text-gray-400">Rate → Wages</th>
                <th className="px-6 py-4 text-center font-medium text-gray-400">Transport Fee</th>
                <th className="px-6 py-4 text-center font-medium text-gray-400">Check-In / Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedData.map((item, i) => (
                <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-200">{item.labourAgentName}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Phone size={14} /> {item.agentPhone || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-300">{item.mukhiyaName || "—"}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Phone size={14} /> {item.mukhiyaPhone || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} /> {item.village || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-emerald-300">
                    {item.totalLabour || "—"}
                  </td>
                  <td className="px-6 py-4 text-center text-emerald-300 font-medium">
                    ₹{item.ratePerLabour || 0} → ₹{item.totalWages || 0}
                  </td>
                  <td className="px-6 py-4 text-center text-emerald-300 font-medium">
                    ₹{item.transportFee || 0}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300">
                    {item.checkIn ? dayjs(item.checkIn).format("hh:mm A") : "—"}<br />
                    {item.checkOut ? dayjs(item.checkOut).format("hh:mm A") : "—"}
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