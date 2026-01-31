"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useGroupStore } from "@/store/group-store";
import { groupAPI, userAPI } from "@/lib/services/chat-api";
import { ChatUser, GroupChat } from "@/schemas/chat";
import { X, Plus, Trash2, Edit2 } from "lucide-react";

export default function GroupManagement() {
  const router = useRouter();
  const { user } = useAuthStore();
  const groupStore = useGroupStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: "department" | "custom" | "operational";
    memberIds: string[];
  }>({
    name: "",
    description: "",
    type: "custom",
    memberIds: [],
  });

  useEffect(() => {
    if (!user?._id) {
      router.push("/login");
      return;
    }

    if (user.role !== "Admin") {
      router.push("/dashboard/chat");
      return;
    }

    const loadGroups = async () => {
      try {
        groupStore.setLoading(true);
        const groups = await groupAPI.getAll(1, 50);
        groupStore.setGroups(groups);
      } catch (error) {
        console.error("Failed to load groups:", error);
        groupStore.setError("Failed to load groups");
      } finally {
        groupStore.setLoading(false);
      }
    };

    const loadAvailableUsers = async () => {
      try {
        const users = await userAPI.getAll();
        setAvailableUsers(users.filter((u) => u.id !== user?._id));
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    loadGroups();
    loadAvailableUsers();
  }, [user?._id, user?.role, router, groupStore]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Group name is required");
      return;
    }

    try {
      groupStore.setLoading(true);
      const newGroup = await groupAPI.create({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        memberIds: formData.memberIds,
      });
      groupStore.addGroup(newGroup);
      setFormData({ name: "", description: "", type: "custom", memberIds: [] });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      groupStore.setError("Failed to create group");
    } finally {
      groupStore.setLoading(false);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroup) return;

    try {
      groupStore.setLoading(true);
      const updated = await groupAPI.update(selectedGroup.id, {
        name: formData.name,
        description: formData.description,
      });
      groupStore.updateGroup(selectedGroup.id, updated);
      setShowEditModal(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error("Failed to update group:", error);
      groupStore.setError("Failed to update group");
    } finally {
      groupStore.setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    try {
      groupStore.setLoading(true);
      await groupAPI.delete(groupId);
      groupStore.deleteGroup(groupId);
    } catch (error) {
      console.error("Failed to delete group:", error);
      groupStore.setError("Failed to delete group");
    } finally {
      groupStore.setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({ name: "", description: "", type: "custom", memberIds: [] });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (group: GroupChat) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      type: group.type,
      memberIds: group.members.map((m) => m.id),
    });
    setShowEditModal(true);
  };

  const toggleMember = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId],
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Group Management</h1>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Plus className="h-5 w-5" />
          Create Group
        </button>
      </div>

      {groupStore.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {groupStore.error}
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupStore.groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{group.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{group.type} • {group.members.length} members</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEditModal(group)}
                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {group.description && (
              <p className="text-sm text-gray-600 mb-3">{group.description}</p>
            )}

            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Members:</p>
              <div className="flex flex-wrap gap-1">
                {group.members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    {member.name}
                  </div>
                ))}
                {group.members.length > 5 && (
                  <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    +{group.members.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {groupStore.groups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No groups yet. Create one to get started!</p>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create New Group</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Operators Team"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Optional group description..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Group Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as "department" | "custom" | "operational",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="custom">Custom</option>
                  <option value="department">Department</option>
                  <option value="operational">Operational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Members
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                  {availableUsers.map((u) => (
                    <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.memberIds.includes(u.id)}
                        onChange={() => toggleMember(u.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{u.name}</span>
                      <span className="text-xs text-gray-500">({u.role})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={groupStore.loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold disabled:bg-gray-400"
                >
                  {groupStore.loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Group</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={groupStore.loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold disabled:bg-gray-400"
                >
                  {groupStore.loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
