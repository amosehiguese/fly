import { fetchMessagesByConversationId } from "@/api/customers";
import { useQuery } from "@tanstack/react-query";

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ["customer-messages", conversationId],
    queryFn: () => fetchMessagesByConversationId(conversationId),
    refetchInterval: 20000,
  });
};
