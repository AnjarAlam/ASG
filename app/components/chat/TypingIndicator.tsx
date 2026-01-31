"use client";

import React, { useState, useEffect } from "react";
import { TypingIndicator } from "@/schemas/chat";
import { Loader2 } from "lucide-react";

interface TypingIndicatorProps {
  typingUsers: TypingIndicator[];
  isVisible?: boolean;
}

export default function TypingIndicator({
  typingUsers,
  isVisible = true,
}: TypingIndicatorProps) {
  if (!isVisible || typingUsers.length === 0) {
    return null;
  }

  const userNames = typingUsers.map((u) => u.username).join(", ");
  const isMultiple = typingUsers.length > 1;

  return (
    <div className="flex items-center gap-2 p-3 text-sm text-gray-500">
      <div className="flex gap-1">
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      </div>
      <span>
        {userNames} {isMultiple ? "are" : "is"} typing...
      </span>
    </div>
  );
}
