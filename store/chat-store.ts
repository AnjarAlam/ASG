import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  Message,
  Conversation,
  TypingIndicator,
  OnlineStatus,
  ChatNotification,
  ContextualLink,
  ChatState,
} from "@/schemas/chat";

type ChatStoreActions = {
  // Conversation actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  updateConversation: (conversationId: string, conversation: Partial<Conversation>) => void;

  // Message actions
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  updateMessageStatus: (messageId: string, status: Message["status"]) => void;
  deleteMessage: (messageId: string) => void;

  // Typing indicator actions
  setTypingIndicator: (indicator: TypingIndicator) => void;
  removeTypingIndicator: (conversationId: string, userId: string) => void;

  // Online status actions
  setOnlineStatus: (status: OnlineStatus) => void;
  setMultipleOnlineStatus: (statuses: OnlineStatus[]) => void;

  // Notification actions
  addNotification: (notification: ChatNotification) => void;
  removeNotification: (notificationId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  incrementUnreadCount: (conversationId: string) => void;

  // Contextual link actions
  addContextualLink: (link: ContextualLink) => void;
  removeContextualLink: (linkId: string) => void;

  // Socket connection
  setSocketConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState & ChatStoreActions>()(
  immer((set) => ({
    // Initial state
    conversations: [],
    currentConversation: null,
    groups: [],
    currentGroup: null,
    messages: [],
    typingIndicators: [],
    onlineUsers: [],
    notifications: [],
    contextualLinks: [],
    loading: false,
    error: null,
    socketConnected: false,

    // Conversation actions
    setConversations: (conversations) =>
      set((state) => {
        state.conversations = conversations;
      }),

    addConversation: (conversation) =>
      set((state) => {
        const exists = state.conversations.find((c) => c.id === conversation.id);
        if (!exists) {
          state.conversations.unshift(conversation);
        }
      }),

    setCurrentConversation: (conversation) =>
      set((state) => {
        state.currentConversation = conversation;
      }),

    updateConversation: (conversationId, updates) =>
      set((state) => {
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          Object.assign(conv, updates);
        }
        if (state.currentConversation?.id === conversationId) {
          state.currentConversation = { ...state.currentConversation, ...updates };
        }
      }),

    // Message actions
    addMessage: (message) =>
      set((state) => {
        state.messages.push(message);
        if (state.currentConversation?.id === message.conversationId) {
          state.currentConversation.messages.push(message);
          state.currentConversation.lastMessage = message;
        }
      }),

    setMessages: (messages) =>
      set((state) => {
        state.messages = messages;
      }),

    updateMessageStatus: (messageId, status) =>
      set((state) => {
        const msg = state.messages.find((m) => m.id === messageId);
        if (msg) {
          msg.status = status;
        }
      }),

    deleteMessage: (messageId) =>
      set((state) => {
        state.messages = state.messages.filter((m) => m.id !== messageId);
      }),

    // Typing indicator actions
    setTypingIndicator: (indicator) =>
      set((state) => {
        const exists = state.typingIndicators.find(
          (t) => t.conversationId === indicator.conversationId && t.userId === indicator.userId
        );
        if (!exists) {
          state.typingIndicators.push(indicator);
        }
      }),

    removeTypingIndicator: (conversationId, userId) =>
      set((state) => {
        state.typingIndicators = state.typingIndicators.filter(
          (t) => !(t.conversationId === conversationId && t.userId === userId)
        );
      }),

    // Online status actions
    setOnlineStatus: (status) =>
      set((state) => {
        const existingIdx = state.onlineUsers.findIndex((u) => u.userId === status.userId);
        if (existingIdx !== -1) {
          state.onlineUsers[existingIdx] = status;
        } else {
          state.onlineUsers.push(status);
        }
      }),

    setMultipleOnlineStatus: (statuses) =>
      set((state) => {
        state.onlineUsers = statuses;
      }),

    // Notification actions
    addNotification: (notification) =>
      set((state) => {
        state.notifications.unshift(notification);
      }),

    removeNotification: (notificationId) =>
      set((state) => {
        state.notifications = state.notifications.filter((n) => n.id !== notificationId);
      }),

    markNotificationRead: (notificationId) =>
      set((state) => {
        const notif = state.notifications.find((n) => n.id === notificationId);
        if (notif) {
          notif.isRead = true;
        }
      }),

    incrementUnreadCount: (conversationId) =>
      set((state) => {
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      }),

    // Contextual link actions
    addContextualLink: (link) =>
      set((state) => {
        state.contextualLinks.push(link);
      }),

    removeContextualLink: (linkId) =>
      set((state) => {
        state.contextualLinks = state.contextualLinks.filter((l) => l.id !== linkId);
      }),

    // Connection status
    setSocketConnected: (connected) =>
      set((state) => {
        state.socketConnected = connected;
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
        conversations: [],
        currentConversation: null,
        groups: [],
        currentGroup: null,
        messages: [],
        typingIndicators: [],
        onlineUsers: [],
        notifications: [],
        contextualLinks: [],
        loading: false,
        error: null,
        socketConnected: false,
      })),
  }))
);
