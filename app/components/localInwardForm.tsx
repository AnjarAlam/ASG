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

export default function LocalInwardForm() {
  const router = useRouter();
  const { createLocalInward, loading } = useInwardLocalStore();

  const vehicleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    tokenNumber: "",
    // vehicleSize: VehicleSize.SMALL as VehicleSize,

    supplierName: "",
    supplier: "COLLIARY" as "COLLIARY" | "PARTY",

    inwardDateTime: new Date().toISOString().slice(0, 16),

    coalGrade: "E",
    coalType: "ROM",
    coalSize: "",
    area: "",

    grossWeight: "",
    tareWeight: "",
    netWeight: "",

    images: [] as File[],
    documents: [] as File[],

    inwardType: "LOCAL" as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-focus first input
  useEffect(() => {
    vehicleInputRef.current?.focus();
  }, []);

  // Generate token on mount
  useEffect(() => {
    const token = generateToken(formData.inwardDateTime);
    setFormData((prev) => ({ ...prev, tokenNumber: token }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generateToken(dateISO: string) {
    const d = new Date(dateISO);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");

    const dateKey = `${yyyy}-${mm}-${dd}`;
    const storageKey = `local-inward-counter-${dateKey}`;

    let count = Number(localStorage.getItem(storageKey) || "0");
    count += 1;
    localStorage.setItem(storageKey, String(count));

    return `${dateKey} ${hh}:${min} ${String(count).padStart(2, "0")}`;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "grossWeight" || name === "tareWeight") {
        const g = Number(next.grossWeight) || 0;
        const t = Number(next.tareWeight) || 0;
        next.netWeight = g > t ? (g - t).toFixed(2) : "";
      }

      return next;
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFormData((p) => ({
      ...p,
      documents: [...p.documents, ...Array.from(e.target.files || [])],
    }));
  };

  const removeFile = (index: number) => {
    setFormData((p) => ({
      ...p,
      documents: p.documents.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const remaining = 3 - formData.images.length;
    if (remaining <= 0) return;

    setFormData((p) => ({
      ...p,
      images: [...p.images, ...files.slice(0, remaining)],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const e: Record<string, string> = {};

    if (!formData.vehicleNumber.trim()) e.vehicleNumber = "Required";
    if (!formData.supplierName.trim()) e.supplierName = "Required";
    if (!formData.coalSize.trim()) e.coalSize = "Required";
    if (!formData.area.trim()) e.area = "Required";

    if (!formData.grossWeight || Number(formData.grossWeight) <= 0)
      e.grossWeight = "Invalid";
    if (!formData.tareWeight || Number(formData.tareWeight) < 0)
      e.tareWeight = "Invalid";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let finalToken = formData.tokenNumber?.trim();
  if (!finalToken) {
    finalToken = generateToken(formData.inwardDateTime || new Date().toISOString());
    // Optional: update UI too
    setFormData((prev) => ({ ...prev, tokenNumber: finalToken }));
  }

    const payload = {
      vehicleNumber: formData.vehicleNumber,
      tokenNumber: finalToken,
      // vehicleSize: formData.vehicleSize,

      supplierName: formData.supplierName,
      supplier: formData.supplier,

      inwardDateTime: new Date(formData.inwardDateTime).toISOString(),

      coalGrade: formData.coalGrade,
      coalType: formData.coalType,
      coalSize: formData.coalSize,
      area: formData.area,

      grossWeight: Number(formData.grossWeight),
      tareWeight: Number(formData.tareWeight),
      netWeight: Number(formData.netWeight),

      inwardType: formData.inwardType,

      images: formData.images.map((f) => f.name),
      documents: formData.documents.map((f) => f.name),
    };
    console.log("Submitting local inward:", payload);

    try {
      await createLocalInward(payload);
      router.push("/dashboard/inward");
    } catch (err) {
      console.error("Local inward creation failed:", err);
      alert("Failed to save local inward. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Token Number Banner */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-violet-500/30 rounded-xl px-6 py-4 shadow mb-6">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Token Number
            </p>
            <p className="text-lg font-bold text-violet-300">
              {formData.tokenNumber || "Generating..."}
            </p>
          </div>

          {/* Vehicle + Coal Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Vehicle & Basic Information */}
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7 pb-4 border-b border-gray-700/50">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Truck className="h-6 w-6 text-violet-400" />
                  Vehicle & Basic Information
                </h2>

                <div className="inline-flex rounded-full bg-gray-800/70 p-1.5 border border-gray-700/60 backdrop-blur-sm">
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
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
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
                    className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200"
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    {formData.supplier === "COLLIARY" ? "Colliery Name *" : "Party Name *"}
                  </label>
                  {errors.supplierName && <p className="text-red-400 text-xs mt-1.5">{errors.supplierName}</p>}
                </div>

                <div className="relative">
                  <input
                    type="datetime-local"
                    name="inwardDateTime"
                    value={formData.inwardDateTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white"
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Date & Time
                  </label>
                </div>
              </div>
            </section>

            {/* Coal Details */}
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <Package className="h-6 w-6 text-violet-400" />
                Coal Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 lg:gap-8">
                <div className="relative">
                  <select
                    name="coalGrade"
                    value={formData.coalGrade}
                    onChange={(e) => {
                      const val = e.target.value;
                      let grade = "E";
                      let type = "ROM";
                      if (val === "F") { grade = "F"; type = "Steam"; }
                      if (val === "B") { grade = "B"; type = "Boulders"; }
                      setFormData((p) => ({ ...p, coalGrade: val, coalType: type }));
                    }}
                    className="w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 focus:border-indigo-500 rounded-md outline-none text-base text-white appearance-none"
                  >
                    <option value="E">E - ROM</option>
                    <option value="F">F - Steam</option>
                    <option value="B">B - Boulders</option>
                  </select>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
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
                    <option value="0-10">0-10 mm</option>
                    <option value="10-20">10-20 mm</option>
                    <option value="20-50">20-50 mm</option>
                    <option value="50-80">50-80 mm</option>
                    <option value="80-175">80-175 mm</option>
                  </select>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
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
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                  </select>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Area *
                  </label>
                  {errors.area && <p className="text-red-400 text-xs mt-1.5">{errors.area}</p>}
                </div>

                {/* <div className="relative col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-3 bg-gray-800/50 p-1.5 rounded-lg w-fit">
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, vehicleSize: VehicleSize.SMALL }))}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        formData.vehicleSize === VehicleSize.SMALL
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      Small
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, vehicleSize: VehicleSize.LARGE }))}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        formData.vehicleSize === VehicleSize.LARGE
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      Large
                    </button>
                  </div>
                  <label className="block mt-2 text-xs text-gray-400">Vehicle Size</label>
                </div> */}
              </div>
            </section>
          </div>

          {/* Weightbridge Details */}
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
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
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
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
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

          {/* Images */}
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
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-3">
              You can upload up to 3 images (vehicle, coal, loading condition)
            </p>
          </section>

          {/* Documents & Notes */}
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
                value={formData.note || ""}
                onChange={handleChange}
                rows={6}
                placeholder="Quality issues, special instructions, observations..."
                className="w-full px-4 py-3.5 border border-gray-700 rounded-xl focus:outline-none focus:border-violet-500/50 transition text-sm text-gray-200 placeholder-gray-500 resize-none bg-gray-950/30"
              />
            </section>
          </div>

          {/* Action Buttons */}
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
              disabled={loading}
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-700 hover:brightness-110 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving..." : "Save Local Inward Entry"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}