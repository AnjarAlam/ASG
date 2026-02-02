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
  FileSearch,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">

        {/* Header + actions */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg flex-shrink-0">
                <FileSearch className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-100 truncate">
                  User Management
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5 truncate">
                  {lastFetched ? (
                    <>Last updated: {lastFetched.toLocaleTimeString()}</>
                  ) : (
                    "Never"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={fetchLoading}
                className={`
                  flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 
                  bg-gray-800 hover:bg-gray-700 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  rounded-lg text-xs sm:text-sm font-medium
                  transition-colors
                `}
              >
                <RefreshCw
                  size={16}
                  className={`sm:size-5 ${fetchLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                href="/dashboard/users/register"
                className={`
                  flex items-center gap-2 px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3
                  bg-indigo-600 hover:bg-indigo-500 
                  rounded-lg sm:rounded-xl font-medium text-white
                  shadow-lg shadow-indigo-900/30
                  transition-all
                  text-xs sm:text-sm
                `}
              >
                <UserPlus size={16} className="sm:size-5" />
                <span className="hidden sm:inline">Add New User</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Search */}
        <div className="relative max-w-full md:max-w-md">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 size={16} sm:size-5" />
          <input
            type="text"
            placeholder="Search name, email, phone, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-800/60 border border-gray-700 rounded-lg sm:rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
          />
        </div>

        {/* Error */}
        {fetchError && (
          <div className="p-4 sm:p-5 bg-red-950/50 border border-red-800 rounded-lg sm:rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-red-200 text-sm break-words">{fetchError}</span>
          </div>
        )}

        {/* Loading */}
        {fetchLoading && (
          <div className="flex flex-col items-center py-16 sm:py-20">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-indigo-500 mb-3 sm:mb-4" />
            <p className="text-gray-400 text-sm">Loading users...</p>
          </div>
        )}

        {/* Table - Desktop View */}
        {!fetchLoading && visibleUsers.length > 0 && (
          <div className="hidden sm:block bg-gray-900/50 border border-gray-800 rounded-lg sm:rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/60">
                  <tr className="text-left text-xs sm:text-sm uppercase tracking-wider text-gray-400">
                    <th className="px-4 sm:px-6 py-3 sm:py-4">Name</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">Email</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Mobile</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">Role</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Status</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {visibleUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-800/40 transition-colors text-sm">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <User size={16} className="text-gray-400 hidden sm:block" />
                          <span className="font-medium truncate">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-300 text-xs sm:text-sm truncate">{u.email}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell text-gray-300 text-xs sm:text-sm">
                        {u.mobileNumber || "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-200 whitespace-nowrap">
                          <ShieldCheck size={12} className="sm:size-4" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                        {u.status !== undefined ? (
                          u.status ? (
                            <span className="flex items-center gap-1 text-green-400 text-xs sm:text-sm">
                              <CheckCircle2 size={14} className="sm:size-4" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400 text-xs sm:text-sm">
                              <AlertCircle size={14} className="sm:size-4" /> Inactive
                            </span>
                          )
                        ) : "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-300 text-xs sm:text-sm whitespace-nowrap">
                        {u.createdAt
                          ? format(new Date(u.createdAt), "MMM dd, yyyy")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="text-gray-400 text-center sm:text-left">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, meta.total)} of {meta.total}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} className="sm:size-5" />
                  </button>
                  <span className="text-center min-w-[60px]">Page {currentPage} / {meta.totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage >= meta.totalPages}
                    className="p-1.5 sm:p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                  >
                    <ChevronRight size={16} className="sm:size-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card View - Mobile */}
        {!fetchLoading && visibleUsers.length > 0 && (
          <div className="sm:hidden space-y-3">
            {visibleUsers.map((u) => (
              <div key={u._id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400 flex-shrink-0" />
                      <h3 className="font-semibold text-white truncate">{u.name}</h3>
                    </div>
                    <p className="text-gray-400 text-xs mt-1 truncate">{u.email}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-800 text-gray-200 flex-shrink-0 whitespace-nowrap">
                    <ShieldCheck size={12} />
                    {u.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {u.mobileNumber && (
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="text-gray-300 truncate">{u.mobileNumber}</p>
                    </div>
                  )}
                  {u.status !== undefined && (
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className={u.status ? "text-green-400" : "text-red-400"}>
                        {u.status ? "Active" : "Inactive"}
                      </p>
                    </div>
                  )}
                </div>

                {u.createdAt && (
                  <p className="text-gray-500 text-xs border-t border-gray-800 pt-2">
                    Created: {format(new Date(u.createdAt), "MMM dd, yyyy HH:mm")}
                  </p>
                )}
              </div>
            ))}
            
            {meta && (
              <div className="flex items-center justify-between gap-2 py-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-400 flex-1 text-center">
                  Page {currentPage} / {meta.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= meta.totalPages}
                  className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!fetchLoading && visibleUsers.length === 0 && (
          <div className="py-16 sm:py-24 text-center text-gray-400 bg-gray-900/30 rounded-lg sm:rounded-2xl border border-gray-800/50 px-4">
            <UserPlus size={48} className="sm:size-64 mx-auto mb-4 sm:mb-6 opacity-70" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">
              {searchQuery ? "No matching users" : "No users found"}
            </h3>
            <p className="max-w-md mx-auto text-sm">
              {searchQuery
                ? "Try different search terms"
                : "You can add your first user now"}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/users/register"
                className="mt-4 sm:mt-6 inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg sm:rounded-xl text-white font-medium text-sm sm:text-base"
              >
                <UserPlus size={18} className="sm:size-5" />
                Register New User
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}