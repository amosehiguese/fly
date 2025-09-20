"use client";

import React from "react";
import { Conversation } from "@/api/interfaces/chats";
import { formatDistanceToNow, parseISO } from "date-fns";
import { FiBell } from "react-icons/fi";
import { useTranslations } from "next-intl";

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const t = useTranslations("common.chats");
  const timeAgo = conversation.last_message_time
    ? formatDistanceToNow(parseISO(conversation?.last_message_time), {
        addSuffix: true,
      })
    : formatDistanceToNow(parseISO(conversation?.updated_at || ""), {
        addSuffix: true,
      });

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
      default:
        return "bg-green-500";
    }
  };

  const getReasonName = (reasonId: string) => {
    // This returns the translation key pattern that matches your structure
    const reason = reasonId
      .toLowerCase()
      .replaceAll(" ", "_")
      .replace("-", "_");
    return `reasonListObject.${reason}`;
  };

  return (
    <div
      onClick={onClick}
      className={`flex p-3 border-b cursor-pointer transition-colors ${
        isActive
          ? "bg-primary-50 border-l-4 border-l-primary-500"
          : "hover:bg-gray-50"
      }`}
    >
      {/* Avatar placeholder - replace with actual avatar if available */}
      <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-600 mr-3">
        {conversation.other_party_name?.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className="font-medium truncate">
            {conversation?.other_party_name || conversation.recipient_type}{" "}
            {conversation.id}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
            {timeAgo}
          </span>
        </div>

        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-600 truncate">
            {conversation?.last_message}
          </p>

          <div className="flex items-center">
            {/* Priority indicator */}
            <div
              className={`w-2 h-2 rounded-full mr-1 ${getPriorityColor(conversation?.priority)}`}
            ></div>

            {/* Unread count badge */}
            {conversation.unread_count > 0 && (
              <div className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                {conversation.unread_count > 9
                  ? "9+"
                  : conversation.unread_count}
              </div>
            )}
          </div>
        </div>

        {/* Reason/category badge */}
        <div className="flex mt-1">
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
            {t(getReasonName(conversation.reason))}
          </span>

          {/* High priority icon */}
          {conversation.priority === "high" && (
            <span className="ml-1 text-red-500">
              <FiBell size={14} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;
