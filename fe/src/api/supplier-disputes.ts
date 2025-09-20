import api from ".";
import {
  SupplierDisputeChatResponse,
  SupplierDisputeConversationsResponse,
  SendDisputeMessageResponse,
} from "./interfaces/suppliers/chats";
import { SupplierDisputesResponse } from "./interfaces/suppliers/disputes";

export const getSupplierDisputeMessages = async (
  disputeId: string
): Promise<SupplierDisputeChatResponse> => {
  const response = await api.get(`api/dispute-chat/supplier-chat/${disputeId}`);
  return response.data;
};

export const getSupplierDisputeConversations =
  async (): Promise<SupplierDisputeConversationsResponse> => {
    const response = await api.get(`api/dispute-chat/supplier-disputes`);
    return response.data;
  };

export const sendDisputeMessage = async (
  disputeId: string,
  message: string,
  file?: File
): Promise<SendDisputeMessageResponse> => {
  const formData = new FormData();
  formData.append("dispute_id", disputeId);
  formData.append("message", message);
  if (file) {
    formData.append("image", file);
  }
  const response = await api.post(
    `api/dispute-chat/supplier-chat-admin`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const fetchSupplierDisputes =
  async (): Promise<SupplierDisputesResponse> => {
    const response = await api.get(
      `api/dispute-supplier-chat/supplier/disputes`
    );
    return response.data;
  };
