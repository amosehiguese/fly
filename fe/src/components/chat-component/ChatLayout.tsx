"use client";

import React, { useState, useEffect } from "react";
import { Conversation, UserType } from "@/api/interfaces/chats";
import ConversationsList from "./ConversationsList";
import ConversationView from "./ConversationView";
import {
  useAdminInitiateConversation,
  useConversation,
  useInitiateConversation,
} from "@/hooks/useChat";
import { NewConversationModal } from ".";
import { useTranslations } from "next-intl";

interface ChatLayoutProps {
  currentUserId: number;
  currentUserType: string;
  isAdmin?: boolean;
  defaultSelectedConversationId?: number | null;
  conversations?: Conversation[];
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  currentUserId,
  currentUserType,
  isAdmin = false,
  defaultSelectedConversationId = null,
  conversations = undefined,
}) => {
  const t = useTranslations("common.chats");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [showMobileList, setShowMobileList] = useState(true);
  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);

  const { mutate: adminInitiateConversation } = useAdminInitiateConversation();
  const { mutate: initiateConversation } = useInitiateConversation("customer");

  // Fetch default conversation if ID is provided
  const { data: defaultConversation } = useConversation(
    defaultSelectedConversationId || 0
  );

  // Set default conversation when it loads or changes
  useEffect(() => {
    if (defaultSelectedConversationId && defaultConversation) {
      setSelectedConversation(defaultConversation);
      if (window.innerWidth < 768) {
        setShowMobileList(false);
      }
    }
  }, [defaultSelectedConversationId, defaultConversation]);

  // Handle window resize to determine mobile view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // On desktop, just ensure both panels are visible
        setShowMobileList(!selectedConversation);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedConversation]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // On mobile, hide the conversation list
    if (window.innerWidth < 768) {
      setShowMobileList(false);
    }
  };

  // Handle back button in mobile view
  const handleBack = () => {
    if (window.innerWidth < 768) {
      setShowMobileList(true);
    } else {
      setSelectedConversation(null);
    }
  };

  // Handle creating a new conversation
  const handleCreateConversation = (
    recipientId: number,
    recipientType: UserType,
    reason: string,
    message: string
  ) => {
    if (isAdmin) {
      adminInitiateConversation(
        {
          recipient_id: recipientId,
          recipient_type: recipientType as "customer" | "supplier",
          reason,
        },
        {
          onSuccess: (newConversation) => {
            setShowNewConversationModal(false);
            setSelectedConversation(newConversation);
            if (window.innerWidth < 768) {
              setShowMobileList(false);
            }
          },
          onError: (error) => {
            console.error("Error creating conversation:", error);
            // Handle error - show toast, etc.
          },
        }
      );
    } else {
      initiateConversation(
        {
          recipient_id: recipientId,
          recipient_type: recipientType as "customer" | "supplier",
          reason,
          message,
        },
        {
          onSuccess: (newConversation) => {
            setShowNewConversationModal(false);
            setSelectedConversation(newConversation);
            if (window.innerWidth < 768) {
              setShowMobileList(false);
            }
          },
          onError: (error) => {
            console.error("Error creating conversation:", error);
            // Handle error - show toast, etc.
          },
        }
      );
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-black shadow-md rounded-lg overflow-hidden">
      {/* Conversations list - full width on mobile when active, sidebar on desktop */}
      <div
        className={`${
          showMobileList ? "flex" : "hidden md:flex"
        } flex-col md:w-80 lg:w-96 h-full border-r`}
      >
        <ConversationsList
          selectedConversationId={selectedConversation?.id || null}
          onSelectConversation={handleSelectConversation}
          onNewConversation={() => setShowNewConversationModal(true)}
          isAdmin={isAdmin}
          conversations={conversations}
        />
      </div>

      {/* Conversation view - full width on mobile when active, main area on desktop */}
      <div
        className={`${
          !showMobileList ? "flex" : "hidden md:flex"
        } flex-col flex-1 h-full`}
      >
        {selectedConversation ? (
          <ConversationView
            conversation={selectedConversation}
            onBack={handleBack}
            currentUserId={currentUserId}
            currentUserType={currentUserType}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-6">
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                {t("noConversationSelected")}
              </h2>
              <p className="text-gray-500 mb-4">
                {t("selectConversationMessage")}
              </p>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                {t("startNewConversation")}
              </button>
            </div>
          </div>
        )}
      </div>

      {showNewConversationModal && (
        <NewConversationModal
          onClose={() => setShowNewConversationModal(false)}
          onSubmit={handleCreateConversation}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};
export default ChatLayout;
