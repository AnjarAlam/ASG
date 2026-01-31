"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageAttachment, FileType } from "@/schemas/chat";
import { Send, Plus, Loader2, X } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string, attachments?: MessageAttachment[]) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
}

export default function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  loading = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = [".pdf", ".jpg", ".jpeg", ".png", ".gif"],
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [content]);

  // Typing indicator
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to mark as stopped typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 3000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && attachments.length === 0) {
      return;
    }

    try {
      await onSend(content.trim(), attachments.length > 0 ? attachments : undefined);
      setContent("");
      setAttachments([]);
      setIsTyping(false);
      onTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file size
        if (file.size > maxFileSize) {
          alert(`File ${file.name} is too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`);
          continue;
        }

        // Validate file type
        const fileType = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!acceptedFileTypes.includes(fileType)) {
          alert(
            `File type ${fileType} is not allowed. Accepted types: ${acceptedFileTypes.join(", ")}`
          );
          continue;
        }

        // Add to attachments (in real app, you'd upload here)
        const attachment: MessageAttachment = {
          id: `temp_${Date.now()}_${i}`,
          url: URL.createObjectURL(file),
          type: file.type as FileType,
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
        };

        setAttachments((prev) => [...prev, attachment]);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <form onSubmit={handleSend} className="w-full border-t border-gray-200 bg-white p-4">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
            >
              <span className="text-sm">
                {attachment.type.startsWith("image") ? "🖼️" : "📄"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{attachment.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="text-gray-400 hover:text-red-500 transition"
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* File upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || loading || uploading}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Attach file"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || loading || uploading}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          disabled={disabled || loading}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-[120px]"
          rows={1}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || loading || (!content.trim() && attachments.length === 0)}
          className="flex-shrink-0 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          title="Send message"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* File type info */}
      <p className="text-xs text-gray-400 mt-2">
        Supported: {acceptedFileTypes.join(", ")} • Max size: {maxFileSize / 1024 / 1024}MB
      </p>
    </form>
  );
}
