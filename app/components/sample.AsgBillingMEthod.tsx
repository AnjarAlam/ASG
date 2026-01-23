"use client";

import { useEffect } from "react";
import { Scale, Trash2 } from "lucide-react";

interface BillingMethodProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

const billingOptions = [
  { value: "half", label: "Half Billing (Account + Cash with GST)" },
  { value: "weight", label: "Half Weight Billing (Multiple Loading Lines)" },
  { value: "different", label: "Different Material Billing" },
];

export default function BillingMethodSection({
  formData,
  setFormData,
  handleChange,
}: BillingMethodProps) {
  // Real-time calculation for Half Billing
  useEffect(() => {
    if (!formData.billingMethods?.includes("half") || !formData.half) return;

    const totalCoal = Number(formData.half.totalCoal) || 0;
    const coalRate = Number(formData.half.coalRate) || 0;
    const gstRate = Number(formData.half.gstRate) || 18;

    const calculatedAmount = totalCoal * coalRate; // base amount excl. GST

    const accountWithGst = Number(formData.half.accountWithGst) || 0;
    const cash = Number(formData.half.cash) || 0;

    // Base amount from account payment
    const accountBase =
      gstRate > 0 ? accountWithGst / (1 + gstRate / 100) : accountWithGst;

    const totalPaying = accountBase + cash;
    const remaining = calculatedAmount - (accountBase + cash);

    setFormData((prev) => ({
      ...prev,
      half: {
        ...prev.half,
        calculatedAmount: isNaN(calculatedAmount) ? "" : calculatedAmount,
        totalPaying: isNaN(totalPaying) ? "" : totalPaying,
        remaining: isNaN(remaining) ? "" : remaining,
      },
    }));
  }, [
    formData.billingMethods,
    formData.half?.totalCoal,
    formData.half?.coalRate,
    formData.half?.gstRate,
    formData.half?.accountWithGst,
    formData.half?.cash,
  ]);

  // Real-time calculation for Weight Billing
  useEffect(() => {
    if (
      !formData.billingMethods?.includes("weight") ||
      !Array.isArray(formData.weight?.lines)
    )
      return;

    const gstRate = Number(formData.weight?.gstRate ?? 18);

    // Calculate total base amount from all lines
    let totalAmount = 0;
    for (const line of formData.weight.lines) {
      const loading = Number(line.loading) || 0;
      const rate = Number(line.rate) || 0;
      totalAmount += loading * rate;
    }

    const accountWithGst = Number(formData.weight?.accountWithGst) || 0;
    const cash = Number(formData.weight?.cash) || 0;

    const accountBase =
      gstRate > 0 ? accountWithGst / (1 + gstRate / 100) : accountWithGst;

    const totalPaying = accountBase + cash;
    const remaining = totalAmount - (accountBase + cash);

    setFormData((prev) => ({
      ...prev,
      weight: {
        ...prev.weight,
        totalAmount: isNaN(totalAmount) ? "" : totalAmount,
        totalPaying: isNaN(totalPaying) ? "" : totalPaying,
        remaining: isNaN(remaining) ? "" : remaining,
      },
    }));
  }, [
    formData.billingMethods,
    formData.weight?.lines,
    formData.weight?.accountWithGst,
    formData.weight?.cash,
    formData.weight?.gstRate,
  ]);

  const MATERIAL_OPTIONS = [
    { value: "E-ROM", label: "E-ROM" },
    { value: "F-STEAM", label: "F-STEAM" },
    { value: "B-BOULDER", label: "B-BOULDER" },
  ];

  // Real-time calculation for Different Material Billing
  useEffect(() => {
    if (
      !formData.billingMethods?.includes("different") ||
      !Array.isArray(formData.different?.materials)
    )
      return;

    let totalAmount = 0;
    for (const mat of formData.different.materials) {
      const qty = Number(mat.quantity) || 0;
      const rate = Number(mat.rate) || 0;
      totalAmount += qty * rate;
    }

    const accountWithGst = Number(formData.different?.accountWithGst) || 0;
    const cash = Number(formData.different?.cash) || 0;

    // Assuming same GST logic as other sections (you can add global gstRate later)
    const gstRate = 18; // ← you can make this configurable later
    const accountBase =
      gstRate > 0 ? accountWithGst / (1 + gstRate / 100) : accountWithGst;

    const totalPaying = accountBase + cash;
    const remaining = totalAmount - (accountBase + cash);

    setFormData((prev) => ({
      ...prev,
      different: {
        ...prev.different,
        totalAmount: isNaN(totalAmount) ? "" : totalAmount,
        totalPaying: isNaN(totalPaying) ? "" : totalPaying,
        remaining: isNaN(remaining) ? "" : remaining,
      },
    }));
  }, [
    formData.billingMethods,
    formData.different?.materials,
    formData.different?.accountWithGst,
    formData.different?.cash,
  ]);

  const addMethod = (value: string) => {
    if (!value || formData.billingMethods?.includes(value)) return;

    setFormData((prev: any) => {
      const newData = { ...prev };

      if (value === "half") {
        newData.half = {
          totalCoal: "",
          coalRate: "",
          gstRate: "18",
          calculatedAmount: "",
          accountWithGst: "",
          cash: "",
          totalPaying: "",
          remaining: "",
        };
      } else if (value === "weight") {
        newData.weight = {
          lines: [{ loading: "", rate: "" }],
          totalAmount: "",
        };
      } else if (value === "different") {
        newData.different = {
          materials: [{ name: "", quantity: "", rate: "" }],
          totalAmount: "",
        };
      }

      return {
        ...newData,
        billingMethods: [...(prev.billingMethods || []), value],
      };
    });
  };

  const removeMethod = (method: string) => {
    setFormData((prev: any) => {
      const newData = { ...prev };

      if (method === "half") delete newData.half;
      if (method === "weight") delete newData.weight;
      if (method === "different") delete newData.different;

      return {
        ...newData,
        billingMethods:
          prev.billingMethods?.filter((m: string) => m !== method) || [],
      };
    });
  };

  return (
    <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
      <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
        <Scale className="h-6 w-6 text-violet-400" />
        Billing & Rates
      </h2>

      {/* Main Rates + Method Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-10">
        <div className="relative">
          <div className="flex">
            <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-base text-gray-300">
              ₹
            </span>
            <input
              type="text"
              name="billingRate"
              value={formData.billingRate || ""}
              onChange={handleChange}
              placeholder="0.00"
              className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors"
            />
          </div>
          <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
            Billing Rate (₹/MT)
          </label>
        </div>

        <div className="relative">
          <div className="flex">
            <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-base text-gray-300">
              ₹
            </span>
            <input
              type="text"
              name="actualRate"
              value={formData.actualRate || ""}
              onChange={handleChange}
              placeholder="0.00"
              className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors"
            />
          </div>
          <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
            Actual Rate (₹/MT)
          </label>
        </div>

        <div className="relative">
          <h3 className="text-sm font-medium mb-2 text-gray-300">
            Add Billing Method
          </h3>
          <select
            value=""
            onChange={(e) => addMethod(e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white appearance-none"
          >
            <option value="">Select method...</option>
            {billingOptions
              .filter((opt) => !formData.billingMethods?.includes(opt.value))
              .map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Dynamic Sections */}
      <div className="space-y-8">
        {/* HALF BILLING */}
        {formData.billingMethods?.includes("half") && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-violet-300">
                Half Billing (Account + Cash with GST)
              </h4>
              <button
                type="button"
                onClick={() => removeMethod("half")}
                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-950/30"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="relative">
                <input
                  type="text"
                  name="half.totalCoal"
                  value={formData.half?.totalCoal || ""}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
                  placeholder=" "
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Total Coal (MT)
                </label>
              </div>

              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="half.coalRate"
                    value={formData.half?.coalRate || ""}
                    onChange={handleChange}
                    className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                    placeholder="0.00"
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Coal Rate (₹/MT)
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="half.gstRate"
                  value={formData.half?.gstRate ?? "18"}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
                  placeholder="18"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  GST Rate (%)
                </label>
              </div>
            </div>

            {/* Results & Payment Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-700/50">
              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.half?.calculatedAmount
                      ? `₹ ${Number(formData.half.calculatedAmount).toLocaleString("en-IN")}`
                      : "—"
                  }
                  className="w-full px-4 py-3.5 bg-gray-900/60 border border-gray-700 rounded-md text-violet-300 font-bold cursor-not-allowed"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400">
                  Calculated Amount
                </label>
              </div>

              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="half.accountWithGst"
                    value={formData.half?.accountWithGst || ""}
                    onChange={handleChange}
                    className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                    placeholder="0.00"
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Account (incl. GST)
                </label>
              </div>

              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="half.cash"
                    value={formData.half?.cash || ""}
                    onChange={handleChange}
                    className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                    placeholder="0.00"
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Cash (no GST)
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.half?.totalPaying
                      ? `₹ ${Number(formData.half.totalPaying).toLocaleString("en-IN")}`
                      : "—"
                  }
                  className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-700 rounded-md text-emerald-400 font-bold cursor-not-allowed"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400">
                  Total Paying
                </label>
              </div>

              <div className="relative md:col-span-2 lg:col-span-4 mt-2">
                <input
                  readOnly
                  value={
                    formData.half?.remaining === undefined
                      ? "—"
                      : formData.half.remaining > 0
                        ? `Remaining: ₹ ${Number(formData.half.remaining).toLocaleString("en-IN")}`
                        : formData.half.remaining < 0
                          ? `Excess: ₹ ${Math.abs(Number(formData.half.remaining)).toLocaleString("en-IN")}`
                          : "Balanced ✓"
                  }
                  className={`w-full px-4 py-3.5 rounded-md font-medium border ${
                    formData.half?.remaining === undefined
                      ? "bg-gray-900/40 border-gray-700 text-gray-400"
                      : formData.half.remaining > 0
                        ? "bg-amber-950/40 border-amber-700 text-amber-300"
                        : formData.half.remaining < 0
                          ? "bg-red-950/40 border-red-700 text-red-300"
                          : "bg-emerald-950/40 border-emerald-700 text-emerald-400"
                  }`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400">
                  Balance Status
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── HALF WEIGHT BILLING ── */}
        {formData.billingMethods?.includes("weight") && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-violet-300">
                Half Weight Billing (Multiple Loading Points)
              </h4>
              <button
                type="button"
                onClick={() => removeMethod("weight")}
                className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-950/40"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Loading Lines Section */}
            <div className="space-y-6 mb-10">
              {Array.isArray(formData.weight?.lines) &&
                formData.weight.lines.map((line: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-900/30 p-6 rounded-lg border border-gray-800/50"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
                      {/* Loading (MT) */}
                      <div className="sm:col-span-4 relative">
                        <input
                          type="text"
                          value={line.loading || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              weight: {
                                ...prev.weight,
                                lines: prev.weight.lines.map(
                                  (l: any, i: number) =>
                                    i === index ? { ...l, loading: value } : l,
                                ),
                              },
                            }));
                          }}
                          className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
                          placeholder=" "
                        />
                        <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                          Loading {index + 1} (MT)
                        </label>
                      </div>

                      {/* Rate (₹/MT) */}
                      <div className="sm:col-span-4 relative">
                        <div className="flex">
                          <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                            ₹
                          </span>
                          <input
                            type="text"
                            value={line.rate || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                weight: {
                                  ...prev.weight,
                                  lines: prev.weight.lines.map(
                                    (l: any, i: number) =>
                                      i === index ? { ...l, rate: value } : l,
                                  ),
                                },
                              }));
                            }}
                            className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                          Rate (₹/MT)
                        </label>
                      </div>

                      {/* GST Rate (%) */}
                      <div className="sm:col-span-4 relative">
                        <input
                          type="text"
                          value={line.gstRate ?? "18"}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              weight: {
                                ...prev.weight,
                                lines: prev.weight.lines.map(
                                  (l: any, i: number) =>
                                    i === index ? { ...l, gstRate: value } : l,
                                ),
                              },
                            }));
                          }}
                          className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
                          placeholder="18"
                        />
                        <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                          GST Rate (%)
                        </label>
                      </div>

                      {/* Remove Button */}
                      <div className="sm:col-span-12 flex justify-end">
                        {formData.weight.lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                weight: {
                                  ...prev.weight,
                                  lines: prev.weight.lines.filter(
                                    (_: any, i: number) => i !== index,
                                  ),
                                },
                              }));
                            }}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                            Remove Line
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {/* Add New Line Button */}
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    weight: {
                      ...prev.weight,
                      lines: [
                        ...(prev.weight?.lines || []),
                        { loading: "", rate: "", gstRate: "18" },
                      ],
                    },
                  }));
                }}
                className="w-full py-3.5 px-6 bg-violet-900/30 hover:bg-violet-900/50 
                   border border-violet-700/40 rounded-lg text-violet-300 
                   transition-colors font-medium flex items-center justify-center gap-2"
              >
                <span className="text-xl">+</span> Add Another Loading Point
              </button>
            </div>

            {/* Summary & Payment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-gray-700/50">
              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.weight?.totalAmount
                      ? `₹ ${Number(formData.weight.totalAmount).toLocaleString("en-IN")}`
                      : "—"
                  }
                  className="w-full px-4 py-3.5 bg-gray-900/60 border border-gray-700 rounded-md text-violet-300 font-bold cursor-not-allowed"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400">
                  Total Amount (excl. GST)
                </label>
              </div>

              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="weight.accountWithGst"
                    value={formData.weight?.accountWithGst || ""}
                    onChange={handleChange}
                    className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                    placeholder="0.00"
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Account Payment (incl. GST)
                </label>
              </div>

              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="weight.cash"
                    value={formData.weight?.cash || ""}
                    onChange={handleChange}
                    className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                    placeholder="0.00"
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Cash Payment (excl. GST)
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.weight?.totalPaying
                      ? `₹ ${Number(formData.weight.totalPaying).toLocaleString("en-IN")}`
                      : "—"
                  }
                  className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-700 rounded-md text-emerald-400 font-bold cursor-not-allowed"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400">
                  Total Paying
                </label>
              </div>

              {/* Balance Status - full width */}
              <div className="relative md:col-span-2 lg:col-span-4 mt-3">
                <input
                  readOnly
                  value={
                    formData.weight?.remaining === undefined
                      ? "—"
                      : formData.weight.remaining > 0
                        ? `Remaining to Pay: ₹ ${Number(formData.weight.remaining).toLocaleString("en-IN")}`
                        : formData.weight.remaining < 0
                          ? `Excess / Advance: ₹ ${Math.abs(Number(formData.weight.remaining)).toLocaleString("en-IN")}`
                          : "Payment Balanced ✓"
                  }
                  className={`w-full px-5 py-4 rounded-lg font-medium border text-center transition-colors ${
                    formData.weight?.remaining === undefined
                      ? "bg-gray-900/40 border-gray-700 text-gray-400"
                      : formData.weight.remaining > 0
                        ? "bg-amber-950/50 border-amber-700/70 text-amber-300"
                        : formData.weight.remaining < 0
                          ? "bg-red-950/50 border-red-700/70 text-red-300"
                          : "bg-emerald-950/50 border-emerald-700/70 text-emerald-400"
                  }`}
                />
                <label className="absolute left-5 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400">
                  Balance Status
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Different Material - placeholder */}
        {formData.billingMethods?.includes("different") && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-violet-300">
                Different Material Billing
              </h4>
              <button
                type="button"
                onClick={() => removeMethod("different")}
                className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-950/40"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Material Lines */}
            <div className="space-y-6 mb-10">
              {Array.isArray(formData.different?.materials) &&
                formData.different.materials.map(
                  (material: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-900/30 p-6 rounded-lg border border-gray-800/50"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
                        {/* Material Name */}
                        <div className="sm:col-span-5 relative">
                          <div className="sm:col-span-5 relative">
                            <select
                              value={material.name || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  different: {
                                    ...prev.different,
                                    materials: prev.different.materials.map(
                                      (m: any, i: number) =>
                                        i === index ? { ...m, name: value } : m,
                                    ),
                                  },
                                }));
                              }}
                              className="peer w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 
               focus:border-violet-500 rounded-md outline-none text-white 
               appearance-none"
                            >
                              <option value="">Select Material</option>
                              {MATERIAL_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            <label
                              className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium 
                     text-gray-400 peer-focus:text-violet-400 transition-all"
                            >
                              Material Type
                            </label>
                          </div>

                          <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                            Material Name
                          </label>
                        </div>

                        {/* Quantity (MT) */}
                        <div className="sm:col-span-3 relative">
                          <input
                            type="text"
                            value={material.quantity || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                different: {
                                  ...prev.different,
                                  materials: prev.different.materials.map(
                                    (m: any, i: number) =>
                                      i === index
                                        ? { ...m, quantity: value }
                                        : m,
                                  ),
                                },
                              }));
                            }}
                            className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
                            placeholder="0.00"
                          />
                          <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                            Quantity (MT)
                          </label>
                        </div>

                        {/* Rate (₹/MT) */}
                        <div className="sm:col-span-4 relative">
                          <div className="flex">
                            <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                              ₹
                            </span>
                            <input
                              type="text"
                              value={material.rate || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  different: {
                                    ...prev.different,
                                    materials: prev.different.materials.map(
                                      (m: any, i: number) =>
                                        i === index ? { ...m, rate: value } : m,
                                    ),
                                  },
                                }));
                              }}
                              className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                              placeholder="0.00"
                            />
                          </div>
                          <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                            Rate (₹/MT)
                          </label>
                        </div>

                        {/* Remove Button */}
                        <div className="sm:col-span-12 flex justify-end mt-4">
                          {formData.different.materials.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  different: {
                                    ...prev.different,
                                    materials: prev.different.materials.filter(
                                      (_: any, i: number) => i !== index,
                                    ),
                                  },
                                }));
                              }}
                              className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4  rounded-lg hover:bg-red-950/40 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                              Remove Material
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                )}

              {/* Add New Material Button */}
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    different: {
                      ...prev.different,
                      materials: [
                        ...(prev.different?.materials || []),
                        { name: "", quantity: "", rate: "" },
                      ],
                    },
                  }));
                }}
                className="w-full py-3.5 px-6 bg-violet-900/30 hover:bg-violet-900/50 
                   border border-violet-700/40 rounded-lg text-violet-300 
                   transition-colors font-medium flex items-center justify-center gap-2"
              >
                <span className="text-xl">+</span> Add New Material
              </button>
            </div>

            {/* Summary & Payment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-gray-700/50">
              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.different?.totalAmount
                      ? `₹ ${Number(formData.different.totalAmount).toLocaleString("en-IN")}`
                      : "—"
                  }
                  className="w-full px-4 py-3.5 bg-gray-900/60 border border-gray-700 rounded-md text-violet-300 font-bold cursor-not-allowed"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400">
                  Total Amount (excl. GST)
                </label>
              </div>

              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="different.accountWithGst"
                    value={formData.different?.accountWithGst || ""}
                    onChange={handleChange}
                    className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                    placeholder="0.00"
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Account Payment (incl. GST)
                </label>
              </div>

              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="different.cash"
                    value={formData.different?.cash || ""}
                    onChange={handleChange}
                    className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                    placeholder="0.00"
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Cash Payment (excl. GST)
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.different?.totalPaying
                      ? `₹ ${Number(formData.different.totalPaying).toLocaleString("en-IN")}`
                      : "—"
                  }
                  className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-700 rounded-md text-emerald-400 font-bold cursor-not-allowed"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400">
                  Total Paying
                </label>
              </div>

              <div className="relative md:col-span-2 lg:col-span-4 mt-3">
                <input
                  readOnly
                  value={
                    formData.different?.remaining === undefined
                      ? "—"
                      : formData.different.remaining > 0
                        ? `Remaining to Pay: ₹ ${Number(formData.different.remaining).toLocaleString("en-IN")}`
                        : formData.different.remaining < 0
                          ? `Excess / Advance: ₹ ${Math.abs(Number(formData.different.remaining)).toLocaleString("en-IN")}`
                          : "Payment Balanced ✓"
                  }
                  className={`w-full px-5 py-4 rounded-lg font-medium border text-center transition-colors ${
                    formData.different?.remaining === undefined
                      ? "bg-gray-900/40 border-gray-700 text-gray-400"
                      : formData.different.remaining > 0
                        ? "bg-amber-950/50 border-amber-700/70 text-amber-300"
                        : formData.different.remaining < 0
                          ? "bg-red-950/50 border-red-700/70 text-red-300"
                          : "bg-emerald-950/50 border-emerald-700/70 text-emerald-400"
                  }`}
                />
                <label className="absolute left-5 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400">
                  Balance Status
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
