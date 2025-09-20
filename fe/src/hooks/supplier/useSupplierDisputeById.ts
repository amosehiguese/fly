import { useQuery } from "@tanstack/react-query";
import api from "@/api";

interface ChatMessage {
  chat_id: number;
  message: string;
  sender_type: string;
  created_at: string;
}

interface DisputeDetails {
  dispute_id: number;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface OrderDetails {
  order_id: string;
  order_status: string;
  bid_price: string;
  total_price: string;
  additional_notes: string;
}

interface Dispute {
  dispute_details: DisputeDetails;
  order_details: OrderDetails;
  chat_history: ChatMessage[];
}

interface DisputeDetailsResponse {
  message: string;
  data: Dispute;
}

export const useSupplierDisputeById = (id: string) => {
  return useQuery({
    queryKey: ["supplier-dispute-details", id],
    queryFn: async () => {
      const response = await api.get<DisputeDetailsResponse>(
        `api/suppliers/disputes/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};
