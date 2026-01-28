"use client";

import { useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight, Users, ShieldCheck } from "lucide-react";
import dayjs from "dayjs";

interface User {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: string;
  status: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const fetchUsers = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://192.168.1.24:8000/user-auth?limit=${limit}&page=${page}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      if (data.message !== "User Details fetched successfully") {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users || []);
      setMeta(data.meta || null);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!meta || newPage <= meta.totalPages)) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Users Management</h1>
              <p className="text-gray-400 mt-2">View and manage all registered users</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {/* Table Header */}
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Users</h2>
            <div className="text-sm text-gray-400">
              {meta ? `${meta.total} users found` : "Loading..."}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
              <p className="text-gray-400">Fetching users...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-12 text-center text-red-400">
              <p className="text-xl mb-2">Error loading users</p>
              <p>{error}</p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              {users.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Mobile</th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Role</th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Permissions</th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                          <td className="px-6 py-4 text-gray-300">{u.email}</td>
                          <td className="px-6 py-4 text-gray-300">{u.mobileNumber}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex px-3 py-1 bg-indigo-900/40 text-indigo-300 rounded-full text-sm font-medium border border-indigo-700/40">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                              u.status === "active"
                                ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/40"
                                : "bg-red-900/40 text-red-300 border border-red-700/40"
                            }`}>
                              {u.status?.toUpperCase() || "UNKNOWN"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.permissions?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {u.permissions.map((perm) => (
                                  <span
                                    key={perm}
                                    className="px-3 py-1 bg-indigo-950/50 border border-indigo-700/40 rounded-lg text-xs text-indigo-300"
                                  >
                                    {perm}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-400 text-sm">
                            {dayjs(u.createdAt).format("DD MMM YYYY")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="p-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                  <div>
                    Showing {(meta.page - 1) * meta.limit + 1}–
                    {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(meta.page - 1)}
                      disabled={meta.page === 1}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === meta.totalPages ||
                          (p >= meta.page - 2 && p <= meta.page + 2)
                      )
                      .map((p, idx, arr) => (
                        <div key={p} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`w-8 h-8 rounded-lg font-medium ${
                              p === meta.page
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      ))}

                    <button
                      onClick={() => handlePageChange(meta.page + 1)}
                      disabled={meta.page === meta.totalPages}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}