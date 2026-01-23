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

export default function LabourForm() {
  const router = useRouter();

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Indian phone number formatting (5-5)
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
    setIsSubmitting(true);

    // All fields are required now
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

    const missing = requiredFields.filter((field) => !formData[field as keyof typeof formData]);

    if (missing.length > 0 || !imageFile) {
      alert("Please fill all required fields and upload group/mukhiya photo");
      setIsSubmitting(false);
      return;
    }

    if (formData.mukhiyaContact.replace(/\D/g, "").length !== 10) {
      alert("Mukhiya contact must be a valid 10-digit number");
      setIsSubmitting(false);
      return;
    }

    if (formData.agentContact.replace(/\D/g, "").length !== 10) {
      alert("Agent contact must be a valid 10-digit number");
      setIsSubmitting(false);
      return;
    }

    try {
      // Your real API call would go here
      await new Promise((r) => setTimeout(r, 1400));

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/labour");
      }, 1800);
    } catch (err) {
      alert("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFieldInvalid = (field: string) =>
    touched[field] && !formData[field as keyof typeof formData];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-indigo-900/40">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Register Today's Labour</h1>
            <p className="text-gray-400 mt-2 text-lg">Labour group / Mukhiya registration</p>
          </div>
        </div>

        <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 sm:p-9 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-9">
            {/* Cost Preview */}
            {formData.numberOfWorkers && formData.ratePerWorker && (
              <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/40 p-6 rounded-xl border border-indigo-900/30">
                <div className="flex items-center gap-3 text-indigo-300 mb-3">
                  <Calculator size={20} />
                  <span className="font-medium text-lg">Estimated Daily Cost</span>
                </div>
                <div className="text-4xl font-bold text-white tracking-tight">
                  ₹{calculateTotal()}
                </div>
                <div className="text-sm text-gray-300 mt-2">
                  {formData.numberOfWorkers} workers × ₹{formData.ratePerWorker}{" "}
                  {formData.transportRate && `+ ₹${formData.transportRate} transport`}
                </div>
              </div>
            )}

            {/* Main Information - 2 column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Number of Workers <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="number"
                    name="numberOfWorkers"
                    value={formData.numberOfWorkers}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    min="1"
                    className={`w-full bg-gray-800/70 border ${
                      isFieldInvalid("numberOfWorkers") ? "border-red-600" : "border-gray-700"
                    } rounded-xl pl-11 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                    placeholder="Total workers in group"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Village / Location <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full bg-gray-800/70 border ${
                      isFieldInvalid("village") ? "border-red-600" : "border-gray-700"
                    } rounded-xl pl-11 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                    placeholder="Village / Area name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Rate per Worker (₹/day) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="number"
                    name="ratePerWorker"
                    value={formData.ratePerWorker}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    min="0"
                    step="1"
                    className={`w-full bg-gray-800/70 border ${
                      isFieldInvalid("ratePerWorker") ? "border-red-600" : "border-gray-700"
                    } rounded-xl pl-11 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                    placeholder="Daily wage per labour"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Transport Rate (₹/group/day) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="number"
                    name="transportRate"
                    value={formData.transportRate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    min="0"
                    step="1"
                    className={`w-full bg-gray-800/70 border ${
                      isFieldInvalid("transportRate") ? "border-red-600" : "border-gray-700"
                    } rounded-xl pl-11 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                    placeholder="Total transport cost"
                  />
                </div>
              </div>
            </div>

            {/* Mukhiya & Agent - 2 column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-800/50">
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
                  className={`w-full bg-gray-800/70 border ${
                    isFieldInvalid("mukhiyaName") ? "border-red-600" : "border-gray-700"
                  } rounded-xl px-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                  placeholder="Full name of mukhiya"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Mukhiya Contact Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="tel"
                    name="mukhiyaContact"
                    value={formData.mukhiyaContact}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    pattern="[0-9]{5} [0-9]{5}"
                    className={`w-full bg-gray-800/70 border ${
                      isFieldInvalid("mukhiyaContact") || formData.mukhiyaContact.length < 11
                        ? "border-red-600"
                        : "border-gray-700"
                    } rounded-xl pl-11 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                    placeholder="9X XXXX XXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Agent Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    name="agentName"
                    value={formData.agentName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full bg-gray-800/70 border ${
                      isFieldInvalid("agentName") ? "border-red-600" : "border-gray-700"
                    } rounded-xl pl-11 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                    placeholder="Agent full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Agent Contact Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="tel"
                    name="agentContact"
                    value={formData.agentContact}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    pattern="[0-9]{5} [0-9]{5}"
                    className={`w-full bg-gray-800/70 border ${
                      isFieldInvalid("agentContact") || formData.agentContact.length < 11
                        ? "border-red-600"
                        : "border-gray-700"
                    } rounded-xl pl-11 pr-4 py-3.5 text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                    placeholder="9X XXXX XXXX"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload - Full width */}
            <div className="space-y-4 pt-6 border-t border-gray-800/50">
              <label className="block text-sm font-medium text-gray-300">
                Documents <span className="text-red-400">*</span>
              </label>

              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                  imagePreview
                    ? "border-green-600/50 bg-green-950/10"
                    : isFieldInvalid("image") || !imagePreview
                    ? " bg-red-950/10"
                    : "border-gray-700 hover:border-indigo-600/60 bg-gray-800/30"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {!imagePreview ? (
                  <label className="cursor-pointer flex flex-col items-center gap-4">
                    <Upload className="w-14 h-14 text-gray-500" />
                    <div>
                      <p className="text-gray-300 font-medium text-lg">Upload Documents</p>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG • maximum 5MB</p>
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
                      alt="Documents Preview"
                      className="max-h-72 rounded-lg shadow-2xl object-contain border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute -top-4 -right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg transition"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 pt-10 border-t border-gray-800/50">
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={`
                  flex-1 py-4 px-8 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 shadow-xl
                  ${
                    isSuccess
                      ? "bg-green-700 text-white cursor-default"
                      : isSubmitting
                      ? "bg-indigo-800/70 cursor-wait"
                      : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:brightness-110 active:scale-[0.98]"
                  }
                `}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="animate-pulse" size={22} />
                    Saved Successfully!
                  </>
                ) : isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin" size={22} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={22} />
                    Labour Group Entry
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1 py-4 px-8 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-medium text-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}