import { fetchCustomerMessages, fetchSupplierMessages } from "@/api/admin";
import { DisputeChat } from "@/api/interfaces/admin/chats";
import { useQuery } from "@tanstack/react-query";

export const useCustomerChats = () => {
  // Query for fetching chat history
  const { data, isPending, isError, refetch } = useQuery<DisputeChat[]>({
    queryKey: ["admin-customer-chats"],
    queryFn: fetchCustomerMessages,
    initialData: [],
    refetchInterval: 20000,
  });

  return {
    data,
    isPending,
    isError,
    refetch,
  };
};

export const useSupplierChats = () => {
  const { data, isPending, isError, refetch } = useQuery<DisputeChat[]>({
    queryKey: ["admin-supplier-chats"],
    queryFn: fetchSupplierMessages,
    initialData: [],
  });

  return {
    data,
    isPending,
    isError,
    refetch,
  };
};
