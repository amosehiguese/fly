"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Search, ChevronRight, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  avatar?: string;
}

export default function MessagesPage() {
  const t = useTranslations("driver");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<ChatPreview[]>([]);

  // Mock data for demonstration purposes
  useEffect(() => {
    // In a real application, this would be an API call
    const mockChats: ChatPreview[] = [
      {
        id: "1",
        name: "Supplier: Acme #216544",
        lastMessage: "Your order has been accepted",
        timestamp: "12:07",
        unread: true,
      },
      {
        id: "2",
        name: "Supplier: Acme #216544",
        lastMessage: "Your order status: In Progress",
        timestamp: "11:45",
        unread: false,
      },
      {
        id: "3",
        name: "Supplier: Acme #216544",
        lastMessage: "Your order has been completed",
        timestamp: "10:30",
        unread: false,
      },
      {
        id: "4",
        name: "Supplier: Acme #216544",
        lastMessage: "I'll be there in 10 minutes",
        timestamp: "9:15",
        unread: false,
      },
      {
        id: "5",
        name: "Supplier: Acme #216544",
        lastMessage: "Please confirm the pickup address",
        timestamp: "Yesterday",
        unread: false,
      },
    ];

    setChats(mockChats);
  }, []);

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToChat = (chatId: string) => {
    router.push(`/driver/messages/${chatId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">{t("messages")}</h1>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder={"Search messages..."}
            className="pl-10 bg-gray-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredChats.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("noMessagesYet")}</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            {t("noConversations")}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              className="w-full text-left p-4 border-b hover:bg-gray-50 transition-colors flex items-center"
              onClick={() => navigateToChat(chat.id)}
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4 flex-shrink-0">
                {chat.avatar ? (
                  <Image
                    src={chat.avatar}
                    alt={chat.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500 text-lg">
                      {chat.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p
                    className={cn(
                      "font-medium truncate",
                      chat.unread && "font-semibold"
                    )}
                  >
                    {chat.name}
                  </p>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {chat.timestamp}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm text-gray-600 truncate mt-1",
                    chat.unread && "text-black font-medium"
                  )}
                >
                  {chat.lastMessage}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
