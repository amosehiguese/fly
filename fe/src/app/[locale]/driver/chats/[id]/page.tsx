"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, ArrowLeft, Send, Paperclip } from "lucide-react";
import {
  useDriverMessages,
  useDriverSendMessage,
} from "@/hooks/driver/useChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function DriverChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const tCommon = useTranslations("common");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    data: messages,
    isLoading,
    isError,
    refetch,
  } = useDriverMessages(Number(id));
  const sendMessageMutation = useDriverSendMessage();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldScrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedFile) return;
    sendMessageMutation.mutate(
      {
        chat_id: Number(id),
        message: message.trim(),
        image: selectedFile,
      },
      {
        onSuccess: () => {
          setMessage("");
          setSelectedFile(null);
          setShouldScrollToBottom(true);
          refetch();
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-800 dark:text-gray-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {tCommon("chats.title")}
        </h1>
      </div>
      {/* Messages area */}
      <ScrollArea
        className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800"
        type="always"
      >
        <div ref={scrollAreaRef} className="h-full w-full">
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
                  className={`flex ${msg.sender_type === "driver" ? "justify-end" : "justify-start"} mb-4`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      msg.sender_type === "driver"
                        ? "bg-red-500 text-white rounded-br-none"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                    }`}
                  >
                    {!msg.sender_type === "driver" && (
                      <div className="font-semibold text-sm mb-1">
                        {msg.sender_name}
                      </div>
                    )}
                    <div className="break-words">{msg.message}</div>
                    {msg.image_url && (
                      <div className="mt-2">
                        <Image
                          height={200}
                          width={200}
                          src={msg.image_url}
                          alt="Attached"
                          className="max-w-full rounded"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                    )}
                    <div
                      className={`text-xs mt-1 ${
                        msg.sender_type === "driver"
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
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <button
            type="button"
            onClick={() => document.getElementById("file-upload")?.click()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <input
            type="text"
            className="flex-1 mx-2 rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
            placeholder={tCommon("chats.typeMessage")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
            disabled={sendMessageMutation.isPending}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
