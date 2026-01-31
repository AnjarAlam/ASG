import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { GroupChat, ChatUser, GroupState } from "@/schemas/chat";

type GroupStoreActions = {
  setGroups: (groups: GroupChat[]) => void;
  addGroup: (group: GroupChat) => void;
  setSelectedGroup: (group: GroupChat | null) => void;
  updateGroup: (groupId: string, group: Partial<GroupChat>) => void;
  deleteGroup: (groupId: string) => void;
  setMembers: (members: ChatUser[]) => void;
  addMember: (member: ChatUser) => void;
  removeMember: (userId: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useGroupStore = create<GroupState & GroupStoreActions>()(
  immer((set) => ({
    // Initial state
    groups: [],
    selectedGroup: null,
    members: [],
    loading: false,
    error: null,

    // Group actions
    setGroups: (groups) =>
      set((state) => {
        state.groups = groups;
      }),

    addGroup: (group) =>
      set((state) => {
        state.groups.push(group);
      }),

    setSelectedGroup: (group) =>
      set((state) => {
        state.selectedGroup = group;
      }),

    updateGroup: (groupId, updates) =>
      set((state) => {
        const group = state.groups.find((g) => g.id === groupId);
        if (group) {
          Object.assign(group, updates);
        }
        if (state.selectedGroup?.id === groupId) {
          state.selectedGroup = { ...state.selectedGroup, ...updates };
        }
      }),

    deleteGroup: (groupId) =>
      set((state) => {
        state.groups = state.groups.filter((g) => g.id !== groupId);
        if (state.selectedGroup?.id === groupId) {
          state.selectedGroup = null;
        }
      }),

    setMembers: (members) =>
      set((state) => {
        state.members = members;
      }),

    addMember: (member) =>
      set((state) => {
        const exists = state.members.find((m) => m.id === member.id);
        if (!exists) {
          state.members.push(member);
        }
      }),

    removeMember: (userId) =>
      set((state) => {
        state.members = state.members.filter((m) => m.id !== userId);
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.loading = loading;
      }),

    reset: () =>
      set(() => ({
        groups: [],
        selectedGroup: null,
        members: [],
        loading: false,
        error: null,
      })),
  }))
);
