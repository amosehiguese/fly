"use client";

import { useAdminSupplierMessages } from "@/hooks/admin/useAdminSupplierMessages";
import { useSendAdminSupplierMessage } from "@/hooks/admin/useSendAdminSupplierMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";

export default function AdminSupplierChatPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: messages, isLoading } = useAdminSupplierMessages(params.id);
  const sendMessage = useSendAdminSupplierMessage(params.id);

  const handleSendMessage = (message: string) => {
    sendMessage.mutate(message);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <div className="flex-1 overflow-y-auto">
          <ChatMessages
            messages={messages?.data || []}
            currentUserType="admin"
          />
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
