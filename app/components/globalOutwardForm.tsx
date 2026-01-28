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
} from "lucide-react";
import { useOutwardStore } from "../../store/outward-store";

interface GlobalOutwardFormProps {
  outwardToken: string;
}

export default function GlobalOutwardForm({ outwardToken }: GlobalOutwardFormProps) {
  const router = useRouter();
  const { createOutward, loading: storeLoading } = useOutwardStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    tokenNumber: outwardToken || "",
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
    transportationFee: "",
    advanceFee: "",
    documents: [] as File[],
    images: [] as File[],
    billingMethods: [] as string[],

    // Billing sub-documents
    halfBilling: null as null | { cashAmount: string; billingTotalAmount: string; tax: string },
    halfWeightBilling: null as null | { cashAmount: string; billingTotalAmount: string; tax: string },
    differentMaterial: [] as Array<{
      name: string;
      quantity: string;
      billingRate: string;
      actualRate: string;
    }>,

    gst: "18",
    tcsRate: "1",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev };

      if (name.includes(".")) {
        const [parent, child] = name.split(".") as [string, string];
        (newData as any)[parent] = {
          ...(newData[parent as keyof typeof newData] || {}),
          [child]: value,
        };
      } else {
        (newData as any)[name] = value;
      }

      // Auto-calculate net weight
      if (name === "grossWeight" || name === "tareWeight") {
        const gross = Number(newData.grossWeight) || 0;
        const tare = Number(newData.tareWeight) || 0;
        newData.netWeight = gross > tare ? (gross - tare).toFixed(2) : "";
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
    if (!formData.destination.trim()) newErrors.destination = "Required";
    if (!formData.driverName.trim()) newErrors.driverName = "Required";
    if (!formData.driverContact.trim()) newErrors.driverContact = "Required";
    if (!formData.grossWeight || Number(formData.grossWeight) <= 0)
      newErrors.grossWeight = "Enter valid gross weight";
    if (Number(formData.tareWeight) < 0) newErrors.tareWeight = "Tare cannot be negative";
    if (Number(formData.grossWeight) <= Number(formData.tareWeight))
      newErrors.grossWeight = "Gross must be > Tare";
    if (!formData.area.trim()) newErrors.area = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = {
        tokenNumber: formData.tokenNumber || outwardToken || "AUTO",
        vehicleNumber: formData.vehicleNumber.trim() || "UNKNOWN",
        customerName: formData.partyName.trim() || "Unknown Party",
        destination: formData.destination.trim() || "",
        transportingFee: Number(formData.transportationFee) || 0,
        advanceFee: Number(formData.advanceFee) || 0,
        driverName: formData.driverName.trim() || "",
        driverContact: formData.driverContact.trim() || "",
        coalGrade: formData.grade || "E",
        coalType: formData.material || "ROM",
        coalSize: formData.size || "0-10",
        area: formData.area || "",
        grossWeight: Number(formData.grossWeight) || 0,
        tareWeight: Number(formData.tareWeight) || 0,
        netWeight: Number(formData.netWeight) || 0,
        billingRate: Number(formData.billingRate) || 0,
        actualRate: Number(formData.actualRate) || 0,
        munshiana: Number(formData.munshiyanaPrice) || 0,
        note: (formData.munshiyanaRemarks || formData.labourRemarks || "No remarks").trim(),
        dispatchDateTime: new Date().toISOString(),
        labourIds: formData.labourId.trim() ? [formData.labourId.trim()] : [],
        instructions: formData.specialInstructions?.trim() || "nil",

        images: formData.images.length > 0 ? formData.images.map((f) => f.name) : [],
        documents: formData.documents.length > 0 ? formData.documents.map((f) => f.name) : [],

        outwardType: "GLOBAL",
        vehicleSize: formData.munshiyanaSize === "large" ? "LARGE" : "SMALL",

        gst: 18,
        tcsRate: 1,

        // ── Real conditional sub-documents ───────────────────────────────────────
        halfBilling:
          formData.billingMethods.includes("half") && formData.halfBilling
            ? {
                cashAmount: Number(formData.halfBilling.cashAmount) || 0,
                billingTotalAmount: Number(formData.halfBilling.billingTotalAmount) || 0,
                tax: Number(formData.halfBilling.tax) || 0,
              }
            : undefined,

        halfWeightBilling:
          formData.billingMethods.includes("weight") && formData.halfWeightBilling
            ? {
                cashAmount: Number(formData.halfWeightBilling.cashAmount) || 0,
                billingTotalAmount: Number(formData.halfWeightBilling.billingTotalAmount) || 0,
                tax: Number(formData.halfWeightBilling.tax) || 0,
              }
            : undefined,

        differentMaterial: formData.billingMethods.includes("different")
          ? formData.differentMaterial.map((m) => ({
              name: m.name || "",
              quantity: Number(m.quantity) || 0,
              billingRate: Number(m.billingRate) || 0,
              actualRate: Number(m.actualRate) || 0,
            }))
          : [],
      };

      console.log("PAYLOAD →", JSON.stringify(payload, null, 2));

      await createOutward(payload);

      alert("Global Outward entry saved successfully!");
      router.push("/dashboard/outward");
    } catch (err: any) {
      console.error("Full error:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unknown error";
      alert(`Failed to save: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // JSX ─────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-transparent text-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vehicle & Party + Coal Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-7 pb-4 border-b border-gray-700/50">
                <Truck className="h-6 w-6 text-violet-400" />
                Vehicle & Party Information
              </h2>
              <div className="space-y-7">
                {[
                  { name: "vehicleNumber", label: "Vehicle Number *", ref: firstInputRef },
                  { name: "partyName", label: "Party Name *" },
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <input
                      ref={field.ref}
                      type="text"
                      name={field.name}
                      value={(formData as any)[field.name] || ""}
                      onChange={handleChange}
                      placeholder=" "
                      className={`peer w-full px-4 py-3.5 border-b-2 ${
                        errors[field.name]
                          ? "border-red-500"
                          : "border-gray-700 focus:border-violet-500"
                      } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                    />
                    <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                      {field.label}
                    </label>
                    {errors[field.name] && (
                      <p className="text-red-400 text-xs mt-1.5">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

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
                    Area *
                  </label>
                  {errors.area && <p className="text-red-400 text-xs mt-1.5">{errors.area}</p>}
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
              <div className="relative">
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName || ""}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.driverName ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Driver Name *
                </label>
                {errors.driverName && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.driverName}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type="tel"
                  name="driverContact"
                  value={formData.driverContact || ""}
                  onChange={handleChange}
                  placeholder=""
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.driverContact ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Driver Contact Number *
                </label>
                {errors.driverContact && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.driverContact}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="destination"
                  value={formData.destination || ""}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.destination ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Destination *
                </label>
                {errors.destination && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.destination}</p>
                )}
              </div>

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
                      errors.transportationFee ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                    } rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Transportation Fee (₹)
                </label>
              </div>

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
                      errors.advanceFee ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                    } rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Advance Fee (₹)
                </label>
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
                    errors.grossWeight ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-lg font-medium text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Gross Weight (G) *
                </label>
                {errors.grossWeight && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.grossWeight}</p>
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
                    errors.tareWeight ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-lg font-medium text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all">
                  Tare Weight (T) *
                </label>
                {errors.tareWeight && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.tareWeight}</p>
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

          <BillingMethodSection
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
          />

          {/* Munshiyana + Labour */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-700/50 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Scale className="h-6 w-6 text-violet-400" />
                  Munshiyana
                </h2>

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
                    className={`relative px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
                      formData.munshiyanaSize === "small"
                        ? "bg-violet-600 text-white shadow-md scale-105"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
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
                    className={`relative px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${
                      formData.munshiyanaSize === "large"
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

            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <Scale className="h-6 w-6 text-violet-400" />
                Labour Loading
              </h2>

              <div className="space-y-6">
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
                    Labour ID
                  </label>
                </div>

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
                value={formData.specialInstructions || ""}
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
              disabled={saving || storeLoading}
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving || storeLoading ? "Saving..." : "Save Global Outward Entry"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}