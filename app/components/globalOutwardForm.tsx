"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import BillingMethodSection from "./ASGbillingMethod";
import {
  Save,
  X,
  Truck,
  Scale,
  Package,
  FileText,
  Upload,
  Trash2,
  MapPin,
  Building2,
} from "lucide-react";
export default function GlobalOutwardForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    munshiyanaSize: "small",
    munshiyanaPrice: "350",
    labourId: "",
    vehicleNumber: "",
    partyName: "",
    destination: "",
    transporter: "",
    driverName: "",
    driverContact: "",
    coalGradeType: "E",
    grade: "E",
    material: "ROM",
    size: "0-10",
    area: "",
    grossWeight: "",
    tareWeight: "",
    netWeight: "",
    billingRate: "",
    actualRate: "",
    munshiyanaRemarks: "",
    labourRemarks: "",
    billingType: "Cash",
    invoiceNumber: "",
    billingRemarks: "",
    specialInstructions: "",
    documents: [] as File[],
    images: [] as File[],
    // Nested objects needed for BillingMethodSection
    billingMethods: [] as string[],
    half: {
      totalCoal: "",
      coalRate: "",
      gstRate: "",
      calculatedAmount: "",
      accountPayment: "",
      cashPayment: "",
    },
    weight: {
      line1Loading: "",
      line1Price: "",
      line1Calc: "",
      line2Loading: "",
      line2Price: "",
      line2Calc: "",
      total: "",
    },
    different: {
      line1Material: "ROM",
      line1Qty: "",
      line1Rate: "",
      line1Calc: "",
      line2Material: "ROM",
      line2Qty: "",
      line2Rate: "",
      line2Calc: "",
      total: "",
    },
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
    firstInputRef.current?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev };

      if (name.includes(".")) {
        // Handle nested fields like half.totalCoal, weight.line1Loading
        const [parent, child] = name.split(".") as [string, string];

        newData[parent] = {
          ...(newData[parent] || {}),
          [child]: value,
        };
      } else {
        // Normal flat fields
        (newData as any)[name] = value;
      }

      // Auto-calculate net weight
      if (name === "grossWeight" || name === "tareWeight") {
        const gross = Number(newData.grossWeight) || 0;
        const tare = Number(newData.tareWeight) || 0;
        newData.netWeight = gross > tare ? (gross - tare).toFixed(2) : "";
      }

      // Auto-calculate billing amount (flat)
      if (name === "billingRate" || name === "netWeight") {
        const rate = Number(newData.billingRate) || 0;
        const net = Number(newData.netWeight) || 0;
        newData.billingAmount = (rate * net).toFixed(2);
      }

      // Real-time calculation for Half Billing
      if (newData.billingMethods?.includes("half")) {
        const totalCoal = Number(newData.half?.totalCoal) || 0;
        const coalRate = Number(newData.half?.coalRate) || 0;
        const gstRate = Number(newData.half?.gstRate || 18) || 18;

        const base = totalCoal * coalRate;
        const gst = base * (gstRate / 100);
        const totalWithGst = base + gst;

        newData.half = {
          ...newData.half,
          calculatedAmount: totalWithGst.toFixed(2),
          accountPayment: (totalWithGst / 2).toFixed(2),
          cashPayment: (totalWithGst / 2).toFixed(2),
        };
      }

      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
    if (!formData.partyName.trim()) newErrors.partyName = "Required";
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
    alert("Global Outward entry saved successfully!");
    router.push("/dashboard/outward");
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Vehicle & Party Info + Coal Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Vehicle & Party */}
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-7 pb-4 border-b border-gray-700/50">
                <Truck className="h-6 w-6 text-violet-400" />
                Vehicle & Party Information
              </h2>
              <div className="space-y-7">
                {[
                  {
                    name: "vehicleNumber",
                    label: "Vehicle Number *",
                    ref: firstInputRef,
                  },
                  { name: "partyName", label: "Party Name *" },
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <input
                      ref={field.ref}
                      type="text"
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      placeholder=" "
                      className={`peer w-full px-4 py-3.5 border-b-2 ${
                        errors[field.name]
                          ? "border-red-500"
                          : "border-gray-700 focus:border-violet-500"
                      } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                    />
                    <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                      {field.label}
                    </label>
                    {errors[field.name] && (
                      <p className="text-red-400 text-xs mt-1.5">
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Coal Details */}
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-7 pb-4 border-b border-gray-700/50">
                <Package className="h-6 w-6 text-violet-400" />
                Coal Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <select
                    name="coalGradeType"
                    value={formData.coalGradeType}
                    onChange={(e) => {
                      const value = e.target.value;
                      let grade = "E";
                      let material = "ROM";
                      if (value === "F") {
                        grade = "F";
                        material = "Steam";
                      } else if (value === "B") {
                        grade = "B";
                        material = "Boulders";
                      }
                      setFormData((prev) => ({
                        ...prev,
                        coalGradeType: value,
                        grade,
                        material,
                      }));
                    }}
                    className="w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 focus:border-indigo-500 rounded-md outline-none text-base text-white appearance-none"
                  >
                    <option value="E">E - ROM</option>
                    <option value="F">F - Steam</option>
                    <option value="B">B - Boulders</option>
                  </select>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Grade & Type *
                  </label>
                </div>

                <div className="relative">
                  <select
                    name="size"
                    value={formData.size}
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
                    Size (mm)
                  </label>
                </div>

                <div className="relative sm:col-span-2">
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-900/60 border-b-2 border-gray-700 focus:border-indigo-500 rounded-md outline-none text-base text-white appearance-none"
                  >
                    <option value="">Select Area</option>
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

          {/* Transporter Information */}
          <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-7 pb-4 border-b border-gray-700/50">
              <Truck className="h-6 w-6 text-violet-400" />
              Transporter Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Driver Name */}
              <div className="relative">
                <input
                  ref={firstInputRef}
                  type="text"
                  name="driverName"
                  value={formData.driverName || ""}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.driverName
                      ? "border-red-500"
                      : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Driver Name *
                </label>
                {errors.driverName && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.driverName}
                  </p>
                )}
              </div>

              {/* Driver Contact */}
              <div className="relative">
                <input
                  type="tel"
                  name="driverContact"
                  value={formData.driverContact || ""}
                  onChange={handleChange}
                  placeholder=""
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.driverContact
                      ? "border-red-500"
                      : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Driver Contact Number *
                </label>
                {errors.driverContact && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.driverContact}
                  </p>
                )}
              </div>

              {/* Destination - Full width */}
              <div className="relative">
                <input
                  type="text"
                  name="destination"
                  value={formData.destination || ""}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.destination
                      ? "border-red-500"
                      : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Destination *
                </label>
                {errors.destination && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.destination}
                  </p>
                )}
              </div>

              {/* Transportation Fee */}
              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-base text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="transportationFee"
                    value={formData.transportationFee || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`peer flex-1 px-4 py-3.5 border-b-2 ${
                      errors.transportationFee
                        ? "border-red-500"
                        : "border-gray-700 focus:border-violet-500"
                    } rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Transportation Fee (₹) *
                </label>
                {errors.transportationFee && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.transportationFee}
                  </p>
                )}
              </div>

              {/* Advance Fee */}
              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-base text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="advanceFee"
                    value={formData.advanceFee || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`peer flex-1 px-4 py-3.5 border-b-2 ${
                      errors.advanceFee
                        ? "border-red-500"
                        : "border-gray-700 focus:border-violet-500"
                    } rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Advance Fee (₹)
                </label>
                {errors.advanceFee && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.advanceFee}
                  </p>
                )}
              </div>
            </div>
          </section>

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
                    errors.grossWeight
                      ? "border-red-500"
                      : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-lg font-medium text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Gross Weight (G) *
                </label>
                {errors.grossWeight && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.grossWeight}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="tareWeight"
                  value={formData.tareWeight}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.tareWeight
                      ? "border-red-500"
                      : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-lg font-medium text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Tare Weight (T) *
                </label>
                {errors.tareWeight && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.tareWeight}
                  </p>
                )}
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

          {/* Billing Method */}
          <BillingMethodSection
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
          />
          {/* Munshiyana + Labour */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* ──────────────────────────────── Munshiyana ──────────────────────────────── */}
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
              {/* Title + Size Toggle side by side */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-700/50 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Scale className="h-6 w-6 text-violet-400" />
                  Munshiyana
                </h2>

                {/* Segmented Control – placed beside title on larger screens */}
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
                {/* Amount Input */}
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

                {/* Remarks */}
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

            {/* ──────────────────────────────── Labour Loading ──────────────────────────────── */}
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <Scale className="h-6 w-6 text-violet-400" />
                Labour Loading
              </h2>

              <div className="space-y-6">
                {/* Labour ID input */}
                <div className="relative">
                  <input
                    type="text"
                    name="labourId"
                    value={formData.labourId || ""}
                    onChange={handleChange}
                    placeholder="Enter Labour ID"
                    className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 bg-gray-900/40"
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Labour ID *
                  </label>
                  {errors.labourId && (
                    <p className="text-red-400 text-xs mt-1.5">
                      {errors.labourId}
                    </p>
                  )}
                </div>

                {/* Remarks */}
                <div className="relative">
                  <textarea
                    name="labourRemarks"
                    value={formData.labourRemarks || ""}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Remarks for Labour Loading (optional)"
                    className="w-full px-4 py-3.5 border border-gray-700 rounded-xl focus:outline-none focus:border-violet-500 transition text-sm text-gray-200 placeholder-gray-500 resize-none"
                  />
                </div>
              </div>
            </section>
          </div>

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

          {/* Documents + Special Instructions */}
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
                Special Instructions / Remarks
              </h2>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                rows={6}
                placeholder="Quality notes, route instructions, special requirements..."
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
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Global Outward Entry"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
