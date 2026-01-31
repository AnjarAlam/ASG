// import { io, Socket } from "socket.io-client";
import {
  Message,
  TypingIndicator,
  OnlineStatus,
  MessageStatusPayload,
  SendMessagePayload,
  TypingPayload,
  ReadReceipt,
  ChatNotification,
  ChatUser,
  FileUploadResponse,
  GroupChat,
} from "@/schemas/chat";
import { useChatStore } from "@/store/chat-store";
import { useMessageStore } from "@/store/message-store";
import { useGroupStore } from "@/store/group-store";

type SocketEventHandler = (data: Record<string, string | number | boolean | null | object>) => void;

type GroupEventData = {
  groupId: string;
  member?: ChatUser;
  userId?: string;
  updates?: Record<string, string | number | boolean | null>;
};

type GroupCreateData = Omit<GroupChat, "id" | "messages" | "createdAt" | "updatedAt">;
type GroupUpdateData = Partial<Omit<GroupChat, "id" | "messages" | "createdAt" | "updatedAt">>;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  connect(url: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(url, {
          auth: {
            token,
          },
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 10000,
          reconnectionAttempts: this.maxReconnectAttempts,
          transports: ["websocket", "polling"],
        });

        this.socket.on("connect", () => {
          console.log("Socket connected:", this.socket?.id);
          this.reconnectAttempts = 0;
          useChatStore.setState({ socketConnected: true });
          this.setupEventListeners();
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          this.reconnectAttempts++;
          useChatStore.setState({ error: "Connection failed" });
          reject(error);
        });

        this.socket.on("disconnect", () => {
          console.log("Socket disconnected");
          useChatStore.setState({ socketConnected: false });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Message events
    this.socket.on("message_received", this.handleMessageReceived);
    this.socket.on("message_status_updated", this.handleMessageStatusUpdated);
    this.socket.on("message_deleted", this.handleMessageDeleted);

    // Typing indicators
    this.socket.on("user_typing", this.handleUserTyping);
    this.socket.on("user_stopped_typing", this.handleUserStoppedTyping);

    // Online status
    this.socket.on("user_online", this.handleUserOnline);
    this.socket.on("user_offline", this.handleUserOffline);
    this.socket.on("online_users_list", this.handleOnlineUsersList);

    // Read receipts
    this.socket.on("message_read", this.handleMessageRead);

    // Group events
    this.socket.on("group_member_added", this.handleGroupMemberAdded);
    this.socket.on("group_member_removed", this.handleGroupMemberRemoved);
    this.socket.on("group_updated", this.handleGroupUpdated);

    // Notifications
    this.socket.on("notification_received", this.handleNotification);

    // Error handling
    this.socket.on("error", this.handleError);
  }

  private handleMessageReceived = (data: Message): void => {
    const messageStore = useMessageStore.getState();
    const chatStore = useChatStore.getState();

    messageStore.addMessage(data);
    chatStore.addNotification({
      id: `notif_${data.id}`,
      userId: "",
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderName: data.senderId,
      message: "New message",
      messagePreview: data.content.substring(0, 50),
      type: "direct_message",
      isRead: false,
      createdAt: new Date(),
    });

    chatStore.incrementUnreadCount(data.conversationId);
  };

  private handleMessageStatusUpdated = (payload: MessageStatusPayload): void => {
    const messageStore = useMessageStore.getState();
    messageStore.updateMessage(payload.messageId, { status: payload.status });

    if (payload.status === "read") {
      const message = messageStore.messages.find((m) => m.id === payload.messageId);
      if (message && !message.readBy?.includes(payload.userId)) {
        messageStore.updateMessage(payload.messageId, {
          readBy: [...(message.readBy || []), payload.userId],
        });
      }
    }
  };

  private handleMessageDeleted = (messageId: string): void => {
    const messageStore = useMessageStore.getState();
    messageStore.deleteMessage(messageId);
  };

  private handleUserTyping = (data: TypingIndicator): void => {
    useChatStore.getState().setTypingIndicator(data);
  };

  private handleUserStoppedTyping = (data: { conversationId: string; userId: string }): void => {
    useChatStore.getState().removeTypingIndicator(data.conversationId, data.userId);
  };

  private handleUserOnline = (data: OnlineStatus): void => {
    useChatStore.getState().setOnlineStatus(data);
  };

  private handleUserOffline = (data: OnlineStatus): void => {
    useChatStore.getState().setOnlineStatus(data);
  };

  private handleOnlineUsersList = (users: OnlineStatus[]): void => {
    useChatStore.getState().setMultipleOnlineStatus(users);
  };

  private handleMessageRead = (data: ReadReceipt): void => {
    const messageStore = useMessageStore.getState();
    const message = messageStore.messages.find((m) => m.id === data.messageId);
    if (message) {
      const readBy = [...(message.readBy || [])];
      if (!readBy.includes(data.userId)) {
        readBy.push(data.userId);
        messageStore.updateMessage(data.messageId, {
          readBy,
          status: "read",
        });
      }
    }
  };

  private handleGroupMemberAdded = (data: GroupEventData): void => {
    const groupStore = useGroupStore.getState();
    if (groupStore.selectedGroup?.id === data.groupId && data.member) {
      groupStore.addMember(data.member);
    }
  };

  private handleGroupMemberRemoved = (data: GroupEventData): void => {
    const groupStore = useGroupStore.getState();
    if (groupStore.selectedGroup?.id === data.groupId && data.userId) {
      groupStore.removeMember(data.userId);
    }
  };

  private handleGroupUpdated = (data: GroupEventData): void => {
    const groupStore = useGroupStore.getState();
    if (data.updates) {
      groupStore.updateGroup(data.groupId, data.updates);
    }
  };

  private handleNotification = (data: ChatNotification): void => {
    useChatStore.getState().addNotification(data);
  };

  private handleError = (error: { message?: string }): void => {
    console.error("Socket error:", error);
    useChatStore.getState().setError(error.message || "Socket error occurred");
  };

  // Emit methods
  sendMessage(payload: SendMessagePayload): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }
    this.socket.emit("send_message", payload);
  }

  updateMessageStatus(messageId: string, status: string): void {
    if (!this.socket) return;
    this.socket.emit("update_message_status", { messageId, status });
  }

  markMessageAsRead(messageId: string, conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit("mark_as_read", { messageId, conversationId });
  }

  sendTypingIndicator(payload: TypingPayload): void {
    if (!this.socket) return;
    this.socket.emit("typing", payload);
  }

  deleteMessage(messageId: string, conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit("delete_message", { messageId, conversationId });
  }

  uploadFile(file: File, conversationId: string): Promise<FileUploadResponse> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (!this.socket) {
          reject(new Error("Socket not connected"));
          return;
        }
        this.socket.emit("file_upload", {
          file: reader.result,
          filename: file.name,
          type: file.type,
          conversationId,
        });

        const timeout = setTimeout(() => {
          reject(new Error("File upload timeout"));
        }, 30000);

        this.socket.once("file_upload_response", (data: FileUploadResponse | { error: string }) => {
          clearTimeout(timeout);
          if ("error" in data) {
            reject(new Error(data.error));
          } else {
            resolve(data);
          }
        });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  joinConversation(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit("join_conversation", { conversationId });
  }

  leaveConversation(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit("leave_conversation", { conversationId });
  }

  joinGroup(groupId: string): void {
    if (!this.socket) return;
    this.socket.emit("join_group", { groupId });
  }

  leaveGroup(groupId: string): void {
    if (!this.socket) return;
    this.socket.emit("leave_group", { groupId });
  }

  createGroup(groupData: GroupCreateData): void {
    if (!this.socket) return;
    this.socket.emit("create_group", groupData);
  }

  addGroupMember(groupId: string, userId: string): void {
    if (!this.socket) return;
    this.socket.emit("add_group_member", { groupId, userId });
  }

  removeGroupMember(groupId: string, userId: string): void {
    if (!this.socket) return;
    this.socket.emit("remove_group_member", { groupId, userId });
  }

  updateGroupInfo(groupId: string, updates: GroupUpdateData): void {
    if (!this.socket) return;
    this.socket.emit("update_group_info", { groupId, ...updates });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  on(event: string, handler: SocketEventHandler): void {
    if (!this.socket) return;
    this.socket.on(event, handler);
  }

  off(event: string, handler?: SocketEventHandler): void {
    if (!this.socket) return;
    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
