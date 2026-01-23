"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  X,
  IndianRupee,
  User,
  Building2,
  Calendar,
  Percent,
  CreditCard,
  FileText,
  Upload,
  Trash2,
  Home,
} from "lucide-react";

export default function FinanceEntryForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    financerName: "",
    financerOrganization: "",
    amountReceived: "",
    interestRate: "",
    amountToReturn: "",
    receiveDate: "",
    returnDate: "",
    paymentMode: "",
    documents: [] as File[],
    remarks: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Auto-calculate amountToReturn
  useEffect(() => {
    const calculateAmountToReturn = () => {
      const principal = parseFloat(formData.amountReceived);
      const rate = parseFloat(formData.interestRate);
      const receive = new Date(formData.receiveDate);
      const returnD = new Date(formData.returnDate);

      if (
        !isNaN(principal) &&
        !isNaN(rate) &&
        formData.receiveDate &&
        formData.returnDate &&
        returnD > receive
      ) {
        const days = Math.ceil((returnD.getTime() - receive.getTime()) / (1000 * 60 * 60 * 24));
        const interest = principal * (rate / 100) * days;
        const total = principal + interest;
        setFormData((prev) => ({ ...prev, amountToReturn: total.toFixed(2) }));
      } else {
        setFormData((prev) => ({ ...prev, amountToReturn: "" }));
      }
    };

    calculateAmountToReturn();
  }, [formData.amountReceived, formData.interestRate, formData.receiveDate, formData.returnDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.financerName.trim()) newErrors.financerName = "Required";
    if (!formData.amountReceived || Number(formData.amountReceived) <= 0)
      newErrors.amountReceived = "Enter valid amount";
    if (!formData.interestRate || Number(formData.interestRate) < 0)
      newErrors.interestRate = "Enter valid rate";
    if (!formData.amountToReturn || Number(formData.amountToReturn) <= 0)
      newErrors.amountToReturn = "Enter valid return amount";
    if (!formData.receiveDate) newErrors.receiveDate = "Required";
    if (!formData.returnDate) newErrors.returnDate = "Required";
    if (!formData.paymentMode) newErrors.paymentMode = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1400)); // simulate API
    alert("Finance entry saved successfully!");
    router.push("/dashboard/finance");
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 pb-8">
      {/* ===== HEADER ===== */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 space-y-8">

      <header className="backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between h-16">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/40">
                <IndianRupee className="h-7 w-7 text-white" />
              </div>
              <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  New Finance Entry
                </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                  Record finance details • interest • documents
                </p>
              </div>
            </div>

            {/* Right: Cancel Button */}
            <button
              type="button"
              onClick={() => router.back()}
              className="p-4 rounded-full hover:bg-gray-800/70 transition text-gray-400 hover:text-gray-200 mr-5"
              title="Cancel and go back"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

      </header>
          </div>

      {/* ===== FORM CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Financer & Amounts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Financer Information */}
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <User className="h-6 w-6 text-violet-400" />
                Financer Details
              </h2>

              <div className="space-y-7">
                <div className="relative">
                  <input
                    ref={firstInputRef}
                    type="text"
                    name="financerName"
                    value={formData.financerName}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer w-full px-4 py-3.5 border-b-2 ${
                      errors.financerName ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                    } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Financer Name *
                  </label>
                  {errors.financerName && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.financerName}</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="financerOrganization"
                    value={formData.financerOrganization}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-violet-500 rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200"
                  />
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Organization / Firm
                  </label>
                </div>

                <div className="relative">
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className={`peer w-full px-4 py-3.5 bg-gray-900/60 border-b-2 ${
                      errors.paymentMode ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                    } rounded-md outline-none text-base text-white appearance-none`}
                  >
                    <option value="">Select Payment Mode *</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Payment Mode *
                  </label>
                  {errors.paymentMode && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.paymentMode}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Amount & Interest */}
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <IndianRupee className="h-6 w-6 text-violet-400" />
                Financial Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="amountReceived"
                      value={formData.amountReceived}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="1"
                      className={`peer flex-1 px-4 py-3.5 border-b-2 ${
                        errors.amountReceived ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                      } rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield]`}
                    />
                  </div>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Received Amount *
                  </label>
                  {errors.amountReceived && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.amountReceived}</p>
                  )}
                </div>

                <div className="relative">
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                      %
                    </span>
                    <input
                      type="number"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      className={`peer flex-1 px-4 py-3.5 border-b-2 ${
                        errors.interestRate ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                      } rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield]`}
                    />
                  </div>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                    Interest Rate (per day) *
                  </label>
                  {errors.interestRate && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.interestRate}</p>
                  )}
                </div>

                <div className="relative sm:col-span-2">
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300 font-medium">
                      ₹
                    </span>
                    <input
                      type="text"
                      name="amountToReturn"
                      value={formData.amountToReturn}
                      readOnly
                      placeholder="Auto-calculated"
                      className={`peer flex-1 px-4 py-3.5 border-b-2 ${
                        errors.amountToReturn ? "border-red-500" : "border-gray-700"
                      } rounded-r-md outline-none text-base text-white bg-gray-800/50 cursor-not-allowed transition-colors duration-200`}
                    />
                  </div>
                  <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 transition-all duration-200">
                    Total Return Amount (Auto-calculated) *
                  </label>
                  {errors.amountToReturn && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.amountToReturn}</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Dates */}
          <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <Calendar className="h-6 w-6 text-violet-400" />
              Transaction Dates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="date"
                  name="receiveDate"
                  value={formData.receiveDate}
                  onChange={handleChange}
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.receiveDate ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-base text-white [color-scheme:dark]`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Receive Date *
                </label>
                {errors.receiveDate && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.receiveDate}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.returnDate ? "border-red-500" : "border-gray-700 focus:border-violet-500"
                  } rounded-md outline-none text-base text-white [color-scheme:dark]`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-violet-400 transition-all duration-200">
                  Return / Due Date *
                </label>
                {errors.returnDate && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.returnDate}</p>
                )}
              </div>
            </div>
          </section>

          {/* Documents & Remarks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <FileText className="h-6 w-6 text-violet-400" />
                Supporting Documents
              </h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center hover:border-violet-500/50 transition-colors cursor-pointer bg-gray-950/30"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-300">Click to upload documents</p>
                <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG • Max 10MB per file</p>
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
                      <div className="flex items-center gap-3 max-w-[75%]">
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

            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <FileText className="h-6 w-6 text-violet-400" />
                Remarks / Additional Notes
              </h2>

              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={7}
                placeholder="Purpose of finance, guarantor details, special conditions, penalty terms, etc..."
                className="w-full px-4 py-3.5 border border-gray-700 rounded-xl focus:outline-none focus:border-violet-500/50 transition text-sm text-gray-200 placeholder-gray-500 resize-none bg-gray-950/30"
              />
            </section>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="order-2 sm:order-1 px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-10 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Finance Entry"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}