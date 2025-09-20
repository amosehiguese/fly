"use client";

import { Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import Link from "next/link";
import { useDriverConversations } from "@/hooks/driver/useChat";
import { InitiateChatButton } from "@/components/InitiateChatButton";
import { useTranslations } from "next-intl";
import { useDriverProfile } from "@/hooks/driver";

export default function DriverChatsPage() {
  const router = useRouter();
  const {
    data: conversations,
    isLoading,
    isError,
    refetch,
  } = useDriverConversations();

  const { useSupplierDetails } = useDriverProfile();
  const { data } = useSupplierDetails();
  const supplier = data?.data;

  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between p-4 items-center">
        <div className="flex items-center gap-4  border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-800 dark:text-gray-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {tCommon("chats.title")}
          </h1>
        </div>
        <InitiateChatButton
          isAdmin={false}
          recipientType="supplier"
          recipientId={supplier?.supplierId}
          senderType="driver"
        />
      </div>
      {/* Chat content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : isError ? (
          <div className="flex flex-col gap-4 justify-center items-center h-full text-gray-800 dark:text-gray-200">
            <p>{tCommon("chats.errorFetching")}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              {tCommon("chats.retry")}
            </button>
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations?.map((msg) => (
              <Link
                href={`/driver/chats/${msg.id}`}
                key={msg.id}
                className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-12 h-12 mr-4 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xl font-semibold text-gray-600 dark:text-gray-300">
                  {msg.other_party_name?.[0]?.toUpperCase() || "S"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium truncate text-gray-800 dark:text-gray-200">
                      {msg.other_party_name === "admin" ||
                      msg.other_party_name === "customer" ||
                      msg.other_party_name === "supplier"
                        ? tCommon(`chats.recipient.${msg.other_party_name}`)
                        : msg.other_party_name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      {new Date(msg.last_message_time).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {msg.last_message || tCommon("chats.noMessagesYet")}
                  </p>
                </div>
                {msg.unread_count > 0 && (
                  <div className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {msg.unread_count}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-800 dark:text-gray-200">
            <Image
              src="/empty-message.png"
              alt="no messages"
              width={500}
              height={500}
              className="w-36 h-36 opacity-80 dark:opacity-60"
            />
            <div className="font-semibold text-[32px] mt-4">
              {tCommon("chats.noMessages.title")}
            </div>
            <small className="mt-2 text-[16px] font-medium text-gray-600 dark:text-gray-400">
              {tCommon("chats.noMessages.description")}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
