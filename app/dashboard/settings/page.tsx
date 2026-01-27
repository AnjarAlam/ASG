"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { 
  User, Mail, Phone, ShieldCheck, Key, LogOut, Edit2, Save, 
  Loader2 
} from "lucide-react";

export default function SettingsPage() {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    mobileNumber: user?.mobileNumber || "",
  });

  // Redirect if not logged in
  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reset form when canceling
    if (isEditing) {
      setFormData({
        name: user?.name || "",
        mobileNumber: user?.mobileNumber || "",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    // TODO: Call backend API to update profile
    // Example: await fetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(formData) })
    console.log("Saving profile:", formData);
    
    // For now just simulate success
    alert("Profile updated (demo)");
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-2">Manage your account and preferences</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm mb-8">
          <div className="p-8 border-b border-gray-800">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{user?.name || "User"}</h2>
                <p className="text-gray-400">{user?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400 capitalize">
                    {user?.role?.toLowerCase() || "User"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8 space-y-8">
            {/* Basic Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User size={20} className="text-indigo-400" />
                  Profile Information
                </h3>
                <button
                  onClick={handleEditToggle}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm"
                >
                  {isEditing ? (
                    <>
                      <Save size={16} /> Save
                    </>
                  ) : (
                    <>
                      <Edit2 size={16} /> Edit
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-white">{user?.name || "—"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <p className="text-white">{user?.email || "—"}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mobile Number</label>
                  {isEditing ? (
                    <input
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-white">{user?.mobileNumber || "Not set"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">User ID</label>
                  <p className="text-white font-mono text-sm">{user?.id || user?._id || "—"}</p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="pt-6 border-t border-gray-800">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Key size={20} className="text-indigo-400" />
                Security
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 px-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-400">Last changed: Not available</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                    Change Password
                  </button>
                </div>

                {/* You can add more like 2FA status, last login, etc. */}
              </div>
            </div>

            {/* Permissions (if you have them in user object) */}
            {user?.permissions && user.permissions.length > 0 && (
              <div className="pt-6 border-t border-gray-800">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <ShieldCheck size={20} className="text-indigo-400" />
                  Permissions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map((perm: string) => (
                    <span
                      key={perm}
                      className="px-3 py-1 bg-indigo-900/40 border border-indigo-800/50 rounded-full text-sm text-indigo-300"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Extra section - e.g. account status, theme preferences, etc. */}
        <div className="text-center text-sm text-gray-500 mt-12">
          <p>Created  {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}