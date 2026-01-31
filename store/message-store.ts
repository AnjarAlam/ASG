import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Message, MessageAttachment, MessageState } from "@/schemas/chat";

type MessageStoreActions = {
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, message: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  prependMessages: (messages: Message[]) => void;
  appendMessages: (messages: Message[]) => void;
  setAttachments: (attachments: MessageAttachment[]) => void;
  addAttachment: (attachment: MessageAttachment) => void;
  removeAttachment: (attachmentId: string) => void;
  setCurrentMessageId: (messageId: string | null) => void;
  setUnreadCount: (conversationId: string, count: number) => void;
  incrementUnreadCount: (conversationId: string) => void;
  clearUnreadCount: (conversationId: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useMessageStore = create<MessageState & MessageStoreActions>()(
  immer((set) => ({
    // Initial state
    messages: [],
    attachments: [],
    currentMessageId: null,
    loading: false,
    error: null,
    unreadCounts: {},

    // Message actions
    setMessages: (messages) =>
      set((state) => {
        state.messages = messages;
      }),

    addMessage: (message) =>
      set((state) => {
        const exists = state.messages.find((m) => m.id === message.id);
        if (!exists) {
          state.messages.push(message);
        }
      }),

    updateMessage: (messageId, updates) =>
      set((state) => {
        const msg = state.messages.find((m) => m.id === messageId);
        if (msg) {
          Object.assign(msg, updates);
        }
      }),

    deleteMessage: (messageId) =>
      set((state) => {
        state.messages = state.messages.filter((m) => m.id !== messageId);
      }),

    prependMessages: (messages) =>
      set((state) => {
        state.messages = [...messages, ...state.messages];
      }),

    appendMessages: (messages) =>
      set((state) => {
        state.messages = [...state.messages, ...messages];
      }),

    // Attachment actions
    setAttachments: (attachments) =>
      set((state) => {
        state.attachments = attachments;
      }),

    addAttachment: (attachment) =>
      set((state) => {
        const exists = state.attachments.find((a) => a.id === attachment.id);
        if (!exists) {
          state.attachments.push(attachment);
        }
      }),

    removeAttachment: (attachmentId) =>
      set((state) => {
        state.attachments = state.attachments.filter((a) => a.id !== attachmentId);
      }),

    setCurrentMessageId: (messageId) =>
      set((state) => {
        state.currentMessageId = messageId;
      }),

    // Unread count actions
    setUnreadCount: (conversationId, count) =>
      set((state) => {
        state.unreadCounts[conversationId] = count;
      }),

    incrementUnreadCount: (conversationId) =>
      set((state) => {
        state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
      }),

    clearUnreadCount: (conversationId) =>
      set((state) => {
        state.unreadCounts[conversationId] = 0;
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
        messages: [],
        attachments: [],
        currentMessageId: null,
        loading: false,
        error: null,
        unreadCounts: {},
      })),
  }))
);
