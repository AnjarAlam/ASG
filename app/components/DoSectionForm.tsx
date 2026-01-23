"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  X,
  FileText,
  Building2,
  IndianRupee,
  Calendar,
  Truck,
  Upload,
  Trash2,
  Home,
  Percent,
  Users,
} from "lucide-react";

export default function DoSectionForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    doNumber: "",
    colliery: "",
    volumeMT: "",
    rateWithoutGST: "",
    rateWithGST: "",
    financerName: "",
    financerOrganization: "",
    financerCost: "",
    issueDate: "",
    expiryDate: "",
    lifterCharges: "",
    lifterTransportationCharges: "",
    liftedQuantity: "",
    liftedVehicleCount: "",
    documents: [] as File[],
    remarks: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Auto-calculate rate with GST (18%)
  useEffect(() => {
    const withoutGST = parseFloat(formData.rateWithoutGST);
    if (!isNaN(withoutGST)) {
      const gst = withoutGST * 0.18;
      const withGST = withoutGST + gst;
      setFormData((prev) => ({
        ...prev,
        rateWithGST: withGST.toFixed(2),
      }));
    } else {
      setFormData((prev) => ({ ...prev, rateWithGST: "" }));
    }
  }, [formData.rateWithoutGST]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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

    if (!formData.doNumber.trim()) newErrors.doNumber = "DO Number is required";
    if (!formData.colliery.trim())
      newErrors.colliery = "Colliery name is required";
    if (!formData.volumeMT || Number(formData.volumeMT) <= 0)
      newErrors.volumeMT = "Enter valid volume (MT)";
    if (!formData.rateWithoutGST || Number(formData.rateWithoutGST) <= 0)
      newErrors.rateWithoutGST = "Enter valid rate (without GST)";
    if (!formData.financerName.trim())
      newErrors.financerName = "Financer name is required";
    if (!formData.issueDate)
      newErrors.issueDate = "Issue date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    if (!formData.liftedQuantity || Number(formData.liftedQuantity) <= 0)
      newErrors.liftedQuantity = "Enter valid lifted quantity";
    if (
      !formData.liftedVehicleCount ||
      Number(formData.liftedVehicleCount) <= 0
    )
      newErrors.liftedVehicleCount = "Enter valid vehicle count";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    alert("DO Entry saved successfully!");
    router.push("/dashboard/DOsection");
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100">
      {/* ===== HEADER ===== */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/40">
              <FileText className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">New DO Entry</h1>

              <p className="text-xs sm:text-sm text-gray-400">
                Record DO details • rates • finance • lifting
              </p>
            </div>
          </div>

          {/* RIGHT ACTION */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/70 hover:bg-gray-700 text-gray-300 hover:text-white transition shadow-sm"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </div>
        </header>
      </div>

      {/* ===== FORM ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* DO & Colliery + Volume */}
          <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <FileText className="h-6 w-6 text-indigo-400" />
              DO & Colliery Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative">
                <input
                  ref={firstInputRef}
                  type="text"
                  name="doNumber"
                  value={formData.doNumber}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.doNumber
                      ? "border-red-500"
                      : "border-gray-700 focus:border-indigo-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  DO Number *
                </label>
                {errors.doNumber && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.doNumber}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="colliery"
                  value={formData.colliery}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.colliery
                      ? "border-red-500"
                      : "border-gray-700 focus:border-indigo-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  Colliery Name *
                </label>
                {errors.colliery && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.colliery}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="number"
                  name="volumeMT"
                  value={formData.volumeMT}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.volumeMT
                      ? "border-red-500"
                      : "border-gray-700 focus:border-indigo-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield]`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  Volume (MT) *
                </label>
                {errors.volumeMT && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.volumeMT}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="date"
                  name="receiveDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.receiveDate
                      ? "border-red-500"
                      : "border-gray-700 focus:border-indigo-500"
                  } rounded-md outline-none text-base text-white [color-scheme:dark]`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  issue Date *
                </label>
                {errors.receiveDate && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.receiveDate}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="date"
                  name="returnDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.returnDate
                      ? "border-red-500"
                      : "border-gray-700 focus:border-indigo-500"
                  } rounded-md outline-none text-base text-white [color-scheme:dark]`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  expiry Date *
                </label>
                {errors.returnDate && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.returnDate}
                  </p>
                )}
              </div>
            </div>
            
          </section>

          {/* ===== RATES SECTION (Separate) ===== */}
          <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <IndianRupee className="h-6 w-6 text-indigo-400" />
              Rates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="rateWithoutGST"
                    value={formData.rateWithoutGST}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className={`peer flex-1 px-4 py-3.5 border-b-2 ${
                      errors.rateWithoutGST
                        ? "border-red-500"
                        : "border-gray-700 focus:border-indigo-500"
                    } rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield]`}
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  Rate (Without GST) *
                </label>
                {errors.rateWithoutGST && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.rateWithoutGST}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="text"
                    name="rateWithGST"
                    value={formData.rateWithGST}
                    readOnly
                    placeholder="Auto-calculated (18% GST)"
                    className="peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 rounded-r-md outline-none text-base text-white bg-gray-800/50 cursor-not-allowed"
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400">
                  Rate (With GST)
                </label>
              </div>
            </div>
          </section>

          {/* ===== FINANCER ===== */}
          <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <Users className="h-6 w-6 text-indigo-400" />
              Financer & Dates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative">
                <input
                  type="text"
                  name="financerName"
                  value={formData.financerName}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.financerName
                      ? "border-red-500"
                      : "border-gray-700 focus:border-indigo-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  Financer Name *
                </label>
                {errors.financerName && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.financerName}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="financerOrganization"
                  value={formData.financerOrganization}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full px-4 py-3.5 border-b-2 border-gray-700 focus:border-indigo-500 rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200"
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  Financer Organization
                </label>
              </div>

              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="financerCost"
                    value={formData.financerCost}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="1"
                    className={`peer flex-1 px-4 py-3.5 border-b-2 ${
                      errors.financerCost
                        ? "border-red-500"
                        : "border-gray-700 focus:border-indigo-500"
                    } rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield]`}
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  Financer Cost
                </label>
              </div>
            </div>
          </section>

          {/* Lifting Details */}
          <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-7 flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <Truck className="h-6 w-6 text-indigo-400" />
              Lifting Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="lifterCharges"
                    value={formData.lifterCharges}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="1"
                    className={`peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-indigo-500 rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield]`}
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  Lifter Charges
                </label>
              </div>

              <div className="relative">
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3.5 bg-gray-900/80 border-b-2 border-gray-700 rounded-l-md text-gray-300">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="lifterTransportationCharges"
                    value={formData.lifterTransportationCharges}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="1"
                    className={`peer flex-1 px-4 py-3.5 border-b-2 border-gray-700 focus:border-indigo-500 rounded-r-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield]`}
                  />
                </div>
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  Transportation Charges
                </label>
              </div>

              <div className="relative">
                <input
                  type="number"
                  name="liftedQuantity"
                  value={formData.liftedQuantity}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.liftedQuantity
                      ? "border-red-500"
                      : "border-gray-700 focus:border-indigo-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield]`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  Lifted Quantity (MT) *
                </label>
                {errors.liftedQuantity && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.liftedQuantity}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="number"
                  name="liftedVehicleCount"
                  value={formData.liftedVehicleCount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={`peer w-full px-4 py-3.5 border-b-2 ${
                    errors.liftedVehicleCount
                      ? "border-red-500"
                      : "border-gray-700 focus:border-indigo-500"
                  } rounded-md outline-none text-base text-white placeholder-transparent transition-colors duration-200 [appearance:textfield]`}
                />
                <label className="absolute left-4 -top-2 px-2 bg-gray-900 text-xs font-medium text-gray-400 peer-focus:text-indigo-400 transition-all duration-200">
                  Lifted Vehicle Count *
                </label>
                {errors.liftedVehicleCount && (
                  <p className="text-red-400 text-xs mt-1.5">
                    {errors.liftedVehicleCount}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Documents & Remarks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <Upload className="h-6 w-6 text-indigo-400" />
                Supporting Documents
              </h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center hover:border-indigo-500/50 transition-colors cursor-pointer bg-gray-950/30"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-300">
                  Click to upload documents
                </p>
                <p className="text-sm text-gray-500 mt-2">
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
                      <div className="flex items-center gap-3 max-w-[75%]">
                        <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
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

            <section className="bg-gray-900/75 border border-gray-800/70 rounded-2xl p-6 lg:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 pb-4 border-b border-gray-700/50">
                <FileText className="h-6 w-6 text-indigo-400" />
                Remarks / Notes
              </h2>

              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={5}
                placeholder="Additional notes, special conditions, transporter details, any penalties..."
                className="w-full px-4 py-3.5 border border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500/50 transition text-sm text-gray-200 placeholder-gray-500 resize-none bg-gray-950/30"
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
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save DO Entry"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
