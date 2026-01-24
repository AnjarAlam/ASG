"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  HardHat,
  Home,
  Phone,
  IndianRupee,
  Truck,
  User,
  Upload,
  Save,
  X,
  RefreshCw,
  CheckCircle2,
  Calculator,
} from "lucide-react";

import { useLabourStore } from "@/store/labour-store";

export default function LabourForm() {
  const router = useRouter();
  const { createRecord, loading, error } = useLabourStore();

  const [formData, setFormData] = useState({
    numberOfWorkers: "",
    village: "",
    mukhiyaName: "",
    mukhiyaContact: "",
    ratePerWorker: "",
    transportRate: "",
    agentName: "",
    agentContact: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Format Indian phone number (5-5)
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes("Contact")) {
      setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Maximum file size is 5MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleImageChange(file);
  };

  const calculateTotal = () => {
    const workers = Number(formData.numberOfWorkers) || 0;
    const rate = Number(formData.ratePerWorker) || 0;
    const transport = Number(formData.transportRate) || 0;
    return (workers * rate + transport).toLocaleString("en-IN");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      "numberOfWorkers",
      "village",
      "mukhiyaName",
      "mukhiyaContact",
      "ratePerWorker",
      "transportRate",
      "agentName",
      "agentContact",
    ];

    const missing = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]?.trim()
    );

    if (missing.length > 0) {
      alert("Please fill all required fields");
      return;
    }

    if (formData.mukhiyaContact.replace(/\D/g, "").length !== 10) {
      alert("Mukhiya contact must be a valid 10-digit number");
      return;
    }

    if (formData.agentContact.replace(/\D/g, "").length !== 10) {
      alert("Agent contact must be a valid 10-digit number");
      return;
    }

    if (!imageFile) {
      alert("Please upload at least one document/photo");
      return;
    }

    // Automatically use TODAY's date/time for checkIn
    const todayISO = new Date().toISOString();

    const payload = {
      labourAgentName: formData.agentName.trim(),
      agentPhone: formData.agentContact.replace(/\D/g, ""),
      mukhiyaName: formData.mukhiyaName.trim(),
      mukhiyaPhone: formData.mukhiyaContact.replace(/\D/g, ""),
      village: formData.village.trim(),

      totalLabour: Number(formData.numberOfWorkers),
      checkIn: todayISO,           // ← Automatically today's date & time
      checkOut: "",                // Can be updated later

      ratePerLabour: Number(formData.ratePerWorker),
      totalWages: Number(formData.numberOfWorkers) * Number(formData.ratePerWorker),
      transportFee: Number(formData.transportRate),

      documents: [], // Add file upload logic later if backend supports
    };

    const success = await createRecord(payload);

    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/labour");
      }, 1800);
    } else {
      alert("Failed to save. Please check your connection or try again.");
    }
  };

  const isFieldInvalid = (field: string) =>
    touched[field] && !formData[field as keyof typeof formData]?.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      {/* Dashboard-style Header */}
      <header className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Add Labour Entry</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Register today's labour group • {new Date().toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-10">
            {/* Cost Preview Card */}
            {(formData.numberOfWorkers || formData.ratePerWorker) && (
              <div className="bg-gradient-to-r from-indigo-950/70 to-violet-950/50 p-7 rounded-xl border border-indigo-900/40 shadow-inner">
                <div className="flex items-center gap-3 text-indigo-300 mb-4">
                  <Calculator size={20} />
                  <span className="font-semibold text-lg">Today's Estimated Cost</span>
                </div>
                <div className="text-5xl font-bold text-white tracking-tight">
                  ₹{calculateTotal()}
                </div>
                <div className="mt-3 text-gray-300">
                  {formData.numberOfWorkers || "—"} workers × ₹{formData.ratePerWorker || "—"}
                  {formData.transportRate && ` + ₹${formData.transportRate} transport`}
                </div>
              </div>
            )}

            {/* Grid - Workers & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {/* Number of Workers */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Number of Workers <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="number"
                    name="numberOfWorkers"
                    value={formData.numberOfWorkers}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    min="1"
                    required
                    className={`w-full bg-gray-800/60 border ${
                      isFieldInvalid("numberOfWorkers") ? "border-red-600" : "border-gray-700"
                    } rounded-xl pl-12 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500`}
                    placeholder="Total workers today"
                  />
                </div>
              </div>

              {/* Village */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Village / Location <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full bg-gray-800/60 border ${
                      isFieldInvalid("village") ? "border-red-600" : "border-gray-700"
                    } rounded-xl pl-12 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500`}
                    placeholder="Village name"
                  />
                </div>
              </div>

              {/* Rate per Worker */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Rate per Worker (₹/day) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="number"
                    name="ratePerWorker"
                    value={formData.ratePerWorker}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    min="0"
                    step="1"
                    required
                    className={`w-full bg-gray-800/60 border ${
                      isFieldInvalid("ratePerWorker") ? "border-red-600" : "border-gray-700"
                    } rounded-xl pl-12 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500`}
                    placeholder="Daily wage per person"
                  />
                </div>
              </div>

              {/* Transport Rate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Transport Rate (₹/group) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="number"
                    name="transportRate"
                    value={formData.transportRate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    min="0"
                    step="1"
                    required
                    className={`w-full bg-gray-800/60 border ${
                      isFieldInvalid("transportRate") ? "border-red-600" : "border-gray-700"
                    } rounded-xl pl-12 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500`}
                    placeholder="Total transport cost"
                  />
                </div>
              </div>
            </div>

            {/* Mukhiya & Agent Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 pt-8 border-t border-gray-800/50">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Mukhiya / Contractor Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="mukhiyaName"
                  value={formData.mukhiyaName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full bg-gray-800/60 border ${
                    isFieldInvalid("mukhiyaName") ? "border-red-600" : "border-gray-700"
                  } rounded-xl px-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500`}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Mukhiya Contact <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="tel"
                    name="mukhiyaContact"
                    value={formData.mukhiyaContact}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    pattern="[0-9]{5} [0-9]{5}"
                    className={`w-full bg-gray-800/60 border ${
                      isFieldInvalid("mukhiyaContact") || formData.mukhiyaContact.length < 11
                        ? "border-red-600"
                        : "border-gray-700"
                    } rounded-xl pl-12 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500`}
                    placeholder="98XXX XXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Agent Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    name="agentName"
                    value={formData.agentName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full bg-gray-800/60 border ${
                      isFieldInvalid("agentName") ? "border-red-600" : "border-gray-700"
                    } rounded-xl pl-12 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500`}
                    placeholder="Agent full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Agent Contact <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="tel"
                    name="agentContact"
                    value={formData.agentContact}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    pattern="[0-9]{5} [0-9]{5}"
                    className={`w-full bg-gray-800/60 border ${
                      isFieldInvalid("agentContact") || formData.agentContact.length < 11
                        ? "border-red-600"
                        : "border-gray-700"
                    } rounded-xl pl-12 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder-gray-500`}
                    placeholder="98XXX XXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Documents Upload */}
            <div className="pt-8 border-t border-gray-800/50 space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Documents / Group Photo <span className="text-red-400">*</span>
              </label>

              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  imagePreview
                    ? "border-green-600/60 bg-green-950/20"
                    : "border-gray-700 hover:border-indigo-600/60 bg-gray-800/20"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {!imagePreview ? (
                  <label className="cursor-pointer flex flex-col items-center gap-5">
                    <div className="p-5 bg-gray-800/50 rounded-full">
                      <Upload className="w-10 h-10 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium text-lg">Click or drag documents here</p>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG • max 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                      required
                    />
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-80 rounded-xl shadow-2xl object-contain border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute -top-5 -right-5 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg transition"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 pt-12 border-t border-gray-800/50">
              <button
                type="submit"
                disabled={loading || isSuccess}
                className={`
                  flex-1 py-4 px-10 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 shadow-xl
                  ${
                    isSuccess
                      ? "bg-green-700 text-white cursor-default"
                      : loading
                      ? "bg-indigo-800/70 cursor-wait"
                      : "bg-gradient-to-r from-indigo-600 to-violet-700 hover:brightness-110 active:scale-[0.98]"
                  }
                `}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="animate-pulse" size={22} />
                    Saved Successfully!
                  </>
                ) : loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={22} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={22} />
                    Save Labour Entry
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 py-4 px-10 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-medium text-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Cancel
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-5 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-center">
                {error}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}