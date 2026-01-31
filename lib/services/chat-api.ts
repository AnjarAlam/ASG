import axiosInstance from "@/lib/axios";
import {
  Message,
  Conversation,
  GroupChat,
  ChatUser,
  FileUploadResponse,
  PaginatedMessages,
  ContextualLink,
  ChatNotification,
  ChatAuditLog,
  DeletionRules,
  OnlineStatus,
} from "@/schemas/chat";

const BASE_URL = "/api/chat";

// ==================== Conversations ====================
export const conversationAPI = {
  // Get all conversations for current user
  getAll: async (page = 1, limit = 20): Promise<Conversation[]> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/conversations`, {
      params: { page, limit },
    });
    return data;
  },

  // Get single conversation
  getById: async (conversationId: string): Promise<Conversation> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/conversations/${conversationId}`);
    return data;
  },

  // Get or create 1-to-1 conversation
  getOrCreateWithUser: async (userId: string): Promise<Conversation> => {
    const { data } = await axiosInstance.post(`${BASE_URL}/conversations/with-user`, {
      userId,
    });
    return data;
  },

  // Search conversations
  search: async (query: string): Promise<Conversation[]> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/conversations/search`, {
      params: { q: query },
    });
    return data;
  },

  // Get conversation members
  getMembers: async (conversationId: string): Promise<ChatUser[]> => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/conversations/${conversationId}/members`
    );
    return data;
  },
};

// ==================== Messages ====================
export const messageAPI = {
  // Get messages for a conversation (paginated)
  getConversationMessages: async (
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedMessages> => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/conversations/${conversationId}/messages`,
      {
        params: { page, limit },
      }
    );
    return data;
  },

  // Get messages for a group (paginated)
  getGroupMessages: async (
    groupId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedMessages> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/groups/${groupId}/messages`, {
      params: { page, limit },
    });
    return data;
  },

  // Get single message
  getById: async (messageId: string): Promise<Message> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/messages/${messageId}`);
    return data;
  },

  // Delete message (Admin or sender only)
  delete: async (messageId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/messages/${messageId}`);
  },

  // Mark as read
  markAsRead: async (messageId: string): Promise<void> => {
    await axiosInstance.patch(`${BASE_URL}/messages/${messageId}/read`);
  },

  // Search messages
  search: async (
    conversationId: string | null,
    query: string,
    limit = 50
  ): Promise<Message[]> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/messages/search`, {
      params: { conversationId, q: query, limit },
    });
    return data;
  },
};

// ==================== Groups ====================
export const groupAPI = {
  // Get all groups for current user
  getAll: async (page = 1, limit = 20): Promise<GroupChat[]> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/groups`, {
      params: { page, limit },
    });
    return data;
  },

  // Get single group
  getById: async (groupId: string): Promise<GroupChat> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/groups/${groupId}`);
    return data;
  },

  // Create group (Admin only)
  create: async (groupData: {
    name: string;
    description?: string;
    type: "department" | "custom" | "operational";
    memberIds?: string[];
  }): Promise<GroupChat> => {
    const { data } = await axiosInstance.post(`${BASE_URL}/groups`, groupData);
    return data;
  },

  // Update group (Admin only)
  update: async (groupId: string, updates: Partial<GroupChat>): Promise<GroupChat> => {
    const { data } = await axiosInstance.patch(`${BASE_URL}/groups/${groupId}`, updates);
    return data;
  },

  // Delete group (Admin only)
  delete: async (groupId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/groups/${groupId}`);
  },

  // Get group members
  getMembers: async (groupId: string): Promise<ChatUser[]> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/groups/${groupId}/members`);
    return data;
  },

  // Add member to group
  addMember: async (groupId: string, userId: string): Promise<ChatUser> => {
    const { data } = await axiosInstance.post(`${BASE_URL}/groups/${groupId}/members`, {
      userId,
    });
    return data;
  },

  // Remove member from group
  removeMember: async (groupId: string, userId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/groups/${groupId}/members/${userId}`);
  },

  // Leave group
  leave: async (groupId: string): Promise<void> => {
    await axiosInstance.post(`${BASE_URL}/groups/${groupId}/leave`);
  },

  // Search groups
  search: async (query: string): Promise<GroupChat[]> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/groups/search`, {
      params: { q: query },
    });
    return data;
  },
};

// ==================== File Upload ====================
export const fileAPI = {
  // Upload file
  upload: async (file: File, conversationId?: string, groupId?: string): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (conversationId) {
      formData.append("conversationId", conversationId);
    }
    if (groupId) {
      formData.append("groupId", groupId);
    }

    const { data } = await axiosInstance.post(`${BASE_URL}/files/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  // Get file
  getFile: async (fileId: string): Promise<Blob> => {
    const response = await axiosInstance.get(`${BASE_URL}/files/${fileId}`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/files/${fileId}`);
  },
};

// ==================== Contextual Links ====================
export const contextualLinkAPI = {
  // Get links for a conversation
  getConversationLinks: async (conversationId: string): Promise<ContextualLink[]> => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/conversations/${conversationId}/links`
    );
    return data;
  },

  // Get links for a group
  getGroupLinks: async (groupId: string): Promise<ContextualLink[]> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/groups/${groupId}/links`);
    return data;
  },

  // Create link
  create: async (link: Omit<ContextualLink, "id" | "createdAt">): Promise<ContextualLink> => {
    const { data } = await axiosInstance.post(`${BASE_URL}/links`, link);
    return data;
  },

  // Delete link
  delete: async (linkId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/links/${linkId}`);
  },

  // Get entity links (get all chats linked to an entity)
  getEntityLinks: async (
    entityType: string,
    entityId: string
  ): Promise<ContextualLink[]> => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/links/entity/${entityType}/${entityId}`
    );
    return data;
  },
};

// ==================== Notifications ====================
export const notificationAPI = {
  // Get notifications
  getAll: async (page = 1, limit = 20): Promise<ChatNotification[]> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/notifications`, {
      params: { page, limit },
    });
    return data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await axiosInstance.patch(`${BASE_URL}/notifications/${notificationId}/read`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch(`${BASE_URL}/notifications/read-all`);
  },

  // Delete notification
  delete: async (notificationId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/notifications/${notificationId}`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/notifications/unread-count`);
    return data.count;
  },
};

// ==================== Audit & Control ====================
export const auditAPI = {
  // Get audit logs (Admin only)
  getLogs: async (
    filters?: {
      conversationId?: string;
      groupId?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page = 1,
    limit = 50
  ): Promise<ChatAuditLog[]> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/audit/logs`, {
      params: { ...filters, page, limit },
    });
    return data;
  },

  // Get message deletion logs (Admin only)
  getDeletionLogs: async (messageId: string): Promise<ChatAuditLog[]> => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/audit/logs/message/${messageId}`
    );
    return data;
  },

  // Export chat history (Admin only)
  exportHistory: async (
    conversationId?: string,
    groupId?: string,
    format = "pdf"
  ): Promise<Blob> => {
    const response = await axiosInstance.get(`${BASE_URL}/audit/export`, {
      params: { conversationId, groupId, format },
      responseType: "blob",
    });
    return response.data;
  },

  // Get message deletion rules (Admin only)
  getDeletionRules: async (): Promise<DeletionRules> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/audit/deletion-rules`);
    return data;
  },

  // Update message deletion rules (Admin only)
  updateDeletionRules: async (rules: DeletionRules): Promise<void> => {
    await axiosInstance.patch(`${BASE_URL}/audit/deletion-rules`, rules);
  },
};

// ==================== Users ====================
export const userAPI = {
  // Get all users (for mentions and group creation)
  getAll: async (filters?: {
    role?: string;
    department?: string;
    searchTerm?: string;
  }): Promise<ChatUser[]> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/users`, {
      params: filters,
    });
    return data;
  },

  // Get user by ID
  getById: async (userId: string): Promise<ChatUser> => {
    const { data } = await axiosInstance.get(`${BASE_URL}/users/${userId}`);
    return data;
  },

  // Get online status of users
  getOnlineStatus: async (userIds: string[]): Promise<OnlineStatus[]> => {
    const { data } = await axiosInstance.post(`${BASE_URL}/users/online-status`, {
      userIds,
    });
    return data;
  },
};
