"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";

interface ChatMessagesProps {
  messages: Array<{
    message: string;
    sender_type: string;
    time_sent: string;
    image_url: string | null;
    sender_name: string;
  }>;
  currentUserType: string;
}

export function ChatMessages({ messages, currentUserType }: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex flex-col max-w-[70%] space-y-2",
            message.sender_type === currentUserType
              ? "self-end items-end"
              : "self-start items-start"
          )}
        >
          <div
            className={cn(
              "rounded-lg p-3",
              message.sender_type === currentUserType
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            <p className="text-sm font-medium">{message.message}</p>
            {message.image_url && (
              <div className="mt-2">
                <Image
                  src={message.image_url}
                  alt="Attached image"
                  width={200}
                  height={200}
                  className="rounded-md"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{message.sender_name}</span>
            <span>•</span>
            <span>{format(new Date(message.time_sent), "HH:mm")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
