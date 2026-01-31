'use client';

/**
 * COMPLETE CHAT MODULE EXAMPLE
 * This example demonstrates all features of the chat module
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Stores
import { useChatStore } from '@/store/chat-store';
import { useGroupChatStore } from '@/store/group-chat-store';
import { useNotificationStore } from '@/store/notification-store';
import { useAuthStore } from '@/store/auth-store';

// Services
import { chatService } from '@/lib/services/chat-service';
import { groupChatService } from '@/lib/services/group-chat-service';
import { notificationService } from '@/lib/services/notification-service';
import { ChatSocketManager, defaultSocketConfig } from '@/lib/services/chat-socket-manager';

// Components
import {
  ChatHeader,
  MessageList,
  ChatInput,
  GroupChatList,
  GroupMembersList,
  NotificationCenter,
  ContextualChatLink,
} from '@/app/components/chat';
import { ChatAuditPanel } from '@/app/components/chat/ChatAuditPanel';

// Types
import { Chat, Message, GroupChat, ContextualLink } from '@/types/chat';

interface TabType {
  type: 'messages' | 'groups' | 'notifications' | 'audit';
}

export default function ChatModuleExample() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Chat Store
  const {
    chats,
    activeChat,
    messages,
    isLoading: chatLoading,
    setChats,
    setActiveChat,
    setMessages,
    addMessage,
  } = useChatStore();

  // Group Store
  const {
    groups,
    activeGroup,
    setGroups,
    setActiveGroup,
  } = useGroupChatStore();

  // Notification Store
  const { notifications, unreadCount, addNotification } = useNotificationStore();

  // Local State
  const [activeTab, setActiveTab] = useState<TabType['type']>('messages');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [contextualLink, setContextualLink] = useState<ContextualLink | undefined>();
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true);

        if (!user) {
          router.push('/login');
          return;
        }

        // Load initial data
        const [chatsResponse, groupsResponse, notificationsResponse] = await Promise.all([
          chatService.getChats(1, 20),
          groupChatService.getGroups(1, 20),
          notificationService.getNotifications(1, 50),
        ]);

        setChats(chatsResponse.data);
        setGroups(groupsResponse.data);

        // Initialize socket connection
        await ChatSocketManager.initialize(defaultSocketConfig);

        // Setup notification listeners
        ChatSocketManager.setupNotificationListeners({
          onNotification: (notification) => {
            addNotification(notification);
            // Optional: Show toast notification
            console.log('📨 New notification:', notification);
          },
          onCriticalAlert: (alert) => {
            console.error('🚨 Critical alert:', alert);
            // Handle critical alerts (e.g., security issues)
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Initialization failed');
        console.error('Initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();

    return () => {
      ChatSocketManager.disconnect();
    };
  }, [user, router, setChats, setGroups, addNotification]);

  // ============================================================================
  // 1-TO-1 CHAT HANDLERS
  // ============================================================================

  // Load messages when chat changes
  useEffect(() => {
    if (!activeChat) return;

    const loadMessages = async () => {
      try {
        const response = await chatService.getMessages(activeChat.id, 1, 50);
        setMessages(response.data);

        // Setup socket listeners for this chat
        ChatSocketManager.setupChatListeners(activeChat.id, {
          onNewMessage: (message) => {
            addMessage(message);
          },
          onMessageStatusChange: (messageId, status) => {
            console.log(`Message ${messageId} status: ${status}`);
          },
          onTyping: (indicator) => {
            console.log(`${indicator.userName} is typing...`);
          },
          onUserPresence: (userId, status) => {
            console.log(`User ${userId} is now ${status}`);
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      }
    };

    loadMessages();
  }, [activeChat, setMessages, addMessage]);

  // Handle sending message
  const handleSendMessage = useCallback(
    async (content: string, attachments?: string[]) => {
      if (!activeChat || !user) return;

      try {
        const message = await chatService.sendMessage(
          activeChat.id,
          content,
          'TEXT',
          attachments,
          contextualLink
        );

        addMessage(message);
        ChatSocketManager.sendMessage(activeChat.id, message);
        setContextualLink(undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    },
    [activeChat, user, contextualLink, addMessage]
  );

  // Handle typing
  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (activeChat) {
        ChatSocketManager.sendTypingIndicator(activeChat.id, isTyping);
      }
    },
    [activeChat]
  );

  // ============================================================================
  // GROUP CHAT HANDLERS
  // ============================================================================

  // Load group messages
  useEffect(() => {
    if (!activeGroup) return;

    const loadMessages = async () => {
      try {
        const response = await groupChatService.getMessages(activeGroup.id, 1, 50);
        setMessages(response.data);

        // Setup socket listeners for group
        ChatSocketManager.setupGroupListeners(activeGroup.id, {
          onNewMessage: (message) => {
            addMessage(message);
          },
          onMemberJoined: (userId, userName) => {
            console.log(`${userName} joined the group`);
          },
          onMemberLeft: (userId, userName) => {
            console.log(`${userName} left the group`);
          },
        });
      } catch (err) {
        console.error('Failed to load group messages:', err);
      }
    };

    loadMessages();
  }, [activeGroup, setMessages, addMessage]);

  // Handle send group message
  const handleSendGroupMessage = useCallback(
    async (content: string, attachments?: string[]) => {
      if (!activeGroup || !user) return;

      try {
        const message = await groupChatService.sendMessage(
          activeGroup.id,
          content,
          'TEXT',
          attachments
        );

        addMessage(message);
        ChatSocketManager.sendGroupMessage(activeGroup.id, message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    },
    [activeGroup, user, addMessage]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>Loading chat module...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
        <h1 style={{ margin: 0 }}>Chat Module</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowNotifications(!showNotifications)}>
            🔔 {unreadCount > 0 && `(${unreadCount})`}
          </button>
          {user.role === 'ADMIN' && (
            <button onClick={() => setShowAudit(!showAudit)}>📊 Audit</button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee',
          borderBottom: '1px solid #fcc',
          color: '#c33',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
        padding: '0',
      }}>
        {(['messages', 'groups'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 16px',
              backgroundColor: activeTab === tab ? '#fff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #0084ff' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? '600' : '400',
              color: activeTab === tab ? '#0084ff' : '#666',
            }}
          >
            {tab === 'messages' ? '💬 Messages' : '👥 Groups'}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 1-to-1 Chat Tab */}
        {activeTab === 'messages' && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Chat List */}
            <div style={{
              width: '300px',
              borderRight: '1px solid #e0e0e0',
              overflowY: 'auto',
              backgroundColor: '#fff',
            }}>
              {chats.length === 0 ? (
                <div style={{ padding: '16px', color: '#999' }}>No conversations</div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      backgroundColor: activeChat?.id === chat.id ? '#e8f2ff' : 'transparent',
                    }}
                  >
                    <h4 style={{ margin: '0 0 4px', fontSize: '13px' }}>
                      {chat.participants?.[0]?.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                      {chat.lastMessage?.content || 'No messages'}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Chat Area */}
            {activeChat ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <ChatHeader chat={activeChat} currentUser={user} />
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <MessageList messages={messages} currentUser={user} isLoading={chatLoading} />
                </div>
                {contextualLink && (
                  <ContextualChatLink
                    contextualLink={contextualLink}
                    onLinkChange={setContextualLink}
                  />
                )}
                <ChatInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
              </div>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
              }}>
                Select a chat to start messaging
              </div>
            )}
          </div>
        )}

        {/* Group Chat Tab */}
        {activeTab === 'groups' && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Groups List */}
            <div style={{ width: '280px', borderRight: '1px solid #e0e0e0', overflow: 'hidden' }}>
              <GroupChatList
                groups={groups}
                activeGroupId={activeGroup?.id}
                onSelectGroup={setActiveGroup}
              />
            </div>

            {/* Group Chat Area */}
            {activeGroup ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#fff',
                }}>
                  <h2 style={{ margin: '0 0 4px' }}>{activeGroup.name}</h2>
                  <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                    {activeGroup.members?.length} members
                  </p>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <MessageList messages={messages} currentUser={user} />
                </div>
                <ChatInput onSendMessage={handleSendGroupMessage} />
              </div>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
              }}>
                Select a group to start messaging
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationClick={(notification) => {
          if (notification.chatId) {
            const chat = chats.find((c) => c.id === notification.chatId);
            if (chat) {
              setActiveChat(chat);
              setActiveTab('messages');
            }
          }
          setShowNotifications(false);
        }}
      />

      {/* Audit Panel */}
      {activeChat && (
        <ChatAuditPanel
          chatId={activeChat.id}
          isOpen={showAudit}
          onClose={() => setShowAudit(false)}
          isAdmin={user.role === 'ADMIN'}
        />
      )}
    </div>
  );
}
