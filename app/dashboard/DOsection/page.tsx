"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Truck,
  Plus,
  Calendar,
  Search,
  Download,
  TrendingUp,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
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

import { useDOStore } from "@/store/do-report-store";
import dayjs from "dayjs";

interface DOReport {
  _id: string;
  doNumber: string;
  supplier: string;
  volume: string;
  rate: string;
  financerName: string;
  financerOrganization: string;
  financerCost: string;
  issueDate: string;
  expiryDate: string;
  lifterName?: string;
  lifterCharges: string;
  transportCharges: string;
  liftedQty: string;
  liftedVehicleCount: string;
  createdAt: string;
}

/* =======================
   MODAL COMPONENT
======================= */
function ViewDODetail({
  report,
  onClose,
}: {
  report: DOReport | null;
  onClose: () => void;
}) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-6 m-4 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="text-indigo-400" />
            DO Details - {report.doNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition"
          >
            <X size={24} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DetailCard label="DO Number" value={report.doNumber} />
          <DetailCard label="Supplier" value={report.supplier} />
          <DetailCard label="Volume" value={`${report.volume} MT`} color="text-indigo-300" />
          <DetailCard label="Rate" value={`₹${report.rate}`} color="text-emerald-400" />
          <DetailCard label="Lifted Qty / Vehicles" value={`${report.liftedQty || "—"} (${report.liftedVehicleCount || "—"} vehicles)`} />
          <DetailCard label="Financer Name" value={report.financerName || "—"} />
          <DetailCard label="Financer Organization" value={report.financerOrganization || "—"} mdSpan />
          <DetailCard label="Financer Cost" value={`₹${report.financerCost || "—"}`} color="text-violet-400" />
          <DetailCard label="Issue Date" value={dayjs(report.issueDate).format("DD MMM YYYY")} />
          <DetailCard label="Expiry Date" value={dayjs(report.expiryDate).format("DD MMM YYYY")} />
          <DetailCard label="Lifter Name" value={report.lifterName || "—"} />
          <DetailCard label="Lifter Charges" value={`₹${report.lifterCharges || "0"}`} />
          <DetailCard label="Transport Charges" value={`₹${report.transportCharges || "0"}`} />
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  label,
  value,
  color = "text-white",
  mdSpan = false,
}: {
  label: string;
  value: string;
  color?: string;
  mdSpan?: boolean;
}) {
  return (
    <div className={`bg-gray-800/60 p-4 rounded-xl ${mdSpan ? "md:col-span-2" : ""}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`font-medium ${color}`}>{value}</p>
    </div>
  );
}

/* =======================
   MAIN DASHBOARD
======================= */
export default function DODashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<DOReport | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { fetchAll, doReports, loading, error } = useDOStore();

  useEffect(() => {
    fetchAll(1, Number.MAX_SAFE_INTEGER); 
  }, [fetchAll]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

 
  const totalDOs = doReports.length;
  const totalVolume = doReports.reduce((sum, d) => sum + Number(d.volume || 0), 0);
  const totalLifted = doReports.reduce((sum, d) => sum + Number(d.liftedQty || 0), 0);
  const pendingLifting = totalVolume - totalLifted;
  const totalExposure = doReports.reduce(
    (sum, d) => sum + Number(d.volume || 0) * Number(d.financerCost || 0),
    0
  );


  const filteredDOs = useMemo(() => {
    return doReports.filter((d) =>
      [d.doNumber, d.supplier, d.financerName]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [doReports, searchTerm]);


  const totalItems = filteredDOs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedDOs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDOs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDOs, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  const chartData = useMemo(() => {
    return filteredDOs.map((d) => ({
      date: new Date(d.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      Planned: Number(d.volume || 0),
      Lifted: Number(d.liftedQty || 0),
    }));
  }, [filteredDOs]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-red-500 text-xl text-center max-w-2xl">
          <p className="text-2xl mb-4">Error Loading Data</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-12">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/40">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">DO Section Dashboard</h1>
              <div className="mt-1.5 flex items-center gap-2 text-gray-400 text-sm">
                <Calendar size={15} />
                <span>{today}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/DOsection/new")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 rounded-xl text-white font-medium shadow-lg transition-all"
          >
            <Plus size={18} />
            New DO Entry
          </button>
        </header>

        {/* KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPI title="Total DOs" value={totalDOs} color="text-indigo-400" />
          <KPI title="Total Planned Volume" value={`${totalVolume} MT`} color="text-indigo-300" />
          <KPI title="Pending Lifting" value={`${pendingLifting} MT`} color="text-blue-400" />
          <KPI
            title="Financer Exposure"
            value={`₹ ${(totalExposure / 10000000).toFixed(2)} Cr`}
            color="text-violet-400"
          />
        </section>

        {/* TABLE SECTION */}
        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <Truck className="text-indigo-400" size={22} />
              Delivery Orders
            </h2>

            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset pagination on search
                  }}
                  placeholder="Search DO, supplier, financer..."
                  className="h-10 w-full sm:w-72 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-sm focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12 text-gray-400">Loading DO reports...</div>
          )}

          {!loading && filteredDOs.length === 0 && (
            <div className="text-center py-12 text-gray-500">No DO records found</div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead>
                <tr className="text-xs uppercase text-gray-400">
                  <th className="px-6 py-4 text-left">DO Number</th>
                  <th className="px-6 py-4 text-left">Supplier</th>
                  <th className="px-6 py-4 text-center">Volume</th>
                  <th className="px-6 py-4 text-left">Financer</th>
                  <th className="px-6 py-4 text-center">Lifted</th>
                  <th className="px-6 py-4 text-center">Date</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginatedDOs.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-800/40">
                    <td className="px-6 py-4 text-indigo-300 font-medium">{d.doNumber}</td>
                    <td className="px-6 py-4">{d.supplier}</td>
                    <td className="px-6 py-4 text-center">{d.volume}</td>
                    <td className="px-6 py-4">{d.financerName}</td>
                    <td className="px-6 py-4 text-center text-violet-300">
                      {d.liftedQty} / {d.volume}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">
                      {new Date(d.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedReport(d)}
                        className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-900/30 transition"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - only show if more than 10 items */}
          {totalItems > itemsPerPage && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
              <div>
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
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* CHART */}
        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold flex items-center gap-3 mb-6">
            <TrendingUp className="text-indigo-400" />
            Planned vs Lifted Volume
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Planned" stroke="#6366f1" strokeWidth={3} />
                <Line type="monotone" dataKey="Lifted" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <ViewDODetail report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
}


function KPI({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-gray-900/70 border border-gray-800/70 rounded-2xl p-5 shadow-lg">
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}