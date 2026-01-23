// app/dashboard/finance/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,

  FileText,
  BarChart3,
  Plus,
  Wallet,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = {
  paid: "#22c55e",
  pending: "#f97316",
  overdue: "#ef4444",
  processing: "#6366f1",
};

// Sample financer data
const financers = [
  {
    name: "Bank of India",
    amount: 1200,
    ratePerDay: 120,
    paymentDate: "2026-01-16",
    returnDate: "2026-01-30",
    status: "Paid",
  },
  {
    name: "Private Lender",
    amount: 800,
    ratePerDay: 80,
    paymentDate: "2026-01-16",
    returnDate: "2026-01-25",
    status: "Pending",
  },
  {
    name: "Investor X",
    amount: 500,
    ratePerDay: 50,
    paymentDate: "2026-01-15",
    returnDate: "2026-01-22",
    status: "Paid",
  },
  {
    name: "Bank of India",
    amount: 1000,
    ratePerDay: 100,
    paymentDate: "2026-01-14",
    returnDate: "2026-01-28",
    status: "Overdue",
  },
  {
    name: "Private Lender",
    amount: 700,
    ratePerDay: 70,
    paymentDate: "2026-01-10",
    returnDate: "2026-01-20",
    status: "Pending",
  },
];

// Compute derived data
const financerData = financers.map((f) => {
  const start = new Date(f.paymentDate).getTime();
  const end = new Date(f.returnDate).getTime();
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return { ...f, daysHeld: days, totalCost: f.ratePerDay * days };
});

// KPI totals
const totalStats = {
  totalFinancers: [...new Set(financerData.map((f) => f.name))].length,
  totalAmount: financerData.reduce((sum, f) => sum + f.amount, 0),
  totalPending: financerData.filter((f) => f.status === "Pending").length,
  totalPaid: financerData.filter((f) => f.status === "Paid").length,
};

export default function FinanceDashboard() {
  const router = useRouter();
  const [selectedFinancer, setSelectedFinancer] = useState(financerData[0]);

  const generateLineChartData = (financer: (typeof financerData)[0]) => {
    const start = new Date(financer.paymentDate);
    const end = new Date(financer.returnDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const data = [];
    for (let i = 0; i <= days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      data.push({
        date: date.toISOString().slice(0, 10),
        cumulativeCost: financer.ratePerDay * i,
      });
    }
    return data;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-8">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 space-y-8">
        {/* Header */}
        <header className=" flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/40">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Financer Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Master-detail view of all financers & payments
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/financer/new")}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 px-6 py-3 text-white shadow-lg"
          >
            <Plus size={18} />
            Add New Financer
          </button>
        </header>

          {/* Top KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-600 transition-colors">
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Total Financers
              </p>
              <p className="text-2xl sm:text-3xl font-bold">
                {totalStats.totalFinancers}
              </p>
            </div>
            <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-600 transition-colors">
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Total Amount
              </p>
              <p className="text-2xl sm:text-3xl font-bold">
                ${totalStats.totalAmount}
              </p>
            </div>
            <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-600 transition-colors">
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Payments Pending
              </p>
              <p className="text-2xl sm:text-3xl font-bold">
                {totalStats.totalPending}
              </p>
            </div>
            <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-600 transition-colors">
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Payments Paid
              </p>
              <p className="text-2xl sm:text-3xl font-bold">
                {totalStats.totalPaid}
              </p>
            </div>
          </div>

          {/* Master-detail layout */}
          <div className="grid lg:grid-cols-6 gap-6">
            {/* Left: Financer Cards */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {financerData.map((f, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedFinancer(f)}
                  className={`bg-gray-900/70 border border-gray-800 rounded-xl p-4 cursor-pointer transition-colors hover:border-blue-500 ${
                    selectedFinancer.name === f.name &&
                    selectedFinancer.returnDate === f.returnDate
                      ? "border-blue-500"
                      : ""
                  }`}
                >
                  <p className="font-semibold text-lg">{f.name}</p>
                  <p className="text-gray-400 text-sm">Amount: ${f.amount}</p>
                  <p className="text-gray-400 text-sm">
                    Rate/Day: ${f.ratePerDay}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Payment Date: {f.paymentDate}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Return Date: {f.returnDate}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Total Cost: ${f.totalCost}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      f.status === "Paid"
                        ? "bg-emerald-900/40 text-emerald-300"
                        : f.status === "Pending"
                        ? "bg-amber-900/40 text-amber-300"
                        : "bg-red-900/40 text-red-300"
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Right: Line Chart & Table (sticky) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="sticky top-20 flex flex-col gap-6">
                {/* Line Chart */}
                <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-lg">
                  <h3 className="text-lg font-semibold mb-5 flex items-center gap-2.5">
                    <BarChart3 className="text-blue-400" size={22} />
                    Payment Trend: {selectedFinancer.name}
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateLineChartData(selectedFinancer)}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111827ee",
                            border: "1px solid #374151",
                            borderRadius: "10px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="cumulativeCost"
                          name="Cumulative Cost"
                          stroke={COLORS.processing}
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Payments Table */}
                <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
                  <h3 className="text-lg font-semibold mb-5 flex items-center gap-2.5">
                    <FileText className="text-blue-400" size={22} />
                    Payments Ledger
                  </h3>
                  <table className="w-full text-sm table-fixed">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-5 py-3 text-left font-medium text-gray-400 w-1/6">
                          Payment Date
                        </th>
                        <th className="px-5 py-3 text-left font-medium text-gray-400 w-1/6">
                          Amount
                        </th>
                        <th className="px-5 py-3 text-left font-medium text-gray-400 w-1/6">
                          Rate/Day
                        </th>
                        <th className="px-5 py-3 text-left font-medium text-gray-400 w-1/6">
                          Days Held
                        </th>
                        <th className="px-5 py-3 text-left font-medium text-gray-400 w-1/6">
                          Total Cost
                        </th>
                        <th className="px-5 py-3 text-center font-medium text-gray-400 w-1/6">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {financerData
                        .filter((f) => f.name === selectedFinancer.name)
                        .map((item, i) => (
                          <tr
                            key={i}
                            className="hover:bg-gray-800/30 transition-colors"
                          >
                            <td className="px-5 py-3">{item.paymentDate}</td>
                            <td className="px-5 py-3">${item.amount}</td>
                            <td className="px-5 py-3">${item.ratePerDay}</td>
                            <td className="px-5 py-3">{item.daysHeld}</td>
                            <td className="px-5 py-3">${item.totalCost}</td>
                            <td className="px-5 py-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === "Paid"
                                    ? "bg-emerald-900/40 text-emerald-300"
                                    : item.status === "Pending"
                                    ? "bg-amber-900/40 text-amber-300"
                                    : "bg-red-900/40 text-red-300"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
