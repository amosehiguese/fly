import api from ".";
import { ChatList, ChatResponse, Message } from "./interfaces/customers/chats";
import { CheckoutResponse } from "./interfaces/customers/checkout";
import { DashboardResponse } from "./interfaces/customers/dashboard";
import {
  DisputeMessage,
  DisputeMessageRequestBody,
} from "./interfaces/customers/dispute-chat";
import { MyDisputes } from "./interfaces/customers/disputes";
import { SingleOrder } from "./interfaces/customers/order";

export const fetchDashboard = async (): Promise<DashboardResponse> => {
  const response = await api.get(`api/customers/dashboard`);
  return response.data;
};

export const fetchMyDisputes = async (): Promise<MyDisputes[]> => {
  const response = await api.get(`api/customers/complaints`);
  return response.data.complaints;
};

export const fetchMyOrderById = async (id: string): Promise<SingleOrder> => {
  const response = await api.get(`api/customers/orders/${id}`);
  return response.data.data;
};

// {
//   order_id: string;
//   reason: "damaged" | "missing" | "delay";
//   request_details: string;
// }
export const raiseDispute = async (data: FormData) => {
  const response = await api.post("/api/disputes/create-dispute", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const fetchMessages = async (): Promise<ChatList[]> => {
  const response = await api.get("api/conversation/customer/conversations");
  return response.data.data;
};

export const fetchChatByDisputeId = async (disputeId: string) => {
  const response = await api.get(
    `http://localhost:3000/api/dispute-chat/customer/${disputeId}/messages`
  );
  return response.data;
};

export const fetchMessagesByConversationId = async (
  id: string
): Promise<{ data: Message[] }> => {
  const response = await api.get(`api/conversation/customer/chat/${id}`);
  return response.data;
};

export const fetchDisputeMessagesByConversationId = async (
  id: string
): Promise<{ data: DisputeMessage[] }> => {
  const response = await api.get(`api/dispute-chat/customer/${id}/messages`);
  return response.data;
};

export const sendDisputeMessage = async ({
  message,
  dispute_id,
  image,
}: DisputeMessageRequestBody) => {
  const formData = new FormData();
  formData.append("message", message);
  formData.append("dispute_id", dispute_id);
  if (image) {
    formData.append("image", image);
  }
  const response = await api.post(`api/dispute-chat/customer/send`, formData);
  return response.data;
};

export const sendMessage = async (id: number, content: string, file?: File) => {
  const formData = new FormData();
  formData.append("message", content);
  formData.append("chat_id", id.toString());
  if (file) {
    formData.append("image", file);
  }
  const response = await api.post<ChatResponse>(
    `api/conversation/customer/send-message`,
    formData
  );
  return response.data;
};

export const fetchCheckoutData = async (
  order_id: string
): Promise<CheckoutResponse> => {
  const response = await api.get(`/api/customers/checkout/${order_id}`);
  return response.data;
};
