"use client";

import React from "react";
import { OnlineStatus } from "@/schemas/chat";
import { format } from "date-fns";
import { Circle } from "lucide-react";

interface OnlineIndicatorProps {
  user: { id: string; name: string };
  onlineStatus: OnlineStatus | undefined;
}

export default function OnlineIndicator({ user, onlineStatus }: OnlineIndicatorProps) {
  const isOnline = onlineStatus?.isOnline ?? false;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <Circle
          className={`h-3 w-3 fill-current ${
            isOnline ? "text-green-500" : "text-gray-400"
          }`}
        />
        <span className="text-xs font-semibold text-gray-700">
          {isOnline ? (
            "Online"
          ) : onlineStatus?.lastSeen ? (
            <>
              Last seen{" "}
              <time dateTime={new Date(onlineStatus.lastSeen).toISOString()}>
                {format(new Date(onlineStatus.lastSeen), "HH:mm")}
              </time>
            </>
          ) : (
            "Offline"
          )}
        </span>
      </div>
    </div>
  );
}
