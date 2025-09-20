"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, ArrowLeft, Send, Paperclip } from "lucide-react";
import { useConversation, useMessages, useSendMessage } from "@/hooks/useChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message as MessageType } from "@/api/interfaces/chats";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

// Internal ChatView component
const ChatView = ({
  chatId,
  messages,
  isLoading,
  isError,
  currentUserId,
  currentUserType,
}: {
  chatId: number;
  messages: MessageType[] | undefined;
  isLoading: boolean;
  isError: boolean;
  currentUserId: number;
  currentUserType: string;
}) => {
  const tCommon = useTranslations("common");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previousMessagesLength, setPreviousMessagesLength] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useSendMessage();

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

  // Handle submitting a new message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() && !selectedFile) return;

    sendMessageMutation.mutate(
      {
        chat_id: chatId,
        message: message.trim(),
        image: selectedFile,
      },
      {
        onSuccess: () => {
          setMessage("");
          setSelectedFile(null);
          setShouldScrollToBottom(true);
        },
        onError: (error) => {
          console.error("Error sending message:", error);
        },
      }
    );
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Messages area */}
      <ScrollArea
        className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800"
        type="always"
      >
        <div
          ref={scrollAreaRef}
          onScroll={handleScroll}
          className="h-full w-full"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-10 h-10 animate-spin text-gray-400 dark:text-gray-600" />
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-red-500 dark:text-red-400">
                {tCommon("chats.errorFetching")}
              </div>
            </div>
          ) : messages?.length ? (
            <div className="flex flex-col space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser(msg) ? "justify-end" : "justify-start"} mb-4`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      isCurrentUser(msg)
                        ? "bg-red-500 text-white rounded-br-none"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                    }`}
                  >
                    {!isCurrentUser(msg) && (
                      <div className="font-semibold text-sm mb-1">
                        {msg.sender_name}
                      </div>
                    )}

                    <div className="break-words">{msg.message}</div>

                    {msg.image_url && (
                      <div className="mt-2">
                        <Image
                          width={200}
                          height={200}
                          src={msg.image_url}
                          alt="Attached"
                          className="max-w-full rounded"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                    )}

                    <div
                      className={`text-xs mt-1 ${
                        isCurrentUser(msg)
                          ? "text-red-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500 dark:text-gray-400">
                {tCommon("chats.noMessagesYet")}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            aria-label="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 ml-2"
          />
          {selectedFile && (
            <div className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm flex items-center">
              <span className="truncate max-w-[100px] text-gray-700 dark:text-gray-300">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={
              (!message.trim() && !selectedFile) ||
              sendMessageMutation.isPending
            }
            className={`ml-2 p-2 rounded-full ${
              !message.trim() && !selectedFile
                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                : "bg-red-500 text-white hover:bg-red-600"
            } transition-colors`}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default function AdminChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.id ? parseInt(params.id as string, 10) : 0;

  const { data: conversation, isLoading: isConversationLoading } =
    useConversation(chatId);
  const {
    data: messages,
    isLoading: isMessagesLoading,
    isError,
  } = useMessages(chatId);

  // Admin ID is typically 1 in most systems
  const adminId = 1;

  const isLoading = isConversationLoading || isMessagesLoading;
  const recipientName = conversation?.other_party_name || "Chat";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-gray-500 dark:text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <p>Error fetching messages</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-800 dark:text-gray-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {recipientName}
        </h1>
      </div>

      {/* Chat content */}
      <div className="flex-1 overflow-hidden">
        <ChatView
          chatId={chatId}
          messages={messages}
          isLoading={isLoading}
          isError={isError}
          currentUserId={adminId}
          currentUserType="admin"
        />
      </div>
    </div>
  );
}
