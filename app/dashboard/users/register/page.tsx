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

type Role = "OPERATOR" | "USER" | "ADMIN" | "SUPER_ADMIN";

export default function CreateUserPage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated } = useAuthStore();

  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    role: "OPERATOR" as Role,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!["ADMIN", "SUPER_ADMIN"].includes(user?.role || "")) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user?.role, router]);

  // Auto focus first field
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Full name is required";
    if (!formData.email.includes("@") || !formData.email.trim())
      return "Valid email is required";
    if (!/^\d{10}$/.test(formData.mobileNumber))
      return "Mobile number must be exactly 10 digits";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        password: formData.password,
        role: formData.role,
        status: true,
      };

      // Optional: debug what is being sent
      // console.log("Creating user with payload:", payload);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create user");
      }

      setSuccess(
        `User "${formData.name.trim()}" (${formData.role}) created successfully!`
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        mobileNumber: "",
        password: "",
        confirmPassword: "",
        role: "OPERATOR",
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (err: any) {
      setError(err.message || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Not authorized / not logged in
  if (!isAuthenticated || !["ADMIN", "SUPER_ADMIN"].includes(user?.role || "")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-black p-4">
        <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-10 text-center shadow-2xl">
          <AlertCircle className="mx-auto text-rose-500 mb-6" size={64} strokeWidth={1.6} />
          <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
          <p className="text-gray-400 mb-8">
            Only Admin or Super Admin can create new users
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/40">
              <UserPlus className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                Create New User
              </h1>
              <p className="mt-1.5 text-gray-400 text-sm">
                Admin-only • Add team members or elevated roles
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/users"
            className="flex items-center gap-2 px-6 py-3 bg-gray-800/70 border border-gray-700 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Users List
          </Link>
        </header>

        {/* Messages */}
        {success && (
          <div className="flex items-start gap-4 p-5 bg-emerald-950/60 border border-emerald-800/50 rounded-2xl backdrop-blur-sm">
            <CheckCircle2 className="text-emerald-400 mt-1" size={24} />
            <p className="text-emerald-100/95 flex-1">{success}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-4 p-5 bg-rose-950/60 border border-rose-800/50 rounded-2xl backdrop-blur-sm">
            <AlertCircle className="text-rose-400 mt-1" size={24} />
            <p className="text-rose-100/95 flex-1">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <section className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl shadow-2xl p-6 lg:p-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <input
                  ref={firstInputRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                  pattern="\d{10}"
                  maxLength={10}
                  placeholder="9876543210"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Role Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none [&>option]:bg-gray-900 [&>option]:text-white"
                >
                  <option value="OPERATOR">Operator</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 rounded-xl font-semibold shadow-lg shadow-indigo-900/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating User...
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