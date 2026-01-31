"use client";

import React, { useState } from "react";
import { Message, MessageAttachment } from "@/schemas/chat";
import { format } from "date-fns";
import { Check, CheckCheck, Download, Eye, EyeOff } from "lucide-react";

interface MessageProps {
  message: Message;
  isSent: boolean;
  senderName?: string;
  senderAvatar?: string;
  isGroup?: boolean;
  onDelete?: (messageId: string) => void;
  onDownload?: (attachment: MessageAttachment) => void;
  canDelete?: boolean;
}

export default function MessageComponent({
  message,
  isSent,
  senderName,
  senderAvatar,
  isGroup = false,
  onDelete,
  onDownload,
  canDelete = false,
}: MessageProps) {
  const [imagePreview, setImagePreview] = useState(false);
  const [showReadReceipts, setShowReadReceipts] = useState(false);

  const getStatusIcon = () => {
    switch (message.status) {
      case "sent":
        return <Check className="h-4 w-4 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="h-4 w-4 text-gray-400" />;
      case "read":
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image")) return "🖼️";
    if (type === "application/pdf") return "📄";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className={`flex gap-2 mb-4 ${isSent ? "justify-end" : "justify-start"}`}>
      {!isSent && isGroup && senderAvatar && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
          {senderName?.charAt(0) || "U"}
        </div>
      )}

      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isSent
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        }`}
      >
        {/* Sender info for group chats */}
        {!isSent && isGroup && senderName && (
          <p className="text-xs font-semibold mb-1 opacity-75">{senderName}</p>
        )}

        {/* Text content */}
        {message.messageType === "text" && (
          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id}>
                {attachment.type.startsWith("image") ? (
                  <>
                    <button
                      onClick={() => setImagePreview(true)}
                      className={`rounded-md overflow-hidden max-w-xs cursor-pointer hover:opacity-80 transition ${
                        isSent ? "border border-blue-300" : "border border-gray-300"
                      }`}
                    >
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-xs max-h-48 object-cover"
                      />
                    </button>
                    {imagePreview && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="relative max-w-2xl max-h-96">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="max-w-2xl max-h-96 object-contain"
                          />
                          <button
                            onClick={() => setImagePreview(false)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:opacity-80 transition ${
                      isSent ? "bg-blue-600" : "bg-gray-200"
                    }`}
                    onClick={() => onDownload?.(attachment)}
                  >
                    <span>{getFileIcon(attachment.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{attachment.name}</p>
                      <p
                        className={`text-xs ${
                          isSent ? "text-blue-100" : "text-gray-600"
                        }`}
                      >
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <Download className={`h-4 w-4 flex-shrink-0 ${isSent ? "text-white" : "text-gray-600"}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp and status */}
        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
          isSent ? "text-blue-100" : "text-gray-500"
        }`}>
          <span>{format(new Date(message.createdAt), "HH:mm")}</span>
          {isSent && getStatusIcon()}
        </div>

        {/* Read receipts for group messages */}
        {isGroup && message.readBy && message.readBy.length > 0 && !isSent && (
          <button
            onClick={() => setShowReadReceipts(!showReadReceipts)}
            className="mt-1 text-xs font-semibold flex items-center gap-1 hover:underline"
          >
            {message.readBy.length} read
            {showReadReceipts ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Actions menu */}
      {(isSent && canDelete) && (
        <button
          onClick={() => onDelete?.(message.id)}
          className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-100"
          title="Delete message"
        >
          ✕
        </button>
      )}

      {/* Read receipts tooltip */}
      {showReadReceipts && message.readBy && (
        <div className="absolute bg-gray-800 text-white text-xs p-2 rounded z-10">
          {message.readBy.length} people read this
        </div>
      )}
    </div>
  );
}
