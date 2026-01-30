"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type Role = "ADMIN" | "OPERATOR" | "SUPERVISOR" | "ACCOUNTS";

export default function CreateUserPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    createUser,
    isLoading: storeLoading,
    error: storeError,
  } = useAuthStore();

  const nameInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    role: "" as Role,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

  // Auth + role guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user?.role, router]);

  // Auto-focus first field
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Please enter full name";
    if (!formData.email.trim() || !formData.email.includes("@") || !formData.email.includes("."))
      return "Please enter a valid email address";
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.trim()))
      return "Mobile number must be a valid 10-digit Indian number";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!formData.role) return "Please select a role";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const result = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        password: formData.password,
        role: formData.role,
      });

      if (result.success) {
        router.push("/dashboard/users");
        setFormData({
          name: "",
          email: "",
          mobileNumber: "",
          password: "",
          confirmPassword: "",
          role: "",
        });
        setShowPassword(false);
        setShowConfirmPassword(false);
      } else {
        setFormError(result.message || "Failed to create user");
      }
    } catch (err: any) {
      setFormError(err.message || "Something went wrong. Please try again.");
    }
  };

  // ── Unauthorized view ──────────────────────────────────────────────
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-black p-6">
        <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-10 text-center">
          <AlertCircle className="mx-auto text-rose-500 mb-6" size={64} />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-8">Only Admin users can create new accounts.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Main create user form ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/40">
              <UserPlus className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
              <p className="mt-1.5 text-gray-400">Admin-only • Add team members</p>
            </div>
          </div>

          <Link
            href="/dashboard/users"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800/70 border border-gray-700 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Users
          </Link>
        </header>

        {/* Messages */}
        {storeError && (
          <div className="flex items-start gap-4 p-5 bg-rose-950/70 border border-rose-800/60 rounded-2xl backdrop-blur-sm">
            <AlertCircle className="text-rose-400 mt-1 flex-shrink-0" size={24} />
            <p className="text-rose-100/95 flex-1">{storeError}</p>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-4 p-5 bg-emerald-950/70 border border-emerald-800/60 rounded-2xl backdrop-blur-sm">
            <CheckCircle2 className="text-emerald-400 mt-1 flex-shrink-0" size={24} />
            <p className="text-emerald-100/95 flex-1">{successMsg}</p>
          </div>
        )}

        {formError && !storeError && (
          <div className="flex items-start gap-4 p-5 bg-rose-950/70 border border-rose-800/60 rounded-2xl backdrop-blur-sm">
            <AlertCircle className="text-rose-400 mt-1 flex-shrink-0" size={24} />
            <p className="text-rose-100/95 flex-1">{formError}</p>
          </div>
        )}

        {/* Form */}
        <section className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl shadow-2xl p-6 lg:p-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <input
                  id="name"
                  ref={nameInputRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-300">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <input
                  id="mobileNumber"
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-11 pr-10 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none [&>option]:bg-gray-900 [&>option]:text-white"
                >
                  <option value="" disabled>
                    Select role...
                  </option>
                  <option value="ADMIN">Admin</option>
                  <option value="OPERATOR">Operator</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ACCOUNTS">Accounts</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={storeLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-8 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 rounded-xl font-semibold shadow-lg shadow-indigo-900/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base"
              >
                {storeLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
} 