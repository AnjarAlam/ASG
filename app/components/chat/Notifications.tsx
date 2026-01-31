"use client";

import React from "react";
import { ChatNotification } from "@/schemas/chat";
import { X, Bell } from "lucide-react";
import { format } from "date-fns";

interface NotificationsProps {
  notifications: ChatNotification[];
  onMarkAsRead?: (notificationId: string) => void;
  onRemove?: (notificationId: string) => void;
  onNotificationClick?: (notification: ChatNotification) => void;
}

export default function Notifications({
  notifications,
  onMarkAsRead,
  onRemove,
  onNotificationClick,
}: NotificationsProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 max-w-sm z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => onNotificationClick?.(notification)}
          className={`p-4 rounded-lg shadow-lg cursor-pointer transition transform hover:scale-105 ${
            notification.isRead
              ? "bg-gray-100 text-gray-700"
              : "bg-blue-500 text-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{notification.senderName}</p>
              <p className="text-xs opacity-75 mt-1 line-clamp-2">
                {notification.messagePreview}
              </p>
              <p className="text-xs opacity-50 mt-1">
                {format(new Date(notification.createdAt), "HH:mm")}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(notification.id);
              }}
              className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!notification.isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead?.(notification.id);
              }}
              className="mt-2 text-xs font-semibold opacity-75 hover:opacity-100 transition"
            >
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
