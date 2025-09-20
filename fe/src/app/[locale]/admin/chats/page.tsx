"use client";

import { useState, useEffect } from "react";
import {} from // useFetchCustomerSupplierMessages,
// CustomerSupplierChatList,
"@/hooks/admin/useFetchCustomerSupplierMessages";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChatLayout } from "@/components/chat-component";
import { Conversation } from "@/api/interfaces/chats";
import { useAdminConversations } from "@/hooks/useChat";
import { useTranslations } from "next-intl";
type ChatType = "customers" | "suppliers" | "customer-supplier";

export default function AdminChatsPage() {
  const tCommon = useTranslations("common");
  const [activeTab, setActiveTab] = useState<ChatType>("customers");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const adminId = 1; // Default admin ID, should come from auth context

  const {
    data: adminConversations,
    isPending: isAdminConversationsPending,
    isError: isAdminConversationsError,
    refetch: refetchAdminConversations,
  } = useAdminConversations();
  console.log("adminConversations", adminConversations);

  const customerChats = adminConversations?.filter(
    (conversation) =>
      conversation.initiator_type === "customer" ||
      conversation.recipient_type === "customer"
  );
  const supplierChats = adminConversations?.filter(
    (conversation) =>
      conversation.initiator_type === "supplier" ||
      conversation.recipient_type === "supplier"
  );

  // const {
  //   data: customerSupplierChats,
  //   isPending: isCustomerSupplierChatsPending,
  //   isError: isCustomerSupplierChatsError,
  //   refetch: refetchCustomerSupplierChats,
  // } = useFetchCustomerSupplierMessages();

  // Reset selected conversation when changing tabs
  useEffect(() => {
    setSelectedConversation(null);
  }, [activeTab]);

  // Map customer-supplier chats specifically
  // const mapCustomerSupplierChats = (
  //   chats: CustomerSupplierChatList[] | undefined
  // ): Conversation[] => {
  //   if (!chats) return [];

  //   return chats.map((chat) => ({
  //     id: chat.chat_id,
  //     initiator_type: "customer",
  //     initiator_id: chat.customer_id || 0,
  //     recipient_type: "supplier",
  //     recipient_id: 0, // We don't have this info from the API
  //     reason: `Chat ID: ${chat.chat_id}`,
  //     priority: "medium",
  //     status: "open",
  //     initiator_last_read: 0,
  //     recipient_last_read: 0,
  //     created_at: chat.chat_created_at || new Date().toISOString(),
  //     updated_at: chat.chat_created_at || new Date().toISOString(),
  //     other_party_name: chat.customer_name || "Customer-Supplier",
  //     unread_count: 0,
  //     last_message: "No messages yet",
  //     last_message_time: chat.chat_created_at || new Date().toISOString(),
  //     is_initiator: false,
  //   }));
  // };

  // Get the appropriate conversations based on active tab
  const getActiveConversations = () => {
    switch (activeTab) {
      case "customers":
        return customerChats || [];
      case "suppliers":
        return supplierChats || [];
      // case "customer-supplier":
      //   return mapCustomerSupplierChats(customerSupplierChats);
      default:
        return [];
    }
  };

  // Handle loading, error states
  const isLoading =
    (activeTab === "customers" && isAdminConversationsPending) ||
    (activeTab === "suppliers" && isAdminConversationsPending);
  // (activeTab === "customer-supplier");

  const isError =
    (activeTab === "customers" && isAdminConversationsError) ||
    (activeTab === "suppliers" && isAdminConversationsError);
  // (activeTab === "customer-supplier" && isCustomerSupplierChatsError);

  const handleRefetch = () => {
    switch (activeTab) {
      case "customers":
      case "suppliers":
        refetchAdminConversations();
        break;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-black">
      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-200 ">
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "customers"
              ? "bg-red-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {tCommon("chats.recipient.customer")} Chats
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "suppliers"
              ? "bg-red-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {tCommon("chats.recipient.supplier")} Chats
        </button>
        {/* <button
          onClick={() => setActiveTab("customer-supplier")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "customer-supplier"
              ? "bg-red-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Customer-Supplier Chats
        </button> */}
      </div>

      {/* Chat content */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-black">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : isError ? (
          <div className="flex flex-col gap-4 justify-center items-center h-full text-gray-800 dark:text-gray-200">
            <p>{tCommon("chats.errorFetching")}</p>
            <Button variant="destructive" onClick={handleRefetch}>
              {tCommon("buttons.retry")}
            </Button>
          </div>
        ) : getActiveConversations().length > 0 ? (
          <ChatLayout
            currentUserId={adminId}
            currentUserType="admin"
            isAdmin={true}
            defaultSelectedConversationId={selectedConversation?.id || null}
            conversations={getActiveConversations()}
          />
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-800 dark:text-gray-200">
            <Image
              src="/empty-message.png"
              alt="no messages"
              width={500}
              height={500}
              className="w-36 h-36 opacity-80 dark:opacity-60"
            />
            <div className="font-semibold text-[32px]">
              {tCommon("chats.noMessages.title")}
            </div>
            <small className="mt-2 text-[16px] font-semibold text-gray-600 dark:text-gray-400">
              {tCommon("chats.noMessages.description")}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
