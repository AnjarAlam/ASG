"use client";

import { useEffect } from "react";
import { Scale, Trash2, PlusCircle } from "lucide-react";

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

const MATERIAL_OPTIONS = [
  { value: "E-ROM", label: "E-ROM" },
  { value: "F-STEAM", label: "F-STEAM" },
  { value: "B-BOULDER", label: "B-BOULDER" },
];

export default function BillingMethodSection({
  formData,
  setFormData,
  handleChange,
}: BillingMethodProps) {
  // Show top fields unless "different" or "weight" is selected without "half"
  const showTopFields = !(
    (formData.billingMethods?.includes("different") || formData.billingMethods?.includes("weight")) &&
    !formData.billingMethods?.includes("half")
  );

  // ────────────────────────────────────────────────
  //  HALF BILLING REAL-TIME CALCULATION
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!formData.billingMethods?.includes("half")) return;

    const totalCoal   = Number(formData.totalWeight)   || 0;
    const billingRate = Number(formData.billingRate) || 0;
    const actualRate  = Number(formData.actualRate)  || 0;
    const gstRate     = Number(formData.gstRate ?? 18);

    if (totalCoal <= 0 || billingRate <= 0) return;

    const billingBase    = totalCoal * billingRate;
    const gstAmount      = billingBase * (gstRate / 100);
    const billingWithGst = billingBase + gstAmount;

    const cashAmount     = totalCoal * (actualRate - billingRate);

    const tcsAmount = billingWithGst * 0.01; // TCS 1% on incl. GST

    setFormData((prev: any) => ({
      ...prev,
      half: {
        ...prev.half,
        billingWithGst: billingWithGst.toFixed(2),
        cashAmount:     cashAmount.toFixed(2),
        gstAmount:      gstAmount.toFixed(2),
        tcsAmount:      tcsAmount.toFixed(2),
      },
    }));
  }, [
    formData.billingMethods,
    formData.totalWeight,
    formData.billingRate,
    formData.actualRate,
    formData.gstRate,
  ]);

  // ────────────────────────────────────────────────
  //  HALF WEIGHT BILLING – per line billing & actual rate + TCS
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!formData.billingMethods?.includes("weight") || !Array.isArray(formData.weight?.lines)) return;

    let totalBillingWithGst = 0;
    let totalCashAmount = 0;
    let totalGstAmount = 0;

    const gstRate = Number(formData.gstRate ?? 18);

    for (const line of formData.weight.lines) {
      const weight = Number(line.loading) || 0;
      const billingRate = Number(line.billingRate) || 0;
      const actualRate = Number(line.actualRate) || 0;

      const billingBase = weight * billingRate;
      const gst = billingBase * (gstRate / 100);
      const billingWithGst = billingBase + gst;
      const cash = weight * (actualRate - billingRate);

      totalBillingWithGst += billingWithGst;
      totalCashAmount += cash;
      totalGstAmount += gst;
    }

    const totalTcsAmount = totalBillingWithGst * 0.01;

    setFormData((prev: any) => ({
      ...prev,
      weight: {
        ...prev.weight,
        billingWithGst: totalBillingWithGst.toFixed(2),
        cashAmount: totalCashAmount.toFixed(2),
        gstAmount: totalGstAmount.toFixed(2),
        tcsAmount: totalTcsAmount.toFixed(2),
      },
    }));
  }, [
    formData.billingMethods,
    formData.weight?.lines,
    formData.gstRate,
  ]);

  // ────────────────────────────────────────────────
  //  DIFFERENT MATERIAL BILLING – with TCS
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (
      !formData.billingMethods?.includes("different") ||
      !Array.isArray(formData.different?.materials)
    )
      return;

    let totalBillingWithGst = 0;
    let totalCashAmount = 0;
    let totalGstAmount = 0;

    const gstRate = Number(formData.gstRate ?? 18);

    for (const mat of formData.different.materials) {
      const qty = Number(mat.quantity) || 0;
      const billingRate = Number(mat.billingRate) || 0;
      const actualRate = Number(mat.actualRate) || 0;

      const base = qty * billingRate;
      const gst = base * (gstRate / 100);
      const withGst = base + gst;
      const cash = qty * (actualRate - billingRate);

      totalBillingWithGst += withGst;
      totalCashAmount += cash;
      totalGstAmount += gst;
    }

    const totalTcsAmount = totalBillingWithGst * 0.01;

    setFormData((prev: any) => ({
      ...prev,
      different: {
        ...prev.different,
        billingWithGst: totalBillingWithGst.toFixed(2),
        cashAmount: totalCashAmount.toFixed(2),
        gstAmount: totalGstAmount.toFixed(2),
        tcsAmount: totalTcsAmount.toFixed(2),
      },
    }));
  }, [
    formData.billingMethods,
    formData.different?.materials,
    formData.gstRate,
  ]);

  const addMethod = (value: string) => {
    if (!value || formData.billingMethods?.includes(value)) return;

    setFormData((prev: any) => {
      const newData = { ...prev };

      if (value === "half") {
        newData.half = {
          billingWithGst: "",
          cashAmount: "",
          gstAmount: "",
          tcsAmount: "",
        };
      } else if (value === "weight") {
        newData.weight = {
          lines: [{ loading: "", billingRate: "", actualRate: "" }],
          billingWithGst: "",
          cashAmount: "",
          gstAmount: "",
          tcsAmount: "",
        };
      } else if (value === "different") {
        newData.different = {
          materials: [{ name: "E-ROM", quantity: "", billingRate: "", actualRate: "" }],
          billingWithGst: "",
          cashAmount: "",
          gstAmount: "",
          tcsAmount: "",
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
        billingMethods: prev.billingMethods?.filter((m: string) => m !== method) || [],
      };
    });
  };

  return (
    <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
      <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
        <Scale className="h-6 w-6 text-violet-400" />
        Billing & Rates
      </h2>

      {/* Top global inputs */}
      {showTopFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative">
            <input
              type="text"
              name="totalWeight"
              value={formData.totalWeight || ""}
              onChange={handleChange}
              className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
              placeholder=" "
            />
            <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
              Total Weight / Qty (MT)
            </label>
          </div>

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
            <input
              type="text"
              name="gstRate"
              value={formData.gstRate ?? "18"}
              onChange={handleChange}
              className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
              placeholder="18"
            />
            <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
              GST Rate (%)
            </label>
          </div>
        </div>
      )}

      <div className="space-y-8 pb-20">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 pt-4">
              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.half?.billingWithGst
                      ? `₹ ${Number(formData.half.billingWithGst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"
                  }
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-violet-300 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  Billing Amount (incl. GST)
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.half?.cashAmount
                      ? `₹ ${Number(formData.half.cashAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"
                  }
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-amber-300 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  Cash Amount
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.half?.gstAmount && formData.half?.tcsAmount
                      ? `₹ ${(Number(formData.half.gstAmount) + Number(formData.half.tcsAmount)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"
                  }
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-cyan-400 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  TAX
                </label>
                <p className="text-xs text-gray-500 text-center mt-2">
                  GST: ₹{Number(formData.half?.gstAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  <br />
                  TCS @1%: ₹{Number(formData.half?.tcsAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>

            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Calculated from global values: Total Weight × Billing Rate / Actual Rate
            </p>
          </div>
        )}

        {/* HALF WEIGHT BILLING */}
        {formData.billingMethods?.includes("weight") && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-violet-300">
                Half Weight Billing (Multiple Loading Lines)
              </h4>
              <button
                type="button"
                onClick={() => removeMethod("weight")}
                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-950/30"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              {Array.isArray(formData.weight?.lines) &&
                formData.weight.lines.map((line: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-900/30 p-6 rounded-lg border border-gray-800/50"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
                      <div className="sm:col-span-4 relative">
                        <input
                          type="text"
                          value={line.loading || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => {
                              const newLines = [...(prev.weight?.lines || [])];
                              newLines[index] = { ...newLines[index], loading: value };
                              return { ...prev, weight: { ...prev.weight, lines: newLines } };
                            });
                          }}
                          className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
                          placeholder="0.00"
                        />
                        <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                          Loading Weight (MT)
                        </label>
                      </div>

                      <div className="sm:col-span-4 relative">
                        <div className="flex">
                          <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                            ₹
                          </span>
                          <input
                            type="text"
                            value={line.billingRate || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => {
                                const newLines = [...(prev.weight?.lines || [])];
                                newLines[index] = { ...newLines[index], billingRate: value };
                                return { ...prev, weight: { ...prev.weight, lines: newLines } };
                              });
                            }}
                            className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                          Billing Rate (₹/MT)
                        </label>
                      </div>

                      <div className="sm:col-span-4 relative">
                        <div className="flex">
                          <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                            ₹
                          </span>
                          <input
                            type="text"
                            value={line.actualRate || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => {
                                const newLines = [...(prev.weight?.lines || [])];
                                newLines[index] = { ...newLines[index], actualRate: value };
                                return { ...prev, weight: { ...prev.weight, lines: newLines } };
                              });
                            }}
                            className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                          Actual Rate (₹/MT)
                        </label>
                      </div>
                    </div>

                    {formData.weight.lines.length > 1 && (
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => {
                              const newLines = prev.weight.lines.filter(
                                (_: any, i: number) => i !== index
                              );
                              return { ...prev, weight: { ...prev.weight, lines: newLines } };
                            });
                          }}
                          className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                          Remove Line
                        </button>
                      </div>
                    )}
                  </div>
                ))}

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    weight: {
                      ...prev.weight,
                      lines: [...(prev.weight?.lines || []), { loading: "", billingRate: "", actualRate: "" }],
                    },
                  }));
                }}
                className="w-full py-3.5 px-6 bg-violet-900/30 hover:bg-violet-900/50 border border-violet-700/40 rounded-lg text-violet-300 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Add New Loading Line
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-700/50">
              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.weight?.billingWithGst
                      ? `₹ ${Number(formData.weight.billingWithGst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"
                  }
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-violet-300 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  Billing Amount (incl. GST)
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.weight?.cashAmount
                      ? `₹ ${Number(formData.weight.cashAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"
                  }
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-amber-300 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  Cash Amount
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.weight?.gstAmount && formData.weight?.tcsAmount
                      ? `₹ ${(Number(formData.weight.gstAmount) + Number(formData.weight.tcsAmount)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"
                  }
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-cyan-400 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  TAX
                </label>
                <p className="text-xs text-gray-500 text-center mt-2">
                  GST: ₹{Number(formData.weight?.gstAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  <br />
                  TCS @1%: ₹{Number(formData.weight?.tcsAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>

            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Calculated from loading weights × billing/actual rates
            </p>
          </div>
        )}

        {/* DIFFERENT MATERIAL BILLING */}
        {formData.billingMethods?.includes("different") && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-violet-300">
                Different Material Billing
              </h4>
              <button
                type="button"
                onClick={() => removeMethod("different")}
                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-950/30"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              {Array.isArray(formData.different?.materials) &&
                formData.different.materials.map((material: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-900/30 p-6 rounded-lg border border-gray-800/50"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
                      <div className="sm:col-span-4 relative">
                        <select
                          value={material.name || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              different: {
                                ...prev.different,
                                materials: prev.different.materials.map((m: any, i: number) =>
                                  i === index ? { ...m, name: value } : m
                                ),
                              },
                            }));
                          }}
                          className="peer w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white appearance-none"
                        >
                          <option value="">Select Material</option>
                          {MATERIAL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                          Material Type
                        </label>
                      </div>

                      <div className="sm:col-span-2 relative">
                        <input
                          type="text"
                          value={material.quantity || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              different: {
                                ...prev.different,
                                materials: prev.different.materials.map((m: any, i: number) =>
                                  i === index ? { ...m, quantity: value } : m
                                ),
                              },
                            }));
                          }}
                          className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
                          placeholder="0.00"
                        />
                        <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                          Quantity (MT)
                        </label>
                      </div>

                      <div className="sm:col-span-3 relative">
                        <div className="flex">
                          <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                            ₹
                          </span>
                          <input
                            type="text"
                            value={material.billingRate || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                different: {
                                  ...prev.different,
                                  materials: prev.different.materials.map((m: any, i: number) =>
                                    i === index ? { ...m, billingRate: value } : m
                                  ),
                                },
                              }));
                            }}
                            className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                          Billing Rate (₹/MT)
                        </label>
                      </div>

                      <div className="sm:col-span-3 relative">
                        <div className="flex">
                          <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                            ₹
                          </span>
                          <input
                            type="text"
                            value={material.actualRate || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                different: {
                                  ...prev.different,
                                  materials: prev.different.materials.map((m: any, i: number) =>
                                    i === index ? { ...m, actualRate: value } : m
                                  ),
                                },
                              }));
                            }}
                            className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                          Actual Rate (₹/MT)
                        </label>
                      </div>
                    </div>

                    {formData.different.materials.length > 1 && (
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              different: {
                                ...prev.different,
                                materials: prev.different.materials.filter(
                                  (_: any, i: number) => i !== index
                                ),
                              },
                            }));
                          }}
                          className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                          Remove Line
                        </button>
                      </div>
                    )}
                  </div>
                ))}

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    different: {
                      ...prev.different,
                      materials: [
                        ...(prev.different?.materials || []),
                        { name: "E-ROM", quantity: "", billingRate: "", actualRate: "" },
                      ],
                    },
                  }));
                }}
                className="w-full py-3.5 px-6 bg-violet-900/30 hover:bg-violet-900/50 border border-violet-700/40 rounded-lg text-violet-300 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Add Material Line
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-700/50">
              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.different?.billingWithGst
                      ? `₹ ${Number(formData.different.billingWithGst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"
                  }
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-violet-300 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  Billing Amount (incl. GST)
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.different?.cashAmount
                      ? `₹ ${Number(formData.different.cashAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"
                  }
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-amber-300 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  Cash Amount
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={
                    formData.different?.gstAmount && formData.different?.tcsAmount
                      ? `₹ ${(Number(formData.different.gstAmount) + Number(formData.different.tcsAmount)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"
                  }
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-cyan-400 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  TAX
                </label>
                <p className="text-xs text-gray-500 text-center mt-2">
                  GST: ₹{Number(formData.different?.gstAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  <br />
                  TCS @1%: ₹{Number(formData.different?.tcsAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>

            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Calculated from entered materials × quantities × rates
            </p>
          </div>
        )}
      </div>

      {/* Add Billing Method – bottom right */}
      <div className="fixed bottom-6 right-6 z-10 md:static md:flex md:justify-end">
        <div className="bg-gray-900/90 backdrop-blur-sm border border-violet-700/40 rounded-xl shadow-2xl p-4 w-80 md:w-auto">
          <h3 className="text-sm font-medium mb-3 text-violet-300 flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Add Billing Method
          </h3>
          <select
            value=""
            onChange={(e) => addMethod(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-md outline-none text-white appearance-none"
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
    </section>
  );
}