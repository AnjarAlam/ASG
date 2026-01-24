"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function CreateUserPage() {
  const router = useRouter();
  const { createUser, user } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    role: "USER" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user?.role !== "SUPER_ADMIN") {
      alert("Only Super Admin can create users");
      return;
    }

    const success = await createUser(form);
    if (success) {
      alert("User created successfully!");
      router.push("/dashboard/users");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-3 border rounded"
          required
        />
        <input
          placeholder="Mobile Number"
          value={form.mobileNumber}
          onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-3 border rounded"
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as "ADMIN" | "USER" })}
          className="w-full p-3 border rounded"
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded">
          Create User
        </button>
      </form>
    </div>
  );
}