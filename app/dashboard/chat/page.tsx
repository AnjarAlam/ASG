"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/chat-store";
import { useMessageStore } from "@/store/message-store";
import { useGroupStore } from "@/store/group-store";
import { useAuthStore } from "@/store/auth-store";
import { socketService } from "@/lib/services/socket";
import { conversationAPI, messageAPI, groupAPI } from "@/lib/services/chat-api";
import ChatList from "@/app/components/chat/ChatList";
import MessageComponent from "@/app/components/chat/Message";
import MessageInput from "@/app/components/chat/MessageInput";
import Notifications from "@/app/components/chat/Notifications";
import TypingIndicator from "@/app/components/chat/TypingIndicator";
import OnlineIndicator from "@/app/components/chat/OnlineIndicator";
import { MessageAttachment } from "@/schemas/chat";
import { Phone, Video, MoreVertical, ChevronLeft } from "lucide-react";

export default function Chat() {
  const router = useRouter();
  const { user } = useAuthStore();
  const chatStore = useChatStore();
  const messageStore = useMessageStore();
  const groupStore = useGroupStore();

  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection and load chats
  useEffect(() => {
    const userId = user?._id;
    if (!userId) {
      router.push("/login");
      return;
    }

    const loadConversations = async () => {
      try {
        const conversations = await conversationAPI.getAll(1, 50);
        chatStore.setConversations(conversations);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };

    const loadGroups = async () => {
      try {
        const groups = await groupAPI.getAll(1, 50);
        groupStore.setGroups(groups);
      } catch (error) {
        console.error("Failed to load groups:", error);
      }
    };

    const initializeChat = async () => {
      try {
        // Connect to socket
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("token");
        
        if (token) {
          await socketService.connect(apiUrl, token);
        }

        // Load conversations and groups
        await Promise.all([
          loadConversations(),
          loadGroups(),
        ]);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        chatStore.setError("Failed to connect to chat service");
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [user?._id, router, chatStore, groupStore]);

  // Handle mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageStore.messages]);

  const handleSelectConversation = async (conversationId: string) => {
    try {
      setMessageLoading(true);
      const conversation = await conversationAPI.getById(conversationId);
      const messages = await messageAPI.getConversationMessages(conversationId, 1, 50);
      
      chatStore.setCurrentConversation(conversation);
      messageStore.setMessages(messages.messages);
      messageStore.clearUnreadCount(conversationId);

      socketService.joinConversation(conversationId);

      if (isMobile) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
      chatStore.setError("Failed to load conversation");
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSelectGroup = async (groupId: string) => {
    try {
      setMessageLoading(true);
      const group = await groupAPI.getById(groupId);
      const messages = await messageAPI.getGroupMessages(groupId, 1, 50);
      
      groupStore.setSelectedGroup(group);
      messageStore.setMessages(messages.messages);

      socketService.joinGroup(groupId);

      if (isMobile) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error("Failed to load group:", error);
      chatStore.setError("Failed to load group");
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSendMessage = async (content: string, attachments?: MessageAttachment[]) => {
    if (!chatStore.currentConversation && !groupStore.selectedGroup) {
      return;
    }

    try {
      setMessageLoading(true);

      const conversationId = chatStore.currentConversation?.id;
      const groupId = groupStore.selectedGroup?.id;

      socketService.sendMessage({
        conversationId,
        groupId,
        content,
        messageType: "text",
        attachments,
      });

      // Emit typing stopped
      handleTyping(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      chatStore.setError("Failed to send message");
    } finally {
      setMessageLoading(false);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    const conversationId = chatStore.currentConversation?.id;
    const groupId = groupStore.selectedGroup?.id;

    if (!conversationId && !groupId) return;

    const userId = user?._id || "";
    const username = user?.name || "Unknown";

    socketService.sendTypingIndicator({
      conversationId,
      groupId,
      userId,
      username,
      isTyping,
    });

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTypingIndicator({
          conversationId,
          groupId,
          userId,
          username,
          isTyping: false,
        });
      }, 3000);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      socketService.deleteMessage(
        messageId,
        chatStore.currentConversation?.id || groupStore.selectedGroup?.id || ""
      );
      messageStore.deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
      chatStore.setError("Failed to delete message");
    }
  };

  const handleDownloadFile = async (attachment: MessageAttachment) => {
    try {
      const link = document.createElement("a");
      link.href = attachment.url;
      link.download = attachment.name;
      link.click();
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    chatStore.markNotificationRead(notificationId);
  };

  const handleRemoveNotification = (notificationId: string) => {
    chatStore.removeNotification(notificationId);
  };

  const handleNotificationClick = (notification: ChatNotification) => {
    if (notification.conversationId) {
      handleSelectConversation(notification.conversationId);
    } else if (notification.groupId) {
      handleSelectGroup(notification.groupId);
    }
  };

  type ChatNotification = {
    id: string;
    conversationId?: string;
    groupId?: string;
  };

  const currentEntity = chatStore.currentConversation || groupStore.selectedGroup;
  const isGroup = !!groupStore.selectedGroup;
  const userId = user?._id;
  const currentOnlineStatus = chatStore.onlineUsers.find(
    (u) => u.userId === chatStore.currentConversation?.participantIds.find((id) => id !== userId)
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Notifications */}
      <Notifications
        notifications={chatStore.notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onRemove={handleRemoveNotification}
        onNotificationClick={handleNotificationClick}
      />

      {/* Sidebar */}
      {showSidebar && (
        <div className={`${isMobile ? "fixed inset-y-0 left-0 w-80 z-40" : "w-80"} border-r border-gray-200`}>
          <ChatList
            conversations={chatStore.conversations}
            groups={groupStore.groups}
            currentId={currentEntity?.id}
            onSelectConversation={(conv) => handleSelectConversation(conv.id)}
            onSelectGroup={(group) => handleSelectGroup(group.id)}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            userRole={user?.role}
            loading={chatStore.loading}
          />
        </div>
      )}

      {/* Main Chat Area */}
      {currentEntity ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3 flex-1">
              {isMobile && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h2 className="font-bold text-lg">
                  {isGroup ? groupStore.selectedGroup?.name : "Direct Message"}
                </h2>
                {!isGroup && currentOnlineStatus && (
                  <OnlineIndicator user={{ id: "", name: "" }} onlineStatus={currentOnlineStatus} />
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messageLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading messages...</p>
                </div>
              </div>
            ) : messageStore.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div>
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start the conversation!</p>
                </div>
              </div>
            ) : (
              <>
                {messageStore.messages.map((message) => (
                  <MessageComponent
                    key={message.id}
                    message={message}
                    isSent={message.senderId === userId}
                    senderName={message.senderId === userId ? "You" : "Participant"}
                    isGroup={isGroup}
                    canDelete={message.senderId === userId || user?.role === "Admin"}
                    onDelete={handleDeleteMessage}
                    onDownload={handleDownloadFile}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}

            {/* Typing indicator */}
            <TypingIndicator typingUsers={chatStore.typingIndicators} />
          </div>

          {/* Message Input */}
          <MessageInput
            onSend={handleSendMessage}
            onTyping={handleTyping}
            disabled={messageLoading || !socketService.isConnected()}
            loading={messageLoading}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center text-gray-500">
            <p className="text-lg font-semibold">Select a chat to start messaging</p>
            <p className="text-sm mt-2">Choose a conversation or group from the list</p>
          </div>
        </div>
      )}
    </div>
  );
}
