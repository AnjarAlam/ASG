"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HardHat,
  Calendar,
  Plus,
  Search,
  Download,
  Eye,
  Clock,
} from "lucide-react";

import { useLabourStore } from "@/store/labour-store"; // ← make sure this path is correct

/* ===================== TYPES ===================== */

interface AgentAttendance {
  id: string;
  Agentname: string;
  village: string;
  Totallabour: number;
  checkIn: string;
  checkOut: string;
  Rate: number;
  TotalWages: number;
  Date: string;
  Contact: string;
}

/* ===================== PAGE ===================== */

export default function LabourDashboard() {
  const router = useRouter();
  const { records, loading, error, fetchRecords } = useLabourStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<AgentAttendance | null>(null);

  // Fetch records when component mounts
  useEffect(() => {
    fetchRecords({ page: 1, limit: 20 });
  }, [fetchRecords]);

  // Today's date in nice Indian format
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ─── Calculate stats from real data ───
  const stats = {
    totalWorkers: records.reduce((sum, r) => sum + (r.totalLabour || 0), 0),
    totalWages: records.reduce((sum, r) => sum + (r.totalWages || 0), 0),
    totalTransport: records.reduce((sum, r) => sum + (r.transportFee || 0), 0),
    recordCount: records.length,
  };

  // ─── Map backend records → table/modal friendly format ───
  const attendance: AgentAttendance[] = records.map((r) => {
    const checkInDate = new Date(r.checkIn);
    const checkOutDate = r.checkOut ? new Date(r.checkOut) : null;

    return {
      id: r._id,
      Agentname: r.labourAgentName || "—",
      village: r.village || "—",
      Totallabour: r.totalLabour || 0,
      checkIn: checkInDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      checkOut: checkOutDate
        ? checkOutDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "—",
      Rate: r.ratePerLabour || 0,
      TotalWages: r.totalWages || 0,
      Date: checkInDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      Contact: r.agentPhone || "—",
    };
  });

  // ─── Filter based on search ───
  const filteredData = attendance.filter((r) =>
    searchTerm.trim() === ""
      ? true
      : r.Agentname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Loading & Error states ───
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-indigo-400 text-xl">
        Loading labour records...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500 text-xl p-6 text-center">
        <div>
          <p className="mb-4 text-2xl">Error</p>
          <p>{error}</p>
          <p className="text-lg mt-4 text-gray-400">
            Check console for more details. Is the backend running?
          </p>
        </div>
      </div>
    );
  }

  // ─── Main UI ───
  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
            <HardHat className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Labour Dashboard</h1>
            <div className="flex items-center gap-2 text-gray-400 mt-1">
              <Calendar size={16} />
              <span>{today}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard/labour/new")}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} /> Add New Labour
        </button>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <Stat label="Total Workers" value={stats.totalWorkers.toLocaleString()} />
        <Stat label="Total Wages" value={`₹${stats.totalWages.toLocaleString()}`} />
        <Stat label="Transport Cost" value={`₹${stats.totalTransport.toLocaleString()}`} />
        <Stat label="Records Shown" value={stats.recordCount} />
      </section>

      {/* Table Section */}
      <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-3">
            <Clock className="text-indigo-400" size={20} />
            Labour Records
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search agent, village or ID..."
                className="w-full bg-gray-800 border border-gray-700 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 border border-gray-700 transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {searchTerm
              ? `No records found matching "${searchTerm}"`
              : "No labour records found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-400 bg-gray-800/50">
                <tr>
                  <th className="p-4 text-left rounded-tl-lg">ID</th>
                  <th className="p-4 text-left">Agent</th>
                  <th className="p-4 text-center">Labour</th>
                  <th className="p-4 text-center">In</th>
                  <th className="p-4 text-center">Out</th>
                  <th className="p-4 text-center">Rate</th>
                  <th className="p-4 text-center">Wages</th>
                  <th className="p-4 text-center">Date</th>
                  <th className="p-4 text-center">Contact</th>
                  <th className="p-4 text-center rounded-tr-lg">View</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {filteredData.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-4 font-mono text-gray-300">{r.id.slice(-8)}</td>
                    <td className="p-4">{r.Agentname}</td>
                    <td className="p-4 text-center">{r.Totallabour}</td>
                    <td className="p-4 text-center">{r.checkIn}</td>
                    <td className="p-4 text-center">{r.checkOut}</td>
                    <td className="p-4 text-center text-emerald-400">₹{r.Rate}</td>
                    <td className="p-4 text-center text-violet-400">
                      ₹{r.TotalWages.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">{r.Date}</td>
                    <td className="p-4 text-center font-mono">{r.Contact}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 
        Uncomment and implement when you have the modal component ready
        <ViewLabourDetail
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      */}
    </div>
  );
}

/* ===================== Stat Card Component ===================== */

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}