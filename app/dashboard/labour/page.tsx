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
  Users,
  IndianRupee,
  Truck,
  Layers,
  X,
} from "lucide-react";

import { useLabourStore } from "@/store/labour-store";


interface AgentAttendance {
  id: string;
  Agentname: string;
  village: string;
  Totallabour: number;
  Rate: number;
  TotalWages: number;
  Date: string;
  Contact: string;
}


function ViewLabourDetail({
  record,
  onClose,
}: {
  record: AgentAttendance | null;
  onClose: () => void;
}) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-6 m-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Labour Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition"
          >
            <X size={24} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gray-800/60 p-4 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Agent Name</p>
            <p className="text-white font-medium">{record.Agentname}</p>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Village</p>
            <p className="text-white font-medium">{record.village}</p>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Date</p>
            <p className="text-white font-medium">{record.Date}</p>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Total Labour</p>
            <p className="text-white font-medium">{record.Totallabour}</p>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Rate</p>
            <p className="text-emerald-400 font-medium">₹{record.Rate}</p>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Total Wages</p>
            <p className="text-violet-400 font-medium">
              ₹{record.TotalWages.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl md:col-span-2">
            <p className="text-xs text-gray-400 mb-1">Contact</p>
            <p className="text-white font-medium">{record.Contact}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function LabourDashboard() {
  const router = useRouter();
  const { records, loading, error, fetchRecords } = useLabourStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<AgentAttendance | null>(null);

  useEffect(() => {
    fetchRecords({ page: 1, limit: 20 });
  }, [fetchRecords]);

  // Today's date filter
  const todayDate = new Date().toISOString().split("T")[0];

  const todayRecords = records.filter((r) => {
    if (!r.createdAt) return false;
    return new Date(r.createdAt).toISOString().split("T")[0] === todayDate;
  });

  // Today's stats
  const todayStats = {
    totalLabour: todayRecords.reduce((sum, r) => sum + (r.totalLabour || 0), 0),
    totalWages: todayRecords.reduce((sum, r) => sum + (r.totalWages || 0), 0),
    totalTransport: todayRecords.reduce((sum, r) => sum + (r.transportFee || 0), 0),
    totalGroups: todayRecords.length,
  };

  // Table data
  const attendance: AgentAttendance[] = records.map((r) => {
    const createdAt = new Date(r.createdAt);

    return {
      id: r._id,
      Agentname: r.labourAgentName || "Unknown",
      village: r.village || "—",
      Totallabour: r.totalLabour || 0,
      Rate: r.ratePerLabour || 0,
      TotalWages: r.totalWages || 0,
      Date: createdAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      Contact: r.agentPhone || "—",
    };
  });

  const filteredData = attendance.filter((r) =>
    searchTerm.trim() === ""
      ? true
      : r.Agentname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
    <div className="min-h-screen bg-black text-gray-100 p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center">
            <HardHat className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Labour Dashboard</h1>
            <div className="flex items-center gap-2 text-gray-400 mt-1">
              <Calendar size={16} />
              <span>{new Date().toLocaleDateString("en-IN")}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard/labour/new")}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Labour
        </button>
      </header>

      {/* Today's Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <Stat
          label="Labour Today"
          value={todayStats.totalLabour}
          icon={<Users className="text-indigo-400" />}
        />
        <Stat
          label="Groups Today"
          value={todayStats.totalGroups}
          icon={<Layers className="text-cyan-400" />}
        />
        <Stat
          label="Wages Today"
          value={`₹${todayStats.totalWages.toLocaleString("en-IN")}`}
          icon={<IndianRupee className="text-emerald-400" />}
        />
        <Stat
          label="Transport Today"
          value={`₹${todayStats.totalTransport.toLocaleString("en-IN")}`}
          icon={<Truck className="text-orange-400" />}
        />
      </section>

      {/* Table */}
      <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="text-indigo-400" />
          Labour Records
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-400 bg-gray-800/50">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Agent</th>
                <th className="p-4 text-center">Labour</th>
                <th className="p-4 text-center">Rate</th>
                <th className="p-4 text-center">Wages</th>
                <th className="p-4 text-center">Date</th>
                <th className="p-4 text-center">Contact</th>
                <th className="p-4 text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredData.map((r) => (
                <tr key={r.id} className="hover:bg-gray-800/40">
                  <td className="p-4 font-mono">{r.id.slice(-8)}</td>
                  <td className="p-4">{r.Agentname}</td>
                  <td className="p-4 text-center">{r.Totallabour}</td>
                  <td className="p-4 text-center">₹{r.Rate}</td>
                  <td className="p-4 text-center text-violet-400">
                    ₹{r.TotalWages.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-center">{r.Date}</td>
                  <td className="p-4 text-center">{r.Contact}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* View Modal */}
      {selectedRecord && (
        <ViewLabourDetail
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}


function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center gap-4 hover:shadow-lg hover:shadow-indigo-900/20 transition-all">
      <div className="p-3 rounded-lg bg-gray-800">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}