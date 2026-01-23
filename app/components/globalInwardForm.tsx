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

export default function LocalInwardForm() {
  const router = useRouter();
  const vehicleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    munshiyanaSize: "small",
    munshiyanaPrice: "350",
    rstnumber: "",
    vehicleNumber: "",
    collieryParty: "",
    material: "ROM",
    dateTime: new Date().toISOString().slice(0, 16),
    grossWeight: "",
    tareWeight: "",
    netWeight: "",
    munshiyanaRemarks: "",
    overloadingWeight: "",
    overloadingRate: "",
    overloadingAmount: "",
    notes: "",
    documents: [] as File[],
    images: [] as File[],
    isColliery: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function SizeToggle({
    value,
    onChange,
  }: {
    value: "small" | "large";
    onChange: (newValue: "small" | "large") => void;
  }) {
    return (
      <div className="flex items-center gap-3 bg-gray-800/50 p-1.5 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => onChange("small")}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === "small"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Small
        </button>
        <button
          type="button"
          onClick={() => onChange("large")}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === "large"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Large
        </button>
      </div>
    );
  }

  // Auto-focus first field
  useEffect(() => {
    vehicleInputRef.current?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "grossWeight" || name === "tareWeight") {
        const gross = Number(newData.grossWeight) || 0;
        const tare = Number(newData.tareWeight) || 0;
        newData.netWeight = gross > tare ? (gross - tare).toFixed(2) : "";
      }

      if (name === "overloadingWeight" || name === "overloadingRate") {
        const weight = Number(newData.overloadingWeight) || 0;
        const rate = Number(newData.overloadingRate) || 0;
        newData.overloadingAmount = (weight * rate).toFixed(2);
      }

      return newData;
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newFiles],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedImages = Array.from(e.target.files);
    const remainingSlots = 3 - formData.images.length;

    if (remainingSlots <= 0) return;

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...selectedImages.slice(0, remainingSlots)],
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
    if (!formData.collieryParty.trim()) newErrors.collieryParty = "Required";
    if (!formData.rstnumber.trim()) newErrors.rstnumber = "Required";
    if (!formData.grossWeight || Number(formData.grossWeight) <= 0)
      newErrors.grossWeight = "Enter valid gross weight";
    if (!formData.tareWeight || Number(formData.tareWeight) < 0)
      newErrors.tareWeight = "Enter valid tare weight";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    alert("Local Inward entry saved successfully!");
    router.push("/dashboard/inward");
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vehicle & Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7 pb-4 border-b border-gray-700/50">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Truck className="h-6 w-6 text-violet-400" />
                  Vehicle & Basic Information
                </h2>

                <div className="inline-flex rounded-full bg-gray-800/70 p-1.5 border border-gray-700/60 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, isColliery: true }))}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      formData.isColliery
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                        : "text-gray-300 hover:bg-gray-700/60"
                    }`}
                  >
                    Colliery
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, isColliery: false }))}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      !formData.isColliery
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
                    name="collieryParty"
                    value={formData.collieryParty}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200"
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    {formData.isColliery ? "Colliery Name *" : "Party Name *"}
                  </label>
                  {errors.collieryParty && <p className="text-red-400 text-xs mt-1.5">{errors.collieryParty}</p>}
                </div>

                <div className="relative">
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white"
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Date & Time
                  </label>
                </div>

                <div className="relative">
                  <input
                    ref={firstInputRef}
                    type="text"
                    name="rstnumber"
                    value={formData.rstnumber}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer w-full px-4 py-3.5 border-b-2 ${
                      errors.rstnumber ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                    } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    RST Number *
                  </label>
                  {errors.rstnumber && <p className="text-red-400 text-xs mt-1.5">{errors.rstnumber}</p>}
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
                    name="coalGradeType"
                    value={formData.coalGradeType || "E"}
                    onChange={(e) => {
                      const value = e.target.value;
                      let grade = "E";
                      let type = "ROM";
                      if (value === "F") { grade = "F"; type = "Steam"; }
                      if (value === "B") { grade = "B"; type = "Boulders"; }
                      setFormData((prev) => ({
                        ...prev,
                        coalGradeType: value,
                        material: type,
                      }));
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
                    name="size"
                    value={formData.size || ""}
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
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Size (mm)
                  </label>
                </div>

                <div className="relative">
                  <select
                    name="area"
                    value={formData.area || ""}
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
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Area
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* Weightbridge */}
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

          {/* Munshiyana */}
          <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-700/50 mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Scale className="h-6 w-6 text-violet-400" />
                Munshiyana
              </h2>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full bg-gray-800/80 p-1 shadow-inner border border-gray-700/40">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        munshiyanaSize: "small",
                        munshiyanaPrice: "350",
                      }))
                    }
                    className={`
                      relative px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300
                      ${
                        formData.munshiyanaSize === "small"
                          ? "bg-violet-600 text-white shadow-md scale-105"
                          : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                      }
                    `}
                  >
                    Small
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        munshiyanaSize: "large",
                        munshiyanaPrice: "1000",
                      }))
                    }
                    className={`
                      relative px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300
                      ${
                        formData.munshiyanaSize === "large"
                          ? "bg-violet-600 text-white shadow-md scale-105"
                          : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                      }
                    `}
                  >
                    Large
                  </button>
                </div>
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
                    name="munshiyanaPrice"
                    value={formData.munshiyanaPrice || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+(\.\d{0,2})?$/.test(val)) {
                        setFormData((prev) => ({
                          ...prev,
                          munshiyanaPrice: val,
                        }));
                      }
                    }}
                    placeholder=" "
                    className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <label className="absolute left-[4.5rem] -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200 pointer-events-none">
                  Amount (₹)
                </label>
              </div>

              <div className="relative">
                <textarea
                  name="munshiyanaRemarks"
                  value={formData.munshiyanaRemarks || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Remarks for Munshiyana (optional)"
                  className="peer w-full px-4 py-3.5 border border-gray-700 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition text-sm text-gray-200 placeholder-gray-500 resize-none bg-gray-950/30"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200 pointer-events-none">
                  Remarks
                </label>
              </div>
            </div>
          </section>

          {/* Overloading */}
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
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
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
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Rate (₹/MT)
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={
                    formData.overloadingAmount
                      ? `₹ ${Number(formData.overloadingAmount).toLocaleString("en-IN")}`
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

          {/* Images */}
          <section className="bg-gray-900/70 border border-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-7 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-5 flex items-center gap-3">
              <Package className="w-6 h-6 text-indigo-400" />
              Vehicle / Coal Images (Max 3)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-gray-700"
                >
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
                <p className="text-base font-medium text-gray-300">
                  Upload Documents
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG • Max 10MB per file
                </p>
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
                        <span className="text-sm text-gray-300 truncate">
                          {file.name}
                        </span>
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
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={6}
                placeholder="Quality issues, special instructions, overloading remarks, observations..."
                className="w-full px-4 py-3.5 border border-gray-700 rounded-xl focus:outline-none focus:border-violet-500/50 transition text-sm text-gray-200 placeholder-gray-500 resize-none"
              />
            </section>
          </div>

          {/* Submit Buttons */}
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
              disabled={saving}
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-700 hover:brightness-110 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Local Inward Entry"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}