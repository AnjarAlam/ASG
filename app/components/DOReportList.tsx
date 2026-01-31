"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Calendar, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useDOStore } from "@/store/do-report-store"; // adjust path if needed

// CSV download helper — exports FULL filtered data
const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = [
    "DO Number",
    "Supplier",
    "Volume",
    "Rate",
    "Financer Name",
    "Financer Organization",
    "Financer Cost",
    "Issue Date",
    "Expiry Date",
    "Lifter Name",
    "Lifter Charges",
    "Transport Charges",
    "Lifted Qty",
  ];

  const rows = data.map((item) => [
    item.doNumber || "—",
    item.supplier || "—",
    item.volume || "—",
    item.rate || "—",
    item.financerName || "—",
    item.financerOrganization || "—",
    item.financerCost || "—",
    item.issueDate ? dayjs(item.issueDate).format("DD MMM YYYY") : "—",
    item.expiryDate ? dayjs(item.expiryDate).format("DD MMM YYYY") : "—",
    item.lifterName || "—",
    item.lifterCharges || "—",
    item.transportCharges || "—",
    item.liftedQty||"—",
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

export default function DOReportList() {
  const { doReports, loading, error, fetchAll } = useDOStore();

  // Date Range State
  const [dateRange, setDateRange] = useState({
    start: dayjs().startOf("day").format("YYYY-MM-DD"),
    end: dayjs().endOf("day").format("YYYY-MM-DD"),
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAll(1, Number.MAX_SAFE_INTEGER); 
  }, [fetchAll]);

  const setToday = () => {
    setDateRange({
      start: dayjs().startOf("day").format("YYYY-MM-DD"),
      end: dayjs().endOf("day").format("YYYY-MM-DD"),
    });
    setCurrentPage(1);
  };

  // Filter reports by date range
  const filteredReports = useMemo(() => {
    const startDate = dayjs(dateRange.start).startOf("day");
    const endDate = dayjs(dateRange.end).endOf("day");

    return doReports
      .filter((report) => {
        const issueTime = dayjs(report.issueDate || report.createdAt);
        return issueTime.isAfter(startDate) && issueTime.isBefore(endDate);
      })
      .sort((a, b) => {
        const timeA = new Date(a.issueDate || a.createdAt).getTime();
        const timeB = new Date(b.issueDate || b.createdAt).getTime();
        return timeB - timeA; // newest first
      });
  }, [doReports, dateRange]);

  // Pagination — only for table display
  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownload = () => {
    const filename = `do-reports-${dateRange.start}${
      dateRange.start !== dateRange.end ? `-to-${dateRange.end}` : ""
    }.csv`;

    // Pass FULL filtered data to CSV (not paginated)
    downloadCSV(filteredReports, filename);
  };

  if (loading && doReports.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4 text-indigo-400">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm">Loading DO reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center text-red-300">
        <p>Error loading DO reports: {error}</p>
      </div>
    );
  }

  return (
    <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold">DO Reports</h2>
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
            onClick={handleDownload}
            disabled={filteredReports.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-700 hover:brightness-110 text-white font-medium rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Download size={16} />
            Download CSV (All Filtered)
          </button>
        </div>
      </div>

      {/* Mobile Cards - only paginated */}
      <div className="lg:hidden space-y-5">
        {paginatedData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No DO reports found in selected date range
          </p>
        ) : (
          paginatedData.map((item, i) => (
            <div
              key={i}
              className="bg-gray-900/60 rounded-xl p-5 border border-gray-800 hover:border-indigo-500/30 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-200">{item.doNumber}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{item.supplier}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/40 text-indigo-300 border border-indigo-700/30">
                  DO Report
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                <div>
                  <p className="text-gray-400">Volume / Rate</p>
                  <p className="text-gray-200">{item.volume} @ {item.rate}</p>
                </div>
                <div>
                  <p className="text-gray-400">Lifted</p>
                  <p className="text-gray-200">{item.liftedQty || "—"} ({item.liftedVehicleCount || "—"} vehicles)</p>
                </div>
                <div>
                  <p className="text-gray-400">Issue Date</p>
                  <p className="text-gray-200">{dayjs(item.issueDate).format("DD MMM YYYY")}</p>
                </div>
                <div>
                  <p className="text-gray-400">Expiry Date</p>
                  <p className="text-gray-200">{dayjs(item.expiryDate).format("DD MMM YYYY")}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table - only paginated */}
      <div className="hidden lg:block overflow-x-auto">
        {paginatedData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No DO reports found in selected date range
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-400">DO Number</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Supplier</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Volume / Rate</th>
                <th className="px-6 py-4 text-left font-medium text-gray-400">Financer</th>
                <th className="px-6 py-4 text-center font-medium text-gray-400">Lifted Qty (Vehicles)</th>
                <th className="px-6 py-4 text-center font-medium text-gray-400">Issue Date</th>
                <th className="px-6 py-4 text-center font-medium text-gray-400">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedData.map((item, i) => (
                <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-200">{item.doNumber}</td>
                  <td className="px-6 py-4 text-gray-300">{item.supplier}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {item.volume} @ {item.rate}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{item.financerName || "—"}</td>
                  <td className="px-6 py-4 text-center text-emerald-300 font-medium">
                    {item.liftedQty || "—"} ({item.liftedVehicleCount || "—"})
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300">
                    {dayjs(item.issueDate).format("DD MMM YYYY")}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300">
                    {dayjs(item.expiryDate).format("DD MMM YYYY")}
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