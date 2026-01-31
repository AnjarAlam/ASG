"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { auditAPI } from "@/lib/services/chat-api";
import { ChatAuditLog, DeletionRules } from "@/schemas/chat";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function ChatAudit() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [auditLogs, setAuditLogs] = useState<ChatAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    action: "",
    startDate: "",
    endDate: "",
  });
  const [deletionRules, setDeletionRules] = useState<DeletionRules | null>(null);
  const [editingRules, setEditingRules] = useState(false);
  const [newRules, setNewRules] = useState<DeletionRules | null>(null);

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const logs = await auditAPI.getLogs(
        {
          action: filters.action || undefined,
          startDate: filters.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        },
        1,
        100
      );
      setAuditLogs(logs);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadDeletionRules = useCallback(async () => {
    try {
      const rules = await auditAPI.getDeletionRules();
      setDeletionRules(rules);
      setNewRules(rules);
    } catch (err) {
      console.error("Failed to load deletion rules:", err);
      setError("Failed to load deletion rules");
    }
  }, []);

  useEffect(() => {
    if (!user?._id) {
      router.push("/login");
      return;
    }

    if (user.role !== "Admin") {
      router.push("/dashboard/chat");
      return;
    }

    loadAuditLogs();
    loadDeletionRules();
  }, [user?._id, user?.role, router, loadAuditLogs, loadDeletionRules]);

  const handleExportHistory = async (format: "pdf" | "csv" = "pdf") => {
    try {
      setLoading(true);
      const blob = await auditAPI.exportHistory(undefined, undefined, format);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `chat-history-${new Date().toISOString().split("T")[0]}.${format}`;
      link.click();
    } catch (err) {
      console.error("Failed to export history:", err);
      setError("Failed to export history");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRules = async () => {
    if (!newRules) return;
    try {
      setLoading(true);
      await auditAPI.updateDeletionRules(newRules);
      setDeletionRules(newRules);
      setEditingRules(false);
    } catch (err) {
      console.error("Failed to update deletion rules:", err);
      setError("Failed to update deletion rules");
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      message_sent: "📤 Message Sent",
      message_deleted: "🗑️ Message Deleted",
      group_created: "👥 Group Created",
      member_added: "➕ Member Added",
      member_removed: "➖ Member Removed",
      file_shared: "📎 File Shared",
    };
    return labels[action] || action;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Chat Audit & Control</h1>
        <p className="text-gray-600">Monitor chat activities and manage message retention policies</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button className="px-4 py-2 font-semibold text-blue-500 border-b-2 border-blue-500">
          Audit Logs
        </button>
        <button className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700">
          Deletion Rules
        </button>
      </div>

      {/* Audit Logs Section */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Action Type
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="message_sent">Message Sent</option>
                <option value="message_deleted">Message Deleted</option>
                <option value="group_created">Group Created</option>
                <option value="member_added">Member Added</option>
                <option value="member_removed">Member Removed</option>
                <option value="file_shared">File Shared</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={loadAuditLogs}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Apply Filters"}
            </button>
            <button
              onClick={() => handleExportHistory("pdf")}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:bg-gray-400"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
            <button
              onClick={() => handleExportHistory("csv")}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:bg-gray-400"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No audit logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Performed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm">
                        {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold">
                        {getActionLabel(log.action)}
                      </td>
                      <td className="px-6 py-3 text-sm">{log.performedBy}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {log.affectedUsers?.join(", ") || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Deletion Rules Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Message Deletion Rules</h3>
          {!editingRules && (
            <button
              onClick={() => {
                setEditingRules(true);
                setNewRules(deletionRules);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Edit Rules
            </button>
          )}
        </div>

        {editingRules ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Retention Period (days)
              </label>
              <input
                type="number"
                min="0"
                value={newRules?.retentionDays || 0}
                onChange={(e) =>
                  setNewRules((prev: DeletionRules | null) => ({
                    ...prev,
                    retentionDays: parseInt(e.target.value),
                  } as DeletionRules))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0 for indefinite retention"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Can Delete Own Messages
              </label>
              <div className="flex gap-4">
                {(["Operator", "Supervisor", "Accounts", "Admin"] as const).map((role) => (
                  <label key={role} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newRules?.canDeleteOwnMessages?.includes(role) || false}
                      onChange={(e) => {
                        const roles = newRules?.canDeleteOwnMessages || [];
                        setNewRules((prev: DeletionRules | null) => ({
                          ...prev,
                          canDeleteOwnMessages: e.target.checked
                            ? [...roles, role]
                            : roles.filter((r: string) => r !== role),
                        } as DeletionRules));
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Can Delete Any Messages (Admin only)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newRules?.adminCanDeleteAny || false}
                  onChange={(e) =>
                    setNewRules((prev: DeletionRules | null) => ({
                      ...prev,
                      adminCanDeleteAny: e.target.checked,
                    } as DeletionRules))
                  }
                  className="rounded"
                />
                <span className="text-sm">Allow admin to delete any message</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditingRules(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRules}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save Rules"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Retention Period:</span>{" "}
              {deletionRules?.retentionDays === 0 || deletionRules?.retentionDays === undefined
                ? "Indefinite"
                : `${deletionRules?.retentionDays} days`}
            </p>
            <p>
              <span className="font-semibold">Delete Own Messages:</span>{" "}
              {deletionRules?.canDeleteOwnMessages?.join(", ") || "None"}
            </p>
            <p>
              <span className="font-semibold">Admin Can Delete Any:</span>{" "}
              {deletionRules?.adminCanDeleteAny ? "Yes" : "No"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
