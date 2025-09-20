import { fetchAdminCustomerMessages } from "@/api/admin";
import { chatApi } from "@/api/admin-supplier-chat";
import { useQuery } from "@tanstack/react-query";

export const useCustomerMessages = (disputeId: string) => {
  return useQuery({
    queryKey: ["admin-customer-messages", disputeId],
    queryFn: () => fetchAdminCustomerMessages(disputeId),
    refetchInterval: 20000,
  });
};

export const useSupplierMessages = (disputeId: string) => {
  return useQuery({
    queryKey: ["admin-supplier-messages", disputeId],
    queryFn: () => chatApi.getSupplierMessagesForAdmin(Number(disputeId)),
    enabled: !!disputeId,
  });
};
