"use client";

import { X } from "lucide-react";

export interface AgentAttendance {
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

interface ViewLabourDetailProps {
  record: AgentAttendance | null;
  onClose: () => void;
}

const Detail = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl bg-gray-800/60 p-4 border border-gray-700/50">
    <p className="mb-1 text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
    <p className="text-base font-medium text-white break-words">{value || "—"}</p>
  </div>
);

export default function ViewLabourDetail({ record, onClose }: ViewLabourDetailProps) {
  if (!record) return null;

  const formatDateTime = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Labour Record Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Detail label="Agent Name" value={record.Agentname} />
          <Detail label="Village" value={record.village} />
          <Detail label="Date" value={record.Date} />
          <Detail label="Total Labour" value={record.Totallabour.toLocaleString("en-IN")} />
          <Detail label="Check In" value={formatDateTime(record.checkIn)} />
          <Detail label="Check Out" value={formatDateTime(record.checkOut)} />
          <Detail label="Rate per Labour" value={`₹${record.Rate.toLocaleString("en-IN")}`} />
          <Detail label="Total Wages" value={`₹${record.TotalWages.toLocaleString("en-IN")}`} />
          <Detail label="Contact" value={record.Contact} />
        </div>

        <div className="flex justify-end p-6 border-t border-gray-800 bg-gray-950/50">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}