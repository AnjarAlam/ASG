"use client";

import React, { useState } from "react";
import { Conversation, GroupChat } from "@/schemas/chat";
import { Search, Plus, Settings } from "lucide-react";
import { format } from "date-fns";

interface ChatListProps {
  conversations: Conversation[];
  groups: GroupChat[];
  currentId?: string;
  onSelectConversation?: (conversation: Conversation) => void;
  onSelectGroup?: (group: GroupChat) => void;
  onCreateNew?: () => void;
  onSettings?: () => void;
  loading?: boolean;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  userRole?: string;
}

export default function ChatList({
  conversations,
  groups,
  currentId,
  onSelectConversation,
  onSelectGroup,
  onCreateNew,
  onSettings,
  loading = false,
  searchQuery = "",
  onSearch,
  userRole = "Operator",
}: ChatListProps) {
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("direct");

  const filteredConversations = conversations.filter((conv) =>
    conv.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    searchQuery === ""
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === ""
  );

  const getTruncatedMessage = (text: string, length = 50) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const getConversationName = (conversation: Conversation) => {
    // In real app, you'd get the other participant's name
    const lastMessage = conversation.lastMessage;
    if (lastMessage) {
      return getTruncatedMessage(lastMessage.content);
    }
    return "No messages yet";
  };

  const renderConversationItem = (conversation: Conversation) => (
    <div
      key={conversation.id}
      onClick={() => onSelectConversation?.(conversation)}
      className={`p-3 cursor-pointer hover:bg-gray-100 transition border-b border-gray-200 ${
        currentId === conversation.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900">Participant Name</h3>
          <p className="text-xs text-gray-500 truncate">{getConversationName(conversation)}</p>
        </div>
        {conversation.unreadCount > 0 && (
          <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {conversation.unreadCount}
          </span>
        )}
      </div>
      {conversation.lastMessage && (
        <p className="text-xs text-gray-400 mt-1">
          {format(new Date(conversation.lastMessage.createdAt), "HH:mm")}
        </p>
      )}
    </div>
  );

  const renderGroupItem = (group: GroupChat) => (
    <div
      key={group.id}
      onClick={() => onSelectGroup?.(group)}
      className={`p-3 cursor-pointer hover:bg-gray-100 transition border-b border-gray-200 ${
        currentId === group.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-gray-900">{group.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {group.members.length}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {group.lastMessage ? getTruncatedMessage(group.lastMessage.content) : "No messages yet"}
          </p>
        </div>
      </div>
      {group.lastMessage && (
        <p className="text-xs text-gray-400 mt-1">
          {format(new Date(group.lastMessage.createdAt), "HH:mm")}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Messages</h2>
          <div className="flex gap-2">
            <button
              onClick={onSettings}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            {userRole === "Admin" && (
              <button
                onClick={onCreateNew}
                className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                title="Create new chat"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("direct")}
          className={`flex-1 py-2 font-semibold text-sm transition ${
            activeTab === "direct"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Direct ({conversations.length})
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex-1 py-2 font-semibold text-sm transition ${
            activeTab === "groups"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Groups ({groups.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading...</p>
            </div>
          </div>
        ) : activeTab === "direct" ? (
          filteredConversations.length > 0 ? (
            filteredConversations.map(renderConversationItem)
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
              <div>
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat with a user</p>
              </div>
            </div>
          )
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map(renderGroupItem)
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <div>
              <p className="text-sm">No groups yet</p>
              <p className="text-xs mt-1">Join or create a group</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
