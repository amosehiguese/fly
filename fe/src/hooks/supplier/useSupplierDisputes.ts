import { useQuery } from "@tanstack/react-query";
import api from "@/api";

interface SupplierDisputesResponse {
  currentPage: number;
  disputes: SupplierDispute[];
  perPage: number;
}

interface SupplierDispute {
  dispute_id: string;
  dispute_status: string;
  admin_comment: string;
  order_id: string;
  reason: string;
  refund_amount: string;
  resolution_outcome: string;
  resolution_status: string;
}

export const useSupplierDisputes = () => {
  return useQuery({
    queryKey: ["supplier-disputes"],
    queryFn: async () => {
      const response = await api.get<SupplierDisputesResponse>(
        "api/suppliers/disputes"
      );
      return response.data;
    },
  });
};
