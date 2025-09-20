"use client";

import React, { useState } from "react";
import { useConversations, useAdminConversations } from "@/hooks/useChat";
import ConversationListItem from "./ConversationListItem";
import { Conversation } from "@/api/interfaces/chats";
import { FiPlus, FiSearch, FiRefreshCw } from "react-icons/fi";
import { useTranslations } from "next-intl";

interface ConversationsListProps {
  selectedConversationId: number | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  isAdmin?: boolean;
  conversations?: Conversation[];
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  isAdmin = false,
  conversations: providedConversations,
}) => {
  const t = useTranslations("common.chats");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");

  // Use the appropriate hook based on user type, but only if no conversations are provided
  const userConversationsQuery = useConversations();
  const adminConversationsQuery = useAdminConversations();

  // Select the appropriate query result based on isAdmin
  const {
    data: fetchedConversations,
    isLoading,
    error,
    refetch,
  } = isAdmin ? adminConversationsQuery : userConversationsQuery;

  // Use provided conversations if available, otherwise use fetched ones
  const baseConversations = providedConversations || fetchedConversations;

  // Filter conversations based on search term and filter
  const filteredConversations = baseConversations?.filter((conversation) => {
    // Search filter
    const matchesSearch =
      conversation?.other_party_name
        ?.toLowerCase()
        .includes(searchTerm?.toLowerCase()) ||
      conversation?.last_message
        ?.toLowerCase()
        .includes(searchTerm?.toLowerCase()) ||
      conversation?.reason?.toLowerCase().includes(searchTerm?.toLowerCase());

    // Status filter
    const matchesStatusFilter =
      filter === "all" ||
      (filter === "unread" && conversation.unread_count > 0) ||
      (filter === "high" && conversation.priority === "high");

    return matchesSearch && matchesStatusFilter;
  });
  console.log("ff", filteredConversations);

  // Sort conversations by last message time (most recent first)
  const sortedConversations = filteredConversations?.sort(
    (a, b) =>
      new Date(b.last_message_time || b.created_at).getTime() -
      new Date(a.last_message_time || a.created_at).getTime()
  );

  // Determine if we're in a loading or error state
  // Only show loading if we're fetching conversations and none were provided
  const showLoading = isLoading && !providedConversations;
  const showError = error && !providedConversations;

  return (
    <div className="flex flex-col h-full border-r">
      {/* Header */}
      <div className="p-3 border-b flex justify-between items-center bg-white dark:bg-black">
        <h2 className="font-semibold text-lg">{t("conversationsTitle")}</h2>
        <button
          onClick={onNewConversation}
          className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
          aria-label="New conversation"
        >
          <FiPlus size={18} />
        </button>
      </div>

      {/* Search and filters */}
      <div className="p-3 border-b">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-sm rounded-full flex-1 ${
              filter === "all"
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t("conversationsLabel.all")}
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1 text-sm rounded-full flex-1 ${
              filter === "unread"
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t("conversationsLabel.unread")}
          </button>
          <button
            onClick={() => setFilter("high")}
            className={`px-3 py-1 text-sm rounded-full flex-1 ${
              filter === "high"
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t("conversationsLabel.highPriority")}
          </button>
          <button
            onClick={() => refetch()}
            className="p-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            aria-label="Refresh"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto bg-white">
        {showLoading ? (
          <div className="p-4 text-center text-gray-500">
            {t("loadingConversations")}
          </div>
        ) : showError ? (
          <div className="p-4 text-center text-red-500">
            {t("errorFetchingConversations")}
          </div>
        ) : sortedConversations?.length ? (
          sortedConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isActive={selectedConversationId === conversation.id}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            {searchTerm || filter !== "all"
              ? t("noConversationsFilter")
              : t("noConversations")}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
