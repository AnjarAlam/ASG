"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  X,
  Truck,
  Scale,
  Package,
  FileText,
  Upload,
  Trash2,
} from "lucide-react";
import { useInwardLocalStore, VehicleSize } from "@/store/inward-local-store";

interface LocalInwardFormProps {
  inwardToken: string;
}

export default function LocalInwardForm({ inwardToken }: LocalInwardFormProps) {
  const router = useRouter();
  const { createLocalInward, loading: storeLoading } = useInwardLocalStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const vehicleInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    tokenNumber: inwardToken || "",
    vehicleNumber: "",
    vehicleSize: VehicleSize.SMALL as VehicleSize,

    supplierName: "",
    supplier: "COLLIARY" as "COLLIARY" | "PARTY",

    doNumber: "",
    rstNumber: "",
    munshiana: "350",
    note: "",

    coalGrade: "E",
    coalType: "ROM",
    coalSize: "",
    area: "",

    grossWeight: "",
    tareWeight: "",
    netWeight: "",

    overloadingWeight: "",
    overloadingRate: "",
    overloadingAmount: "",

    inwardDateTime: new Date().toISOString().slice(0, 16),

    images: [] as File[],
    documents: [] as File[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Auto-focus first input
  useEffect(() => {
    vehicleInputRef.current?.focus();
  }, []);

  // Update token if parent passes a new one (rare case)
  useEffect(() => {
    if (inwardToken && inwardToken !== formData.tokenNumber) {
      setFormData((prev) => ({ ...prev, tokenNumber: inwardToken }));
    }
  }, [inwardToken]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Net weight auto-calc
      if (name === "grossWeight" || name === "tareWeight") {
        const g = Number(next.grossWeight) || 0;
        const t = Number(next.tareWeight) || 0;
        next.netWeight = g > t ? (g - t).toFixed(2) : "";
      }

      // Overloading amount auto-calc
      if (name === "overloadingWeight" || name === "overloadingRate") {
        const w = Number(next.overloadingWeight) || 0;
        const r = Number(next.overloadingRate) || 0;
        next.overloadingAmount = (w * r).toFixed(2);
      }

      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...newFiles],
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const canAdd = 3 - formData.images.length;
    if (canAdd <= 0) return;

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...selected.slice(0, canAdd)],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = "Required";
    if (!formData.supplierName.trim()) newErrors.supplierName = "Required";
    if (!formData.rstNumber.trim()) newErrors.rstNumber = "Required";
    if (!formData.coalSize.trim()) newErrors.coalSize = "Required";
    if (!formData.area.trim()) newErrors.area = "Required";

    if (!formData.grossWeight || Number(formData.grossWeight) <= 0)
      newErrors.grossWeight = "Enter valid gross weight";
    if (Number(formData.tareWeight) < 0) newErrors.tareWeight = "Tare cannot be negative";
    if (Number(formData.grossWeight) <= Number(formData.tareWeight))
      newErrors.grossWeight = "Gross must be > Tare";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = {
        ...formData,
        tokenNumber: formData.tokenNumber,
        vehicleSize: formData.vehicleSize,
        grossWeight: Number(formData.grossWeight) || 0,
        tareWeight: Number(formData.tareWeight) || 0,
        netWeight: Number(formData.netWeight) || 0,
        overloadingWeight: Number(formData.overloadingWeight) || 0,
        overloadingRate: Number(formData.overloadingRate) || 0,
        overloadingAmount: Number(formData.overloadingAmount) || 0,
        images: formData.images.map((f) => f.name),
        documents: formData.documents.map((f) => f.name),
        inwardType: "LOCAL",
      };

      console.log("LOCAL INWARD PAYLOAD →", JSON.stringify(payload, null, 2));

      await createLocalInward(payload);

      alert("Local Inward entry saved successfully!");
      router.push("/dashboard/inward");
    } catch (err: any) {
      console.error("Error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save inward entry";
      alert(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Token Banner (same as global) ──────────────────────────────── */}
          {/* <div className="bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border border-violet-800/30 rounded-xl px-6 py-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1 font-medium">
                  Inward Token
                </p>
                <p className="text-xl sm:text-2xl font-mono font-bold text-violet-300 tracking-wider">
                  {formData.tokenNumber || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-block w-3 h-3 rounded-full bg-violet-500"></span>
                Local (AIN)
              </div>
            </div>
          </div> */}

          {/* ── Vehicle & Coal Sections (2-col desktop, 1-col mobile) ──────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Vehicle & Basic Information */}
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7 pb-4 border-b border-gray-700/50">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Truck className="h-6 w-6 text-violet-400" />
                  Vehicle & Basic Information
                </h2>

                <div className="inline-flex rounded-full bg-gray-800/70 p-1 border border-gray-700/60 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, supplier: "COLLIARY" }))}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      formData.supplier === "COLLIARY"
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                        : "text-gray-300 hover:bg-gray-700/60"
                    }`}
                  >
                    Colliery
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, supplier: "PARTY" }))}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      formData.supplier === "PARTY"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                        : "text-gray-300 hover:bg-gray-700/60"
                    }`}
                  >
                    Party
                  </button>
                </div>
              </div>

              <div className="space-y-7">
                <div className="relative">
                  <input
                    ref={vehicleInputRef}
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer w-full px-4 py-3.5 border-b-2 ${
                      errors.vehicleNumber ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                    } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                    Vehicle Number *
                  </label>
                  {errors.vehicleNumber && <p className="text-red-400 text-xs mt-1.5">{errors.vehicleNumber}</p>}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer w-full px-4 py-3.5 border-b-2 ${
                      errors.supplierName ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                    } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                    {formData.supplier === "COLLIARY" ? "Colliery Name *" : "Party Name *"}
                  </label>
                  {errors.supplierName && <p className="text-red-400 text-xs mt-1.5">{errors.supplierName}</p>}
                </div>


                  <div className="relative">
                    <input
                      type="text"
                      name="doNumber"
                      value={formData.doNumber}
                      onChange={handleChange}
                      placeholder=" "
                      className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200"
                    />
                    <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                      DO Number
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="rstNumber"
                      value={formData.rstNumber}
                      onChange={handleChange}
                      placeholder=" "
                      className={`peer w-full px-4 py-3.5 border-b-2 ${
                        errors.rstNumber ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                      } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                    />
                    <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                      RST Number *
                    </label>
                    {errors.rstNumber && <p className="text-red-400 text-xs mt-1.5">{errors.rstNumber}</p>}
                  </div>
              </div>
            </section>

            {/* Coal Details – single column as requested */}
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-7 pb-4 border-b border-gray-700/50">
                <Package className="h-6 w-6 text-violet-400" />
                Coal Details
              </h2>

              <div className="space-y-6">
                <div className="relative">
                  <select
                    name="coalGrade"
                    value={formData.coalGrade}
                    onChange={(e) => {
                      const val = e.target.value;
                      let type = "ROM";
                      if (val === "F") type = "Steam";
                      if (val === "B") type = "Boulders";
                      setFormData((p) => ({ ...p, coalGrade: val, coalType: type }));
                    }}
                    className="w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 focus:border-indigo-500 rounded-md outline-none text-base text-white appearance-none"
                  >
                    <option value="E">E - ROM</option>
                    <option value="F">F - Steam</option>
                    <option value="B">B - Boulders</option>
                  </select>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                    Coal Grade & Type *
                  </label>
                </div>

                <div className="relative">
                  <select
                    name="coalSize"
                    value={formData.coalSize}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 focus:border-indigo-500 rounded-md outline-none text-base text-white appearance-none"
                  >
                    <option value="">Select size</option>
                    <option value="0-10">0-10 mm</option>
                    <option value="10-20">10-20 mm</option>
                    <option value="20-50">20-50 mm</option>
                    <option value="50-80">50-80 mm</option>
                    <option value="80-175">80-175 mm</option>
                  </select>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                    Size (mm) *
                  </label>
                  {errors.coalSize && <p className="text-red-400 text-xs mt-1.5">{errors.coalSize}</p>}
                </div>

                <div className="relative">
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 focus:border-indigo-500 rounded-md outline-none text-base text-white appearance-none"
                  >
                    <option value="">Select area</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                  </select>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                    Area *
                  </label>
                  {errors.area && <p className="text-red-400 text-xs mt-1.5">{errors.area}</p>}
                </div>

                <div className="relative">
                  <input
                    type="datetime-local"
                    name="inwardDateTime"
                    value={formData.inwardDateTime}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        inwardDateTime: new Date(e.target.value).toISOString(),
                      }))
                    }
                    className="w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white"
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                    Date & Time
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* ── Weightbridge ───────────────────────────────────────────────── */}
          <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
            <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <Scale className="h-6 w-6 text-violet-400" />
              Weightbridge Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="relative">
                <input
                  type="text"
                  name="grossWeight"
                  value={formData.grossWeight}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.grossWeight ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-lg font-medium text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Gross Weight (G) *
                </label>
                {errors.grossWeight && <p className="text-red-400 text-xs mt-1.5">{errors.grossWeight}</p>}
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="tareWeight"
                  value={formData.tareWeight}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.tareWeight ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-lg font-medium text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Tare Weight (T) *
                </label>
                {errors.tareWeight && <p className="text-red-400 text-xs mt-1.5">{errors.tareWeight}</p>}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.netWeight ? `${formData.netWeight} MT` : "—"}
                  readOnly
                  className="w-full px-4 py-3.5 bg-gray-900/50 border-b-2 border-gray-700 rounded-md outline-none text-lg font-bold text-emerald-300 cursor-not-allowed"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400">
                  Net Weight (N)
                </label>
              </div>
            </div>
          </section>

          {/* ── Munshiyana ─────────────────────────────────────────────────── */}
          <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-700/50 mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Scale className="h-6 w-6 text-violet-400" />
                Munshiyana
              </h2>

              <div className="inline-flex rounded-full bg-gray-800/80 p-1 shadow-inner border border-gray-700/40">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, vehicleSize: VehicleSize.SMALL, munshiana: "350" }))}
                  className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
                    formData.vehicleSize === VehicleSize.SMALL
                      ? "bg-violet-600 text-white shadow-md scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  Small
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, vehicleSize: VehicleSize.LARGE, munshiana: "1000" }))}
                  className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
                    formData.vehicleSize === VehicleSize.LARGE
                      ? "bg-violet-600 text-white shadow-md scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  Large
                </button>
              </div>
            </div>

            <div className="space-y-7">
              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-base text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="munshiana"
                    value={formData.munshiana}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+(\.\d{0,2})?$/.test(val)) {
                        setFormData((p) => ({ ...p, munshiana: val }));
                      }
                    }}
                    placeholder=" "
                    className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <label className="absolute left-[4.5rem] -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all pointer-events-none">
                  Amount (₹)
                </label>
              </div>

              <div className="relative">
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Remarks for Munshiyana, quality notes, observations..."
                  className="peer w-full px-4 py-3.5 border border-gray-700 rounded-xl focus:outline-none focus:border-violet-500 transition text-sm text-gray-200 placeholder-gray-500 resize-none bg-gray-950/30"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all pointer-events-none">
                  Remarks
                </label>
              </div>
            </div>
          </section>

          {/* ── Overloading ────────────────────────────────────────────────── */}
          <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
            <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <Scale className="h-6 w-6 text-violet-400" />
              Overloading
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <input
                  type="text"
                  name="overloadingWeight"
                  value={formData.overloadingWeight}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Overloading Weight (kg)
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="overloadingRate"
                  value={formData.overloadingRate}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Rate (₹/MT)
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={
                    formData.overloadingAmount
                      ? `₹ ${Number(formData.overloadingAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"
                  }
                  readOnly
                  className="w-full px-4 py-3.5 bg-gray-900/50 border-b-2 border-gray-700 rounded-md outline-none text-base font-bold text-violet-300 cursor-not-allowed"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400">
                  Overloading Amount
                </label>
              </div>
            </div>
          </section>

          {/* ── Images ─────────────────────────────────────────────────────── */}
          <section className="bg-gray-900/70 border border-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-7 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-5 flex items-center gap-3">
              <Package className="w-6 h-6 text-indigo-400" />
              Vehicle / Coal Images (Max 3)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-700">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`uploaded-${idx}`}
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}

              {formData.images.length < 3 && (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-indigo-500/60 transition bg-gray-950/30">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-300">Add Image</p>
                  <p className="text-xs text-gray-500">JPG / PNG</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-3">
              You can upload up to 3 images (vehicle, coal, loading condition)
            </p>
          </section>

          {/* ── Documents + Notes ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <FileText className="h-6 w-6 text-violet-400" />
                Documents
              </h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-violet-500/60 transition-colors cursor-pointer bg-gray-950/30"
              >
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-4" />
                <p className="text-base font-medium text-gray-300">Upload Documents</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG • Max 10MB per file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {formData.documents.length > 0 && (
                <div className="mt-6 space-y-3">
                  {formData.documents.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-800/60 px-4 py-3 rounded-lg border border-gray-700/50"
                    >
                      <div className="flex items-center gap-3 max-w-[70%]">
                        <FileText className="w-5 h-5 text-violet-400 flex-shrink-0" />
                        <span className="text-sm text-gray-300 truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <FileText className="h-6 w-6 text-violet-400" />
                Notes / Remarks
              </h2>

              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={6}
                placeholder="Quality issues, special instructions, overloading remarks, observations..."
                className="w-full px-4 py-3.5 border border-gray-700 rounded-xl focus:outline-none focus:border-violet-500/50 transition text-sm text-gray-200 placeholder-gray-500 resize-none"
              />
            </section>
          </div>

          {/* ── Submit Buttons ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="order-2 sm:order-1 px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition font-medium flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || storeLoading}
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving || storeLoading ? "Saving..." : "Save Local Inward Entry"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}