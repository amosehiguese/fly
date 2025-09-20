import { sendMessage } from "@/api/admin";
import { Message } from "@/api/interfaces/admin/chats";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newMessage: {
      id: string;
      content: string;
      sender_type: "customer" | "admin" | "supplier";
      sender_id: string;
    }) => sendMessage(Number(newMessage.id), newMessage.content),

    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({
        queryKey: ["admin-messages", newMessage.id],
      });

      const previousMessages = queryClient.getQueryData<Message>([
        "admin-messages",
        newMessage.id,
      ]);

      queryClient.setQueryData<Message>(
        ["admin-messages", newMessage.id],
        (old) => ({
          messages: [
            ...(old?.messages || []),
            {
              id: Date.now(),
              content: newMessage.content,
              sender_type: newMessage.sender_type,
              sender_id: newMessage.sender_id,
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
          ["admin-messages", newMessage.id],
          context.previousMessages
        );
      }
    },

    onSettled: (_, __, newMessage) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-messages", newMessage.id],
      });
    },
  });
};
