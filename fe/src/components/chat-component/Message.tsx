"use client";

import React from "react";
import Image from "next/image";
import { Message as MessageType } from "@/api/interfaces/chats";
import { formatDistanceToNow, parseISO } from "date-fns";

interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
}

export const Message: React.FC<MessageProps> = ({ message, isCurrentUser }) => {
  const timeAgo = formatDistanceToNow(parseISO(message.created_at), {
    addSuffix: true,
  });

  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`relative max-w-[80%] rounded-lg p-3 ${
          isCurrentUser
            ? "bg-primary text-white rounded-tr-none"
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        }`}
      >
        {!isCurrentUser && (
          <div className="font-medium text-xs mb-1">{message.sender_name}</div>
        )}

        <div className="break-words">{message.message}</div>

        {message.image_url && (
          <div className="mt-2 rounded-md overflow-hidden">
            <div className="relative w-full h-48">
              <Image
                src={message.image_url}
                alt="Attached image"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div
          className={`text-xs mt-1 ${isCurrentUser ? "text-gray-200" : "text-gray-500"}`}
        >
          {timeAgo}{" "}
          {message.read_status === "read" && isCurrentUser && (
            <span className="ml-1">✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
