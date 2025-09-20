import { useQuery } from "@tanstack/react-query";
import { getAdminSupplierMessages } from "@/api/admin";

export const useAdminSupplierMessages = (disputeId: string) => {
  return useQuery({
    queryKey: ["admin-supplier-messages", disputeId],
    queryFn: () => getAdminSupplierMessages(disputeId),
    enabled: !!disputeId,
    refetchInterval: 5000,
  });
};
