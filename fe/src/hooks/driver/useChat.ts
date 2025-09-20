import api from "@/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface DriverConversation {
  id: number;
  initiator_type: string;
  initiator_id: number;
  recipient_type: string;
  recipient_id: number;
  reason: string;
  priority: string;
  status: string;
  initiator_last_read: number;
  recipient_last_read: number;
  created_at: string;
  updated_at: string;
  other_party_name: string;
  initiator_name: string;
  recipient_name: string;
  unread_count: number;
  last_message: string;
  last_message_time: string;
  is_initiator: boolean;
}

export interface DriverMessage {
  id: number;
  chat_id: number;
  sender_type: string;
  sender_id: number;
  message: string;
  image_url?: string;
  read_status: string;
  created_at: string;
  sender_name?: string;
}

// Fetch all driver conversations
export function useDriverConversations() {
  return useQuery<DriverConversation[]>({
    queryKey: ["driver-conversations"],
    queryFn: async () => {
      const res = await api.get("api/conversation/conversations");
      // Adjust if your API expects POST or needs auth headers
      return res.data.data;
    },
  });
}

// Fetch all messages in a conversation
export function useDriverMessages(chatId: number) {
  return useQuery<DriverMessage[]>({
    queryKey: ["driver-messages", chatId],
    queryFn: async () => {
      const res = await api.get(`api/conversation/messages/${chatId}`);
      // Adjust if your API expects POST or needs auth headers
      return res.data.data.messages;
    },
    enabled: !!chatId,
  });
}

// Send a message in a conversation
export function useDriverSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["driver-send-message"],
    mutationFn: async ({
      chat_id,
      message,
      image,
    }: {
      chat_id: number;
      message: string;
      image?: File | null;
    }) => {
      const formData = new FormData();
      formData.append("chat_id", String(chat_id));
      formData.append("message", message);
      if (image) formData.append("image", image);
      const res = await api.post("api/conversation/message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-messages"] });
    },
  });
}

// You can expand these hooks to handle authentication, error handling, etc.
