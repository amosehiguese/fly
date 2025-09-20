import api from "@/api";
import { useQuery } from "@tanstack/react-query";

export interface CustomerSupplierChatList {
  chat_id: number;
  chat_created_at: string;
  customer_id: number;
  customer_name: string | null;
}

export interface CustomerSupplierMessage {
  sender_type: string;
  sender_id: number;
  message: string;
  image_url: string | null;
  created_at: string;
}

export const useFetchCustomerSupplierMessages = () => {
  const { data, isPending, isError, error, refetch } = useQuery<
    CustomerSupplierChatList[]
  >({
    queryKey: ["customer-supplier-messages"],
    queryFn: async () => {
      const response = await api.get("api/conversation/admin/conversations");
      return response.data.data;
    },
  });
  return { data, isPending, isError, error, refetch };
};

export const useFetchCustomerSupplierMessagesById = (chatId: number) => {
  const { data, isPending, isError, error } = useQuery<{
    data: CustomerSupplierMessage[];
  }>({
    queryKey: ["customer-supplier-messages", chatId],
    queryFn: async () => {
      const response = await api.get(`api/conversation/admin/chat/${chatId}`);
      return response.data;
    },
  });
  return { data, isPending, isError, error };
};
