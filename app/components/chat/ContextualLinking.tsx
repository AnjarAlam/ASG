"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ContextualLink } from "@/schemas/chat";
import { contextualLinkAPI } from "@/lib/services/chat-api";
import { Link as LinkIcon, X, Plus, Loader2 } from "lucide-react";

interface ContextualLinkingProps {
  conversationId?: string;
  groupId?: string;
  onLinksChange?: (links: ContextualLink[]) => void;
}

export default function ContextualLinking({
  conversationId,
  groupId,
  onLinksChange,
}: ContextualLinkingProps) {
  const [links, setLinks] = useState<ContextualLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<{
    entityType: "vehicle" | "inward" | "outward" | "area_issue" | "stock_issue";
    entityId: string;
    entityName: string;
  }>({
    entityType: "vehicle",
    entityId: "",
    entityName: "",
  });

  const loadLinks = useCallback(async () => {
    try {
      setLoading(true);
      let loadedLinks: ContextualLink[] = [];
      if (conversationId) {
        loadedLinks = await contextualLinkAPI.getConversationLinks(conversationId);
      } else if (groupId) {
        loadedLinks = await contextualLinkAPI.getGroupLinks(groupId);
      }
      setLinks(loadedLinks);
      onLinksChange?.(loadedLinks);
    } catch (error) {
      console.error("Failed to load contextual links:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, groupId, onLinksChange]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.entityId || !formData.entityName) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const newLink = await contextualLinkAPI.create({
        conversationId: conversationId || "",
        entityType: formData.entityType,
        entityId: formData.entityId,
        entityName: formData.entityName,
      });

      setLinks((prev) => [...prev, newLink]);
      onLinksChange?.([...links, newLink]);
      setFormData({ entityType: "vehicle", entityId: "", entityName: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add contextual link:", error);
      alert("Failed to add link");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm("Remove this link?")) return;

    try {
      setLoading(true);
      await contextualLinkAPI.delete(linkId);
      const updated = links.filter((l) => l.id !== linkId);
      setLinks(updated);
      onLinksChange?.(updated);
    } catch (error) {
      console.error("Failed to delete link:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (type: string) => {
    const icons: Record<string, string> = {
      vehicle: "🚗",
      inward: "📥",
      outward: "📤",
      area_issue: "⚠️",
      stock_issue: "📦",
    };
    return icons[type] || "📎";
  };

  const getEntityLabel = (type: string) => {
    const labels: Record<string, string> = {
      vehicle: "Vehicle",
      inward: "Inward Entry",
      outward: "Outward Entry",
      area_issue: "Area Issue",
      stock_issue: "Stock Issue",
    };
    return labels[type] || type;
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Linked Records</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
          className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400"
        >
          <Plus className="h-3 w-3" />
          Add Link
        </button>
      </div>

      {/* Add Link Form */}
      {showAddForm && (
        <form onSubmit={handleAddLink} className="mb-3 p-3 bg-blue-50 rounded-lg space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <select
              value={formData.entityType}
              onChange={(e) => {
                const newType = e.target.value as "vehicle" | "inward" | "outward" | "area_issue" | "stock_issue";
                setFormData((prev) => ({
                  ...prev,
                  entityType: newType,
                }));
              }}
              className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vehicle">Vehicle</option>
              <option value="inward">Inward Entry</option>
              <option value="outward">Outward Entry</option>
              <option value="area_issue">Area Issue</option>
              <option value="stock_issue">Stock Issue</option>
            </select>

            <input
              type="text"
              placeholder="Entity ID"
              value={formData.entityId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, entityId: e.target.value }))
              }
              className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Entity Name"
              value={formData.entityName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, entityName: e.target.value }))
              }
              className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400"
            >
              {loading ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Links List */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        </div>
      ) : links.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4">
          {showAddForm ? "Add the first link" : "No linked records yet"}
        </p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg">{getEntityIcon(link.entityType)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {link.entityName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getEntityLabel(link.entityType)} • ID: {link.entityId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteLink(link.id)}
                disabled={loading}
                className="shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition disabled:opacity-50"
                title="Remove link"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
