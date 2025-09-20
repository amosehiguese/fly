import { fetchMessages } from "@/api/customers";
import { ChatList } from "@/api/interfaces/customers/chats";
import { useQuery } from "@tanstack/react-query";

export const useChat = () => {
  // Query for fetching chat history
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<ChatList[]>({
    queryKey: ["customer-chats"],
    queryFn: fetchMessages,
    initialData: [],
    refetchInterval: 20000,
  });

  return {
    messages,
    isLoading,
    isError,
    refetch,
  };
};
