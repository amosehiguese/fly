"use client";

import React, { useEffect, useRef, useState } from "react";
import { Conversation, Message as MessageType } from "@/api/interfaces/chats";
import { useMessages, useAdminMessages } from "@/hooks/useChat";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { FiArrowLeft, FiMoreVertical, FiX } from "react-icons/fi";
import { ScrollArea, ScrollAreaViewport } from "@/components/ui/scroll-area";

interface ConversationViewProps {
  conversation: Conversation;
  onBack: () => void;
  currentUserId: number;
  currentUserType: string;
  isAdmin?: boolean;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  onBack,
  currentUserId,
  currentUserType,
  isAdmin = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [previousMessagesLength, setPreviousMessagesLength] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Get messages using both hooks (only one will be used based on isAdmin)
  const userMessagesQuery = useMessages(conversation.id);
  const adminMessagesQuery = useAdminMessages(conversation.id);

  // Select the appropriate query result based on isAdmin
  const { data, isLoading, error } = isAdmin
    ? adminMessagesQuery
    : userMessagesQuery;

  const messages = data?.messages;
  // console.log("am", messages);

  // Function to check if user is at bottom of scroll
  const isNearBottom = () => {
    if (!scrollAreaRef.current) return true;

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    // Consider "near bottom" if within 100px of the bottom
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  // Handle scroll events
  const handleScroll = () => {
    setShouldScrollToBottom(isNearBottom());
  };

  // Scroll to bottom only in certain conditions
  useEffect(() => {
    if (!messages) return;

    // Determine if we should scroll to bottom
    const hasNewMessages = messages.length > previousMessagesLength;
    const isFirstLoad = previousMessagesLength === 0;

    // Only scroll if we're near the bottom, it's first load, or user sent a message
    if ((shouldScrollToBottom && hasNewMessages) || isFirstLoad) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // Update previous length
    setPreviousMessagesLength(messages.length);
  }, [messages, previousMessagesLength, shouldScrollToBottom]);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
      default:
        return "bg-green-100 text-green-800";
    }
  };

  // Check if user is the sender of a message
  const isCurrentUser = (message: MessageType) => {
    return (
      message.sender_type === currentUserType &&
      message.sender_id === currentUserId
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      {/* Conversation header */}
      <div className="p-3 border-b flex items-center justify-between bg-white dark:bg-black">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 mr-2 lg:hidden"
            aria-label="Back"
          >
            <FiArrowLeft size={20} />
          </button>

          <div className="flex items-center">
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 mr-3">
              {conversation.other_party_name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="font-medium">{conversation.other_party_name}</h2>
              <div className="flex items-center">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getPriorityClass(conversation.priority)}`}
                >
                  {conversation.priority} priority
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {conversation.reason}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="More options"
          >
            <FiMoreVertical size={20} />
          </button>

          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 ml-1 hidden lg:block"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-black"
        type="always"
      >
        <ScrollAreaViewport
          ref={scrollAreaRef}
          className="h-full w-full bg-white dark:bg-black"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-red-500">Error loading messages</div>
            </div>
          ) : messages?.length ? (
            <>
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser(message)}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex justify-center items-center bg-white dark:bg-black h-full">
              <div className="text-gray-500">
                No messages yet. Start the conversation!
              </div>
            </div>
          )}
        </ScrollAreaViewport>
      </ScrollArea>

      {/* Message input */}
      <MessageInput
        chatId={conversation.id}
        onSend={() => setShouldScrollToBottom(true)}
      />
    </div>
  );
};

export default ConversationView;
