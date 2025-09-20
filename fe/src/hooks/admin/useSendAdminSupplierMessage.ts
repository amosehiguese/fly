import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendAdminSupplierMessage } from "@/api/admin";
import { DisputeMessageResponse } from "@/api/interfaces/admin/chats";

export const useSendAdminSupplierMessage = (disputeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ message, file }: { message: string; file?: File | null }) =>
      sendAdminSupplierMessage(disputeId, message, file),

    onMutate: async (newMessage) => {
      if (newMessage.file) return;

      await queryClient.cancelQueries({
        queryKey: ["admin-supplier-messages", disputeId],
      });

      const previousMessages = queryClient.getQueryData<DisputeMessageResponse>(
        ["admin-supplier-messages", disputeId]
      );

      queryClient.setQueryData(
        ["admin-supplier-messages", disputeId],
        (old: DisputeMessageResponse) => {
          if (!old) return previousMessages;
          return {
            ...old,
            data: [
              ...(old.data || []),
              {
                id: Date.now(),
                message: newMessage.message,
                sender_type: "admin",
                sender_id: "1", // Or get from auth context
                created_at: new Date().toISOString(),
                is_read: 0,
                attachment_path: null,
              },
            ],
          };
        }
      );

      return { previousMessages };
    },

    onError: (err, newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData<DisputeMessageResponse>(
          ["admin-supplier-messages", disputeId],
          context.previousMessages
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-supplier-messages", disputeId],
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-supplier-messages", disputeId],
      });
    },
  });
};
