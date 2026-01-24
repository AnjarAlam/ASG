"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, User, Mail, Phone, Lock } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error: storeError } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      setLocalError("Mobile number must be 10 digits");
      return;
    }

    const ok = await signup({
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      password: formData.password,
    });

    if (ok) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-gray-900/70 border border-gray-800 rounded-3xl shadow-2xl backdrop-blur-sm p-8 lg:p-12">

        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1">
              Join the Coal Washary Management System
            </p>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-sm">
            Account created successfully! Redirecting to login...
          </div>
        )}

        {(storeError || localError) && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-sm">
            {storeError || localError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Input
            icon={<User size={18} />}
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={(e: any) =>
              setFormData((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="John Doe"
            required
          />

          <Input
            icon={<Mail size={18} />}
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={(e: any) =>
              setFormData((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="user@example.com"
            required
          />

          <Input
            icon={<Phone size={18} />}
            label="Mobile Number"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={(e: any) =>
              setFormData((p) => ({ ...p, mobileNumber: e.target.value }))
            }
            placeholder="9876543210"
            required
          />

          <div />

          <PasswordInput
            label="Password"
            value={formData.password}
            onChange={(v: string) =>
              setFormData((p) => ({ ...p, password: v }))
            }
            show={showPassword}
            setShow={setShowPassword}
          />

          <PasswordInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(v: string) =>
              setFormData((p) => ({ ...p, confirmPassword: v }))
            }
            show={showConfirmPassword}
            setShow={setShowConfirmPassword}
          />

          {/* Buttons */}
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-6">
            <Link
              href="/login"
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-center transition"
            >
              Back to Login
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition disabled:opacity-60"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===================== Reusable Components ===================== */

function Input({ icon, label, ...props }: any) {
  return (
    <div>
      <label className="block mb-2 text-sm text-gray-400">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </span>
        <input
          {...props}
          className="w-full pl-11 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition"
        />
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange, show, setShow }: any) {
  return (
    <div>
      <label className="block mb-2 text-sm text-gray-400">{label}</label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={6}
          className="w-full pl-11 pr-12 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
    