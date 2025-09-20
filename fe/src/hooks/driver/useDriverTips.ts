import { useQuery } from "@tanstack/react-query";
import api from "@/api";

export interface DriverTip {
  order_id: string;
  tip_amount: string;
  tip_message: string;
  tip_status: "pending" | "completed" | "failed";
  tip_date: string | null;
  fullname: string;
  email: string;
}

export interface DriverTipsResponse {
  success: boolean;
  data: DriverTip[];
}

/**
 * Hook for fetching driver tips data
 */
export const useDriverTips = () => {
  return useQuery<DriverTipsResponse>({
    queryKey: ["driver-tips"],
    queryFn: async () => {
      const response = await api.get("api/tipping/driver/tips");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
