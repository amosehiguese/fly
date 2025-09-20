import React from "react";
import { ChatLayout } from "./index";

// The ChatExample component demonstrates how to use the chat system
const ChatExample: React.FC = () => {
  // These values would typically come from your authentication system
  // or user context in a real application
  const currentUserId = 40; // Example: logged in customer ID
  const currentUserType = "customer"; // 'customer', 'supplier', or 'admin'
  const isAdmin = false; // Set to true for admin view

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Chat System</h1>
        <p className="text-sm text-gray-600">
          {isAdmin
            ? "Admin View - Manage all conversations"
            : "User View - Chat with support team"}
        </p>
      </header>

      {/* The ChatLayout component needs a container with a fixed height or h-full */}
      <div className="flex-1">
        <ChatLayout
          currentUserId={currentUserId}
          currentUserType={currentUserType}
          isAdmin={isAdmin}
          // Optional: Pass a conversation ID to load by default
          // defaultSelectedConversationId={1}
        />
      </div>
    </div>
  );
};

export default ChatExample;

/**
 * To use the chat system in your application:
 *
 * 1. Import the components:
 *    import { ChatLayout } from '@/components/chat-component';
 *
 * 2. Use the ChatLayout component with required props:
 *    <ChatLayout
 *      currentUserId={userId}
 *      currentUserType={userType}
 *      isAdmin={isAdmin}
 *    />
 *
 * 3. Make sure the container has appropriate height:
 *    <div className="h-[600px]"> or <div className="h-full flex-1">
 *
 * 4. For admin view, set isAdmin to true:
 *    <ChatLayout
 *      currentUserId={adminId}
 *      currentUserType="admin"
 *      isAdmin={true}
 *    />
 */
