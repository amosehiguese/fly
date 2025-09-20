import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";

export interface AdminTip {
  order_id: string;
  amount: string;
  message: string;
  status: "pending" | "paid";
  date: string | null;
  payout_status: "pending" | "paid";
  payout_date: string | null;
  customer_name: string;
  customer_email: string;
}

export interface AdminDriver {
  driver_name: string;
  driver_email: string;
  supplier: {
    name: string;
    email: string;
    phone: string;
    address: string;
    accountNumber: string;
    IBAN: string;
    swiftCode: string;
    bankName: string;
  };
  total_tips: string;
  total_paid: number;
  total_pending: string;
  tips: AdminTip[];
}

export interface AdminTipsResponse {
  success: boolean;
  data: {
    totals: {
      total_tips: string;
      total_paid: number;
      total_pending: string;
    };
    drivers: AdminDriver[];
  };
}

export interface MarkPaidRequest {
  driverEmail: string;
  orderIds: string[];
}

export interface MarkPaidResponse {
  success: boolean;
  message: string;
  messageSv: string;
  data: Array<{
    order_id: string;
    tip_amount: string;
    tip_payout_status: "paid";
    tip_payout_date: string;
  }>;
}

/**
 * Hook for fetching admin tips data
 */
export const useAdminTips = () => {
  return useQuery<AdminTipsResponse>({
    queryKey: ["admin-tips"],
    queryFn: async () => {
      const response = await api.get("api/tipping/admin/tips");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for marking tips as paid
 */
export const useMarkTipsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation<MarkPaidResponse, Error, MarkPaidRequest>({
    mutationFn: async (data: MarkPaidRequest) => {
      const response = await api.post("api/tipping/admin/mark-paid", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch admin tips data
      queryClient.invalidateQueries({ queryKey: ["admin-tips"] });
    },
  });
};
