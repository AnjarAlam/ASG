"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  Edit2,
  Save,
  X,
  Loader2,
  Calendar,
  Clock,
  Hash,
  CheckCircle2,
  Users,
} from "lucide-react";
import dayjs from "dayjs";

export default function SettingsPage() {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const router = useRouter();
  

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", mobileNumber: "" });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        mobileNumber: user.mobileNumber || "",
      });
    }
  }, [user]);

   useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
      logout();
      router.push("/login");
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      // TODO: real API call
      console.log("Saving profile →", formData);
      await new Promise((r) => setTimeout(r, 1400));
      alert("Profile updated successfully (demo)");
      setIsEditing(false);
    } catch {
      alert("Failed to save changes");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      mobileNumber: user?.mobileNumber || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screenb bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Top Bar - Compact */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Account Settings
            </h1>
            <p className="text-gray-400 mt-1.5">
              Profile • Security • Permissions
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600/90 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>

        {/* Main Horizontal Layout - Two big columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN - Profile Overview + Avatar (4-5 cols) */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl h-full">
              {/* Avatar + Name Block */}
              <div className="p-6 sm:p-8 border-b border-gray-800 bg-gradient-to-br from-gray-950 via-gray-900 to-black">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar container */}
                  <div className="relative mb-10 mt-10">
                    <div className="w-36 h-36 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ring-4 ring-indigo-500/25 ring-offset-2 ring-offset-gray-950">
                      {user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    {/* Verified badge */}
                    <div className="absolute -bottom-3 -right-3 bg-emerald-500 p-2 rounded-full border-4 border-gray-950 shadow-lg">
                      <CheckCircle2 size={20} className="text-white" />
                    </div>
                  </div>

                  {/* Name */}
                  <h2 className="text-3xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                    {user?.name || "User"}
                  </h2>

                  {/* Email */}
                  <p className="text-base text-gray-400 mb-5 font-medium">
                    {user?.email || "No email linked"}
                  </p>

                  {/* Status badges */}
                  
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 transition-colors hover:bg-emerald-950/80">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      {user?.role || "User"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full bg-gray-800/80 text-gray-300 border border-gray-700 transition-colors hover:bg-gray-800">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      {user?.status?.toUpperCase() || "ACTIVE"}
                    </span>
                  </div>  
            </div>
          </div>

          {/* RIGHT COLUMN - All editable fields & extra info (7-8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 shadow-2xl h-full">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2.5">
                <User className="text-indigo-400" size={22} />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldRow
                  icon={<User size={18} />}
                  label="Full Name"
                  value={
                    isEditing ? (
                      <input
                        name="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none"
                        placeholder="Your full name"
                      />
                    ) : (
                      user?.name || "—"
                    )
                  }
                />

                <FieldRow
                  icon={<Mail size={18} />}
                  label="Email Address"
                  value={user?.email || "—"}
                  readonly
                />

                <FieldRow
                  icon={<Phone size={18} />}
                  label="Mobile Number"
                  value={
                    isEditing ? (
                      <input
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            mobileNumber: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none"
                        placeholder="+91 ..."
                      />
                    ) : (
                      user?.mobileNumber || "Not provided"
                    )
                  }
                />

                <FieldRow
                  icon={<Hash size={18} />}
                  label="User ID"
                  value={user?.id || "—"}
                  mono
                  readonly
                />
              </div>

              {/* Permissions & Security - Bottom part */}
              <div className="mt-10 pt-8 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-indigo-400" size={20} />
                    Permissions
                  </h4>
                  {user?.permissions?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {user.permissions.map((p) => (
                        <span
                          key={p}
                          className="px-4 py-1.5 bg-indigo-950/60 border border-indigo-800/40 rounded-lg text-indigo-300 text-sm"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-1.5 bg-indigo-950/60 border border-indigo-800/40 rounded-lg text-indigo-300 text-sm">
                      All Permissions
                    </p>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="bg-gray-800/40 p-5 rounded-xl border border-gray-700/50">
                    <h4 className="text-base font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" size={18} />
                      Account Status
                    </h4>
                    <p className="text-gray-100 capitalize">
                      {user?.status || "active"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-12">
          © {new Date().getFullYear()} Coal Washery Management System • All
          rights reserved
        </p>
      </div>
    </div>
  );
}

function FieldRow({
  icon,
  label,
  value,
  mono = false,
  readonly = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 bg-gray-800/30 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="p-3 rounded-lg bg-gray-900/60 text-indigo-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        {readonly || typeof value !== "string" ? (
          <p
            className={`text-base ${mono ? "font-mono break-all" : ""} text-gray-100`}
          >
            {value}
          </p>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
