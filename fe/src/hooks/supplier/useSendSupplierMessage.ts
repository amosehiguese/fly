import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/api/suppliers";
import { sendDisputeMessage } from "@/api/supplier-disputes";
import { Message } from "@/api/interfaces/suppliers/chats";
import { SupplierDisputeChatMessage as DisputeMessage } from "@/api/interfaces/suppliers/chats";

export const useSendSupplierMessage = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      message,
      file,
      chat_id,
    }: {
      message: string;
      file?: File;
      chat_id: number;
    }) => sendMessage({ chat_id, message, image: file }),

    // Add optimistic update
    onMutate: async ({ message, file }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["supplier-messages", id],
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData([
        "supplier-messages",
        id,
      ]);

      // Create optimistic message
      const optimisticMessage: Message = {
        message: message,
        sender_id: 1,
        sender_type: "supplier",
        created_at: new Date().toISOString(),
        image_url: file ? "pending-upload" : undefined,
      };

      // Optimistically update the cache
      queryClient.setQueryData(
        ["supplier-messages", id],
        (old: { data: Message[] }) => {
          if (!old) return { data: [optimisticMessage] };
          return { data: [...old.data, optimisticMessage] };
        }
      );

      // Return context
      return { previousMessages };
    },

    onError: (err, variables, context) => {
      // Revert to previous state if mutation fails
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["supplier-messages", id],
          context.previousMessages
        );
      }
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["supplier-messages", id],
      });
    },
  });
};

export const useSendSupplierDisputeMessage = (disputeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ message, file }: { message: string; file?: File }) =>
      sendDisputeMessage(disputeId, message, file),

    // Add optimistic update
    onMutate: async ({ message, file }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["supplier-dispute-messages", disputeId],
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData([
        "supplier-dispute-messages",
        disputeId,
      ]);

      // Create optimistic message
      const optimisticMessage: DisputeMessage = {
        id: 1,
        message: message,
        sender_id: 1,
        sender_type: "supplier",
        created_at: new Date().toISOString(),
        image_url: file ? "pending-upload" : null,
      };

      // Optimistically update the cache
      queryClient.setQueryData(
        ["supplier-dispute-messages", disputeId],
        (old: DisputeMessage[]) => {
          if (!old) return [optimisticMessage];
          return [...old, optimisticMessage];
        }
      );

      // Return context
      return { previousMessages };
    },

    onError: (err, variables, context) => {
      // Revert to previous state if mutation fails
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["supplier-dispute-messages", disputeId],
          context.previousMessages
        );
      }
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["supplier-dispute-messages", disputeId],
      });
    },
  });
};
