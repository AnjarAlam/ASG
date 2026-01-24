"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import {
  UserPlus,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns"; // for formatting createdAt

// ────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────

type UserRole = "ADMIN" | "OPERATOR" | "SUPER_ADMIN" | "USER";

interface UserData {
  _id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  role: UserRole;
  status?: boolean;
  permissions?: string[];
  createdAt?: string;
  createdBy?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ────────────────────────────────────────────────

export default function UsersDashboardPage() {
  const router = useRouter();
  const { user, accessToken, isLoading: authLoading } = useAuthStore();

  const [users, setUsers] = useState<UserData[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // ────────────────────────────────────────────────
  // AUTH PROTECTION
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!accessToken || !user) {
      router.replace("/login?from=/dashboard/users");
      return;
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [authLoading, accessToken, user, router]);

  // ────────────────────────────────────────────────
  // FETCH USERS
  // ────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    if (!accessToken) return;
    if (authLoading) return;

    setFetchLoading(true);
    setFetchError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const url = `${process.env.NEXT_PUBLIC_API_URL}/user-auth?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          errorMessage = errData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Debug log – keep this until users appear correctly
      console.log("Backend response:", data);

      const userList = data.users || data.data || data || [];
      const pagination = data.meta || null;

      setUsers(Array.isArray(userList) ? userList : []);
      setMeta(pagination);
      setLastFetched(new Date());
    } catch (err: any) {
      console.error("Fetch users failed:", err);
      setFetchError(err.message || "Failed to load users");
    } finally {
      setFetchLoading(false);
    }
  }, [accessToken, authLoading, currentPage, itemsPerPage]);

  useEffect(() => {
    if (accessToken && !authLoading && user && ["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      loadUsers();
    }
  }, [loadUsers, accessToken, authLoading, user]);

  // Client-side search
  const visibleUsers = users.filter((u) =>
    `${u.name ?? ""} ${u.email ?? ""} ${u.mobileNumber ?? ""} ${u.role ?? ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim())
  );

  const handleRefresh = () => loadUsers();

  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!accessToken || !user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-gray-900 p-10 rounded-2xl text-center max-w-md">
          <AlertCircle className="mx-auto text-red-500 mb-6" size={72} />
          <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            Only administrators can view this page.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-6 pb-24">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-gray-400 mt-1">
              {lastFetched && <>Last updated: {lastFetched.toLocaleTimeString()}</>}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={fetchLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50"
            >
              <RefreshCw size={18} className={fetchLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <Link
              href="/dashboard/users/register"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium shadow-lg shadow-indigo-900/30"
            >
              <UserPlus size={20} />
              Add New User
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search name, email, phone, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
          />
        </div>

        {/* Error */}
        {fetchError && (
          <div className="p-5 bg-red-950/50 border border-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
            <span className="text-red-200">{fetchError}</span>
          </div>
        )}

        {/* Loading */}
        {fetchLoading && (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
            <p className="text-gray-400">Loading users...</p>
          </div>
        )}

        {/* Table */}
        {!fetchLoading && visibleUsers.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/60">
                  <tr className="text-left text-sm uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Mobile</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 hidden md:table-cell">Status</th>
                    <th className="px-6 py-4">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {visibleUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <User size={18} className="text-gray-400" />
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{u.email}</td>
                      <td className="px-6 py-4 hidden sm:table-cell text-gray-300">
                        {u.mobileNumber || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-200">
                          <ShieldCheck size={14} />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {u.status !== undefined ? (
                          u.status ? (
                            <span className="flex items-center gap-1.5 text-green-400">
                              <CheckCircle2 size={16} /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-red-400">
                              <AlertCircle size={16} /> Inactive
                            </span>
                          )
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {u.createdAt
                          ? format(new Date(u.createdAt), "MMM dd, yyyy HH:mm")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="px-6 py-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <div className="text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, meta.total)} of {meta.total}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span>Page {currentPage} / {meta.totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage >= meta.totalPages}
                    className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!fetchLoading && visibleUsers.length === 0 && (
          <div className="py-24 text-center text-gray-400 bg-gray-900/30 rounded-2xl border border-gray-800/50">
            <UserPlus size={64} className="mx-auto mb-6 opacity-70" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchQuery ? "No matching users" : "No users found"}
            </h3>
            <p className="max-w-md mx-auto">
              {searchQuery
                ? "Try different search terms"
                : "You can add your first user now"}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/users/register"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium"
              >
                <UserPlus size={18} />
                Register New User
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}