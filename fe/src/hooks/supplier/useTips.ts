import { useQuery } from "@tanstack/react-query";
import api from "@/api";

export interface SupplierTip {
  order_id: string;
  amount: string;
  message: string;
  status: "pending" | "paid";
  date: string | null;
  customer_name: string;
  customer_email: string;
}

export interface SupplierDriver {
  driver_name: string;
  driver_email: string;
  total_tips: string;
  tips: SupplierTip[];
}

export interface SupplierTipsResponse {
  success: boolean;
  data: {
    total_tips: string;
    drivers: SupplierDriver[];
  };
}

/**
 * Hook for fetching supplier driver tips data
 */
export const useSupplierTips = () => {
  return useQuery<SupplierTipsResponse>({
    queryKey: ["supplier-tips"],
    queryFn: async () => {
      const response = await api.get("api/tipping/supplier/driver-tips");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
