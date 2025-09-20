import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/api/chatApi";
import { SendMessageRequest } from "@/api/interfaces/chats";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { handleMutationError } from "@/api";

// Query keys
const QUERY_KEYS = {
  conversations: "conversations",
  adminConversations: "adminConversations",
  messages: (chatId: number) => ["messages", chatId],
  adminMessages: (chatId: number) => ["adminMessages", chatId],
  conversation: (id: number) => ["conversation", id],
  adminConversation: (id: number) => ["adminConversation", id],
  statistics: "chatStatistics",
};

// Customer/Supplier hooks
export const useConversations = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.conversations],
    queryFn: chatApi.getConversations,
  });
};

export const useConversation = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.conversation(id),
    queryFn: () => chatApi.getConversationById(id),
    enabled: !!id, // Only fetch when ID is available
  });
};

export const useMessages = (chatId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.messages(chatId),
    queryFn: () => chatApi.getMessages(chatId),
    enabled: !!chatId, // Only fetch when chat ID is available
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendMessageRequest) => chatApi.sendMessage(request),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch messages for this chat
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.messages(variables.chat_id),
      });
      // Also invalidate conversations list as the last message may have changed
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.conversations] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.conversation, variables.chat_id],
      });
    },
  });
};

export const useAdminSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendMessageRequest) =>
      chatApi.adminSendMessage(request),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch messages for this chat
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminMessages(variables.chat_id),
      });
      // Also invalidate conversations list as the last message may have changed
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.adminConversations],
      });
    },
  });
};

// Admin hooks
export const useAdminConversations = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.adminConversations],
    queryFn: chatApi.adminGetConversations,
  });
};

export const useAdminConversation = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.adminConversation(id),
    queryFn: () => chatApi.adminGetConversationById(id),
    enabled: !!id, // Only fetch when ID is available
  });
};

export const useAdminMessages = (chatId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.adminMessages(chatId),
    queryFn: () => chatApi.adminGetMessages(chatId),
    enabled: !!chatId, // Only fetch when chat ID is available
  });
};

export const useAdminInitiateConversation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: chatApi.adminInitiateConversation,
    onSuccess: (data) => {
      toast.success(data.message || "Conversation initiated sucessfully");
      // console.log("data", data);
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.adminConversations],
      });
      router.push(`/admin/chats`);
    },
    onError: handleMutationError,
  });
};

export const useInitiateConversation = (
  senderType: "customer" | "supplier" | "driver"
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: chatApi.initiateConversation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.conversations],
      });
      toast.success(data.message || "Conversation initiated sucessfully");
      if (senderType === "customer") {
        router.push(`/customer/chats/${data.chat_id}`);
      } else if (senderType === "supplier") {
        router.push(`/supplier/chats/${data.chat_id}`);
      } else if (senderType === "driver") {
        router.push(`/driver/chats/${data.chat_id}`);
      }
    },
    onError: handleMutationError,
  });
};
