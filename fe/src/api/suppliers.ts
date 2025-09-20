import {
  OngoingOrderRequest,
  OngoingOrderResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  SendBidRequest,
  SendBidResponse,
  MarketplaceResponse,
  MarketplaceFilters,
} from "./interfaces/suppliers";
import { SupplierEarningsResponse } from "./interfaces/suppliers/earnings";
import api from ".";
import { QuotationResponse } from "./interfaces/suppliers/quotations";
import { useQuery } from "@tanstack/react-query";
import { NotificationsResponse } from "./interfaces/suppliers/notifications";
import { SupplierDashboardData } from "./interfaces/suppliers/dashboard";
import {
  ChatResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "./interfaces/admin-supplier-chats";
import { ChatsResponse } from "./interfaces/suppliers/chats";

export const fetchDashboard = async (
  status?: string
): Promise<{ data: SupplierDashboardData }> => {
  const response = await api.get(`api/suppliers/dashboard`, {
    params: status ? { status } : {},
  });
  return response.data;
};

export const getOngoingOrder = async (
  request: OngoingOrderRequest
): Promise<{ data: OngoingOrderResponse }> => {
  const response = await api.get(
    `api/suppliers/order-details/${request.order_id}`
  );
  return response.data;
};

export const updateOrderStatus = async (
  request: UpdateOrderStatusRequest
): Promise<UpdateOrderStatusResponse> => {
  const response = await api.post(`api/suppliers/update-order-status`, request);
  return response.data;
};

export const sendBid = async (
  request: SendBidRequest
): Promise<SendBidResponse> => {
  const formData = new FormData();
  formData.append("quotation_id", request.quotation_id);
  formData.append("quotation_type", request.quotation_type);
  formData.append("moving_cost", request.moving_cost.toString());
  formData.append("truck_cost", request.truck_cost.toString());
  formData.append(
    "additional_services",
    (request.additional_services || 0).toString()
  );
  formData.append("supplier_notes", request.supplier_notes);
  formData.append(
    "estimated_pickup_date_from",
    request.estimated_pickup_date_from
  );
  formData.append("estimated_pickup_date_to", request.estimated_pickup_date_to);
  formData.append(
    "estimated_delivery_date_from",
    request.estimated_delivery_date_from
  );
  formData.append(
    "estimated_delivery_date_to",
    request.estimated_delivery_date_to
  );
  formData.append("invoice", request.file as Blob);
  const response = await api.post(`api/suppliers/send-bid`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchMarketplace = async (
  filters: MarketplaceFilters
): Promise<MarketplaceResponse> => {
  const response = await api.get("api/suppliers/marketplace", {
    params: {
      ...filters,
      page: filters.page || 1,
    },
  });
  return response.data;
};

export const fetchSupplierEarnings =
  async (): Promise<SupplierEarningsResponse> => {
    const response = await api.get("api/suppliers/earnings");
    return response.data;
  };

export const fetchQuotationById = async (
  id: string,
  type: string
): Promise<QuotationResponse> => {
  const response = await api.get(
    `api/suppliers/marketplace/quotation/${type}/${id}`
  );
  return response.data;
};

//supplier sending a message to the customer: http://localhost:3000/api/conversation/supplier/send-message (post)
//supplier getting messages about a conversation: http://localhost:3000/api/conversation/supplier/chat/1 (get)
//supplier getting conversations thats under him: http://localhost:3000/api/conversation/supplier/conversations

export const sendMessage = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  const formData = new FormData();
  formData.append("chat_id", request.chat_id.toString());
  formData.append("message", request.message);
  if (request.image) {
    formData.append("image", request.image);
  }

  const response = await api.post(
    "api/conversation/supplier/send-message",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const fetchMessagesById = async (id: string): Promise<ChatResponse> => {
  const response = await api.get(`api/conversation/supplier/chat/${id}`);
  return response.data;
};

export const fetchConversations = async (): Promise<ChatsResponse> => {
  const response = await api.get(`api/conversation/supplier/conversations`);
  return response.data;
};

export const useNotifications = () => {
  return useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("api/notifications/customer");
      return data;
    },
  });
};
