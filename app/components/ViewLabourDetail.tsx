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
  Contact: number;
}

interface ViewLabourDetailProps {
  record: AgentAttendance | null;
  onClose: () => void;
}

const Detail = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded-lg bg-gray-800/60 p-3">
    <p className="mb-1 text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-white">{value}</p>
  </div>
);

export default function ViewLabourDetail({
  record,
  onClose,
}: ViewLabourDetailProps) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Labour Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Agent Name" value={record.Agentname} />
          <Detail label="Village" value={record.village} />
          <Detail label="Date" value={record.Date} />
          <Detail label="Total Labour" value={record.Totallabour} />
          <Detail label="Check In" value={record.checkIn} />
          <Detail label="Check Out" value={record.checkOut} />
          <Detail label="Rate" value={`₹${record.Rate}`} />
          <Detail
            label="Total Wages"
            value={`₹${record.TotalWages.toLocaleString("en-IN")}`}
          />
          <Detail label="Contact" value={record.Contact} />
        </div>
      </div>
    </div>
  );
}
