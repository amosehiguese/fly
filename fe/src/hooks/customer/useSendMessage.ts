import { sendMessage } from "@/api/customers";
import { Message } from "@/api/interfaces/customers/chats";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newMessage: {
      id: string;
      content: string;
      customer_id: string;
      file?: File;
    }) =>
      sendMessage(Number(newMessage.id), newMessage.content, newMessage.file),

    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({
        queryKey: ["customer-messages", newMessage.id],
      });

      const previousMessages = queryClient.getQueryData<Message>([
        "customer-messages",
        newMessage.id,
      ]);

      queryClient.setQueryData<Message>(
        ["customer-messages", newMessage.id],
        (old) => ({
          messages: [
            ...(old?.messages || []),
            {
              id: Date.now(),
              content: newMessage.content,
              sender_type: "customer",
              sender_id: newMessage.customer_id,
              created_at: new Date().toISOString(),
              is_read: 0,
            },
          ],
          order_id: old?.order_id || "",
        })
      );

      return { previousMessages };
    },

    onError: (err, newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData<Message>(
          ["customer-messages", newMessage.id],
          context.previousMessages
        );
      }
    },

    onSettled: (_, __, newMessage) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-messages", newMessage.id],
      });
    },
  });
};
