import {
  fetchDisputeMessagesByConversationId,
  sendDisputeMessage,
} from "@/api/customers";
import {
  DisputeMessageRequestBody,
  DisputeMessage,
} from "@/api/interfaces/customers/dispute-chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// You may need to define your Message interface if not already defined

export const useDisputeChatsByDisputeId = (disputeId: string) => {
  return useQuery({
    queryKey: ["customer-dispute-chats", disputeId],
    queryFn: () => fetchDisputeMessagesByConversationId(disputeId),
  });
};

export const useSendDisputeMessage = (disputeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DisputeMessageRequestBody) => sendDisputeMessage(data),

    // Add optimistic update
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["customer-dispute-chats", disputeId],
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData([
        "customer-dispute-chats",
        disputeId,
      ]);

      // Create optimistic message
      const optimisticMessage: DisputeMessage = {
        id: Number(disputeId), // Temporary ID
        message: newMessage.message || "",
        sender_id: 1,
        sender_type: "customer",
        created_at: new Date().toISOString(),
        image_url: newMessage.image ? "pending-upload" : undefined,
        is_read: false,
      };

      // Optimistically update the cache
      queryClient.setQueryData(
        ["customer-dispute-chats", disputeId],
        (old: { data: DisputeMessage[] }) => {
          return {
            ...old,
            data: [...(old?.data || []), optimisticMessage],
          };
        }
      );

      // Return context with the previous messages
      return { previousMessages };
    },

    // If the mutation fails, use the context we returned above
    onError: (err, newMessage, context) => {
      queryClient.setQueryData(
        ["customer-dispute-chats", disputeId],
        context?.previousMessages
      );
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-dispute-chats", disputeId],
      });
    },
  });
};
