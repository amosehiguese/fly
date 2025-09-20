import { sendMessage } from "@/api/admin";
import { DisputeMessageResponse } from "@/api/interfaces/admin/chats";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

export const useSendMessage = (disputeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      message,
      file,
    }: {
      id: string;
      message: string;
      file?: File;
      admin_id: string;
    }) => sendMessage(Number(id), message, file),

    onMutate: async (newMessage) => {
      if (newMessage.file) return;

      await queryClient.cancelQueries({
        queryKey: ["admin-customer-messages", disputeId],
      });

      const previousMessages = queryClient.getQueryData<DisputeMessageResponse>(
        ["admin-customer-messages", disputeId]
      );

      queryClient.setQueryData<DisputeMessageResponse>(
        ["admin-customer-messages", disputeId],
        (old) => {
          if (!old) return previousMessages;

          return {
            ...old,
            data: [
              ...(old.data || []),
              {
                id: Date.now(),
                message: newMessage.message,
                sender_type: "admin",
                sender_id: newMessage.admin_id || "",
                created_at: new Date().toISOString(),
                is_read: 0,
                image_url: null,
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
          ["admin-customer-messages", disputeId],
          context.previousMessages
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-customer-messages", disputeId],
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-customer-messages", disputeId],
      });
    },
  });
};
