// Types and interfaces for Chat Module

export type UserRole = "Admin" | "Operator" | "Supervisor" | "Accounts";

export type MessageType = "text" | "image" | "document" | "system";

export type MessageStatus = "sent" | "delivered" | "read";

export type FileType = "image/jpeg" | "image/png" | "application/pdf" | "image/gif";

// User entity
export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

// Message attachment (files, images, etc)
export interface MessageAttachment {
  id: string;
  url: string;
  type: FileType;
  name: string;
  size: number;
  uploadedAt: Date;
}

// Individual message
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  status: MessageStatus;
  attachments?: MessageAttachment[];
  createdAt: Date;
  updatedAt?: Date;
  readBy?: string[]; // For group chats - array of user IDs who read
}

// 1-to-1 Conversation
export interface Conversation {
  id: string;
  participantIds: string[]; // Only 2 participants
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Group Chat
export interface GroupChat {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: ChatUser[];
  admin: string; // User ID of creator/admin
  type: "department" | "custom" | "operational"; // operators, supervisors, accounts, etc.
  messages: Message[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
  permissions: GroupPermissions;
}

// Group permissions based on role
export interface GroupPermissions {
  canAddMembers: UserRole[];
  canRemoveMembers: UserRole[];
  canDeleteMessages: UserRole[];
  canEditGroup: UserRole[];
  canAccessAudit: UserRole[];
}

// Typing indicator
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

// Online status
export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}

// Read receipt
export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: Date;
}

// Contextual Link (for linking chats to other entities)
export interface ContextualLink {
  id: string;
  conversationId: string;
  entityType: "vehicle" | "inward" | "outward" | "area_issue" | "stock_issue";
  entityId: string;
  entityName: string;
  createdAt: Date;
}

// Notification
export interface ChatNotification {
  id: string;
  userId: string;
  conversationId?: string;
  groupId?: string;
  senderId: string;
  senderName: string;
  message: string;
  messagePreview: string;
  type: "direct_message" | "group_message" | "group_invite";
  isRead: boolean;
  createdAt: Date;
}

// Audit Log
export interface ChatAuditLog {
  id: string;
  conversationId?: string;
  groupId?: string;
  messageId?: string;
  action: "message_sent" | "message_deleted" | "group_created" | "member_added" | "member_removed" | "file_shared";
  performedBy: string;
  affectedUsers?: string[];
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: Date;
}

// File upload response
export interface FileUploadResponse {
  id: string;
  url: string;
  type: FileType;
  name: string;
  size: number;
}

// Chat API Response Types
export interface PaginatedMessages {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Redux State slices
export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  groups: GroupChat[];
  currentGroup: GroupChat | null;
  messages: Message[];
  typingIndicators: TypingIndicator[];
  onlineUsers: OnlineStatus[];
  notifications: ChatNotification[];
  contextualLinks: ContextualLink[];
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
}

export interface GroupState {
  groups: GroupChat[];
  selectedGroup: GroupChat | null;
  members: ChatUser[];
  loading: boolean;
  error: string | null;
}

export interface MessageState {
  messages: Message[];
  attachments: MessageAttachment[];
  currentMessageId: string | null;
  loading: boolean;
  error: string | null;
  unreadCounts: Record<string, number>; // conversationId -> count
}

// WebSocket Event Types
export interface WebSocketMessage {
  type: string;
  payload: SendMessagePayload | TypingPayload | MessageStatusPayload | Record<string, string | number | boolean | null>;
  timestamp: Date;
}

export interface SendMessagePayload {
  conversationId?: string;
  groupId?: string;
  content: string;
  messageType: MessageType;
  attachments?: MessageAttachment[];
}

export interface TypingPayload {
  conversationId?: string;
  groupId?: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface MessageStatusPayload {
  messageId: string;
  status: MessageStatus;
  userId: string;
  readAt?: Date;
}

// Deletion rules for audit and message management
export interface DeletionRules {
  id?: string;
  retentionDays: number; // 0 for indefinite
  canDeleteOwnMessages: UserRole[];
  adminCanDeleteAny: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
