"use client";

import { useEffect } from "react";
import { Scale, Trash2, PlusCircle } from "lucide-react";
import { useOutwardStore } from "../../store/outward-store"; // adjust path if needed

interface BillingMethodProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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
  const { loading: storeLoading } = useOutwardStore();

  const showTopFields = !(
    (formData.billingMethods?.includes("different") || formData.billingMethods?.includes("weight")) &&
    !formData.billingMethods?.includes("half")
  );

  useEffect(() => {
    if (!formData.billingMethods?.includes("half")) return;

    const netWeight   = Number(formData.netWeight) || 0;
    const billingRate = Number(formData.billingRate) || 0;
    const actualRate  = Number(formData.actualRate)  || 0;
    const gstRate     = Number(formData.gstRate ?? 18);

    if (netWeight <= 0 || billingRate <= 0) return;

    const base           = netWeight * billingRate;
    const gstAmount      = base * (gstRate / 100);
    const billingTotal   = base + gstAmount;
    const cashAmount     = netWeight * (actualRate - billingRate);
    const tcsAmount      = billingTotal * 0.01;
    const totalTax       = gstAmount + tcsAmount;

    setFormData((prev: any) => ({
      ...prev,
      halfBilling: {
        cashAmount: cashAmount.toFixed(2),
        billingTotalAmount: billingTotal.toFixed(2),
        tax: totalTax.toFixed(2),
      },
    }));
  }, [
    formData.billingMethods,
    formData.netWeight,
    formData.billingRate,
    formData.actualRate,
    formData.gstRate,
  ]);

  useEffect(() => {
    if (!formData.billingMethods?.includes("weight") || !Array.isArray(formData.halfWeightBilling?.lines)) return;

    let totalBilling = 0;
    let totalCash    = 0;
    let totalGst     = 0;

    const gstRate = Number(formData.gstRate ?? 18);

    for (const line of formData.halfWeightBilling.lines) {
      const weight      = Number(line.loading) || 0;
      const br          = Number(line.billingRate) || 0;
      const ar          = Number(line.actualRate) || 0;

      if (weight <= 0) continue;

      const base    = weight * br;
      const gst     = base * (gstRate / 100);
      const withGst = base + gst;
      const cash    = weight * (ar - br);

      totalBilling += withGst;
      totalCash    += cash;
      totalGst     += gst;
    }

    const tcs      = totalBilling * 0.01;
    const totalTax = totalGst + tcs;

    setFormData((prev: any) => ({
      ...prev,
      halfWeightBilling: {
        ...prev.halfWeightBilling,
        cashAmount: totalCash.toFixed(2),
        billingTotalAmount: totalBilling.toFixed(2),
        tax: totalTax.toFixed(2),
      },
    }));
  }, [formData.billingMethods, formData.halfWeightBilling?.lines, formData.gstRate]);

  useEffect(() => {
    if (!formData.billingMethods?.includes("different") || !Array.isArray(formData.differentMaterial)) return;

    let totalBilling = 0;
    let totalCash    = 0;
    let totalGst     = 0;

    const gstRate = Number(formData.gstRate ?? 18);

    for (const mat of formData.differentMaterial) {
      const qty = Number(mat.quantity) || 0;
      const br  = Number(mat.billingRate) || 0;
      const ar  = Number(mat.actualRate) || 0;

      if (qty <= 0) continue;

      const base    = qty * br;
      const gst     = base * (gstRate / 100);
      const withGst = base + gst;
      const cash    = qty * (ar - br);

      totalBilling += withGst;
      totalCash    += cash;
      totalGst     += gst;
    }

    const tcs      = totalBilling * 0.01;
    const totalTax = totalGst + tcs;

    // We only update display values – actual lines stay in differentMaterial
    // You can add display fields if you want (e.g. differentMaterialTotals)
  }, [formData.billingMethods, formData.differentMaterial, formData.gstRate]);

  const addMethod = (value: string) => {
    if (!value || formData.billingMethods?.includes(value)) return;

    setFormData((prev: any) => {
      const newData = { ...prev };
      newData.billingMethods = [...(prev.billingMethods || []), value];

      if (value === "half") {
        newData.halfBilling = {
          cashAmount: "",
          billingTotalAmount: "",
          tax: "",
        };
      } else if (value === "weight") {
        newData.halfWeightBilling = {
          lines: [{ loading: "", billingRate: "", actualRate: "" }],
          cashAmount: "",
          billingTotalAmount: "",
          tax: "",
        };
      } else if (value === "different") {
        newData.differentMaterial = [
          { name: "E-ROM", quantity: "", billingRate: "", actualRate: "" },
        ];
      }

      return newData;
    });
  };

  const removeMethod = (method: string) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      if (method === "half")      delete newData.halfBilling;
      if (method === "weight")    delete newData.halfWeightBilling;
      if (method === "different") delete newData.differentMaterial;

      newData.billingMethods = prev.billingMethods?.filter((m: string) => m !== method) || [];
      return newData;
    });
  };

  return (
    <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg relative">
      <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
        <Scale className="h-6 w-6 text-violet-400" />
        Billing & Rates
      </h2>

      {/* Global rate inputs – shown conditionally */}
      {showTopFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="relative">
            <input
              type="text"
              name="netWeight" // changed from totalWeight → more consistent with main form
              value={formData.netWeight || ""}
              readOnly
              className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 rounded-md outline-none text-white bg-gray-800/40 cursor-not-allowed"
              placeholder=" "
            />
            <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400">
              Net Weight (MT)
            </label>
          </div>

          <div className="relative">
            <div className="flex">
              <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">₹</span>
              <input
                type="text"
                name="billingRate"
                value={formData.billingRate || ""}
                onChange={handleChange}
                placeholder="0.00"
                className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
              />
            </div>
            <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
              Billing Rate (₹/MT)
            </label>
          </div>

          <div className="relative">
            <div className="flex">
              <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">₹</span>
              <input
                type="text"
                name="actualRate"
                value={formData.actualRate || ""}
                onChange={handleChange}
                placeholder="0.00"
                className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
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

      <div className="space-y-8 pb-24 md:pb-20">
        {/* ── Half Billing ── */}
        {formData.billingMethods?.includes("half") && formData.halfBilling && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-violet-300">Half Billing (Account + Cash with GST)</h4>
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
                  value={formData.halfBilling?.billingTotalAmount ? `₹ ${Number(formData.halfBilling.billingTotalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-violet-300 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  Billing Amount (incl. GST)
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={formData.halfBilling?.cashAmount ? `₹ ${Number(formData.halfBilling.cashAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-amber-300 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  Cash Amount
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={formData.halfBilling?.tax ? `₹ ${Number(formData.halfBilling.tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-cyan-400 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  TAX (GST + TCS)
                </label>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Calculated from net weight × billing rate / actual rate
            </p>
          </div>
        )}

        {/* ── Half Weight Billing ── */}
        {formData.billingMethods?.includes("weight") && formData.halfWeightBilling && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-violet-300">Half Weight Billing (Multiple Loading Lines)</h4>
              <button
                type="button"
                onClick={() => removeMethod("weight")}
                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-950/30"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              {formData.halfWeightBilling.lines.map((line: any, idx: number) => (
                <div key={idx} className="bg-gray-900/30 p-6 rounded-lg border border-gray-800/50">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
                    <div className="sm:col-span-4 relative">
                      <input
                        type="text"
                        value={line.loading || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const lines = [...prev.halfWeightBilling.lines];
                            lines[idx] = { ...lines[idx], loading: val };
                            return { ...prev, halfWeightBilling: { ...prev.halfWeightBilling, lines } };
                          });
                        }}
                        placeholder="0.00"
                        className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
                      />
                      <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400">
                        Loading Weight (MT)
                      </label>
                    </div>

                    <div className="sm:col-span-4 relative">
                      <div className="flex">
                        <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">₹</span>
                        <input
                          type="text"
                          value={line.billingRate || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const lines = [...prev.halfWeightBilling.lines];
                              lines[idx] = { ...lines[idx], billingRate: val };
                              return { ...prev, halfWeightBilling: { ...prev.halfWeightBilling, lines } };
                            });
                          }}
                          placeholder="0.00"
                          className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                        />
                      </div>
                      <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400">
                        Billing Rate (₹/MT)
                      </label>
                    </div>

                    <div className="sm:col-span-4 relative">
                      <div className="flex">
                        <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">₹</span>
                        <input
                          type="text"
                          value={line.actualRate || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const lines = [...prev.halfWeightBilling.lines];
                              lines[idx] = { ...lines[idx], actualRate: val };
                              return { ...prev, halfWeightBilling: { ...prev.halfWeightBilling, lines } };
                            });
                          }}
                          placeholder="0.00"
                          className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                        />
                      </div>
                      <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400">
                        Actual Rate (₹/MT)
                      </label>
                    </div>
                  </div>

                  {formData.halfWeightBilling.lines.length > 1 && (
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => {
                            const lines = prev.halfWeightBilling.lines.filter((_: any, i: number) => i !== idx);
                            return { ...prev, halfWeightBilling: { ...prev.halfWeightBilling, lines } };
                          });
                        }}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-950/40"
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
                    halfWeightBilling: {
                      ...prev.halfWeightBilling,
                      lines: [...(prev.halfWeightBilling?.lines || []), { loading: "", billingRate: "", actualRate: "" }],
                    },
                  }));
                }}
                className="w-full py-3.5 px-6 bg-violet-900/30 hover:bg-violet-900/50 border border-violet-700/40 rounded-lg text-violet-300 font-medium flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Add Loading Line
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-700/50">
              <div className="relative">
                <input
                  readOnly
                  value={formData.halfWeightBilling?.billingTotalAmount ? `₹ ${Number(formData.halfWeightBilling.billingTotalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-violet-300 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  Billing Amount (incl. GST)
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={formData.halfWeightBilling?.cashAmount ? `₹ ${Number(formData.halfWeightBilling.cashAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-amber-300 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  Cash Amount
                </label>
              </div>

              <div className="relative">
                <input
                  readOnly
                  value={formData.halfWeightBilling?.tax ? `₹ ${Number(formData.halfWeightBilling.tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                  className="w-full px-6 py-8 bg-gray-900/80 border border-gray-600 rounded-xl text-cyan-400 text-2xl md:text-3xl font-bold cursor-not-allowed text-center shadow-inner"
                />
                <label className="absolute left-6 -top-3 px-3 bg-gray-800 text-sm font-semibold text-gray-300">
                  TAX (GST + TCS)
                </label>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Calculated from all loading lines
            </p>
          </div>
        )}

        {/* ── Different Material Billing ── */}
        {formData.billingMethods?.includes("different") && formData.differentMaterial && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-violet-300">Different Material Billing</h4>
              <button
                type="button"
                onClick={() => removeMethod("different")}
                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-950/30"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              {formData.differentMaterial.map((mat: any, idx: number) => (
                <div key={idx} className="bg-gray-900/30 p-6 rounded-lg border border-gray-800/50">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
                    <div className="sm:col-span-4 relative">
                      <select
                        value={mat.name || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const mats = [...prev.differentMaterial];
                            mats[idx] = { ...mats[idx], name: val };
                            return { ...prev, differentMaterial: mats };
                          });
                        }}
                        className="peer w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white appearance-none"
                      >
                        <option value="">Select Material</option>
                        {MATERIAL_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400">
                        Material Type
                      </label>
                    </div>

                    <div className="sm:col-span-2 relative">
                      <input
                        type="text"
                        value={mat.quantity || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const mats = [...prev.differentMaterial];
                            mats[idx] = { ...mats[idx], quantity: val };
                            return { ...prev, differentMaterial: mats };
                          });
                        }}
                        placeholder="0.00"
                        className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-white bg-transparent"
                      />
                      <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400">
                        Quantity (MT)
                      </label>
                    </div>

                    <div className="sm:col-span-3 relative">
                      <div className="flex">
                        <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">₹</span>
                        <input
                          type="text"
                          value={mat.billingRate || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const mats = [...prev.differentMaterial];
                              mats[idx] = { ...mats[idx], billingRate: val };
                              return { ...prev, differentMaterial: mats };
                            });
                          }}
                          placeholder="0.00"
                          className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                        />
                      </div>
                      <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400">
                        Billing Rate
                      </label>
                    </div>

                    <div className="sm:col-span-3 relative">
                      <div className="flex">
                        <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">₹</span>
                        <input
                          type="text"
                          value={mat.actualRate || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const mats = [...prev.differentMaterial];
                              mats[idx] = { ...mats[idx], actualRate: val };
                              return { ...prev, differentMaterial: mats };
                            });
                          }}
                          placeholder="0.00"
                          className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-white bg-transparent"
                        />
                      </div>
                      <label className="absolute left-4 -top-2 px-2 bg-gray-800 text-xs font-medium text-gray-400 peer-focus:text-violet-400">
                        Actual Rate
                      </label>
                    </div>
                  </div>

                  {formData.differentMaterial.length > 1 && (
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => {
                            const mats = prev.differentMaterial.filter((_: any, i: number) => i !== idx);
                            return { ...prev, differentMaterial: mats };
                          });
                        }}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-950/40"
                      >
                        <Trash2 className="w-5 h-5" />
                        Remove
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
                    differentMaterial: [
                      ...(prev.differentMaterial || []),
                      { name: "E-ROM", quantity: "", billingRate: "", actualRate: "" },
                    ],
                  }));
                }}
                className="w-full py-3.5 px-6 bg-violet-900/30 hover:bg-violet-900/50 border border-violet-700/40 rounded-lg text-violet-300 font-medium flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Add Material
              </button>
            </div>

            {/* You can add total display cards here like in the other sections if desired */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Totals calculated from all materials (display only – sent as line items)
            </p>
          </div>
        )}
      </div>

      {/* Floating / bottom add method selector */}
      <div className="fixed bottom-6 right-6 z-10 md:static md:flex md:justify-end">
        <div className="bg-gray-900/90 backdrop-blur-sm border border-violet-700/40 rounded-xl shadow-2xl p-4 w-80 md:w-auto">
          <h3 className="text-sm font-medium mb-3 text-violet-300 flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Add Billing Method
          </h3>
          <select
            value=""
            onChange={(e) => addMethod(e.target.value)}
            disabled={storeLoading}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-md outline-none text-white appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">Select method...</option>
            {billingOptions
              .filter(opt => !formData.billingMethods?.includes(opt.value))
              .map(opt => (
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