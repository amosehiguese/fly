import api from "@/api";
import {
  ChatResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "./interfaces/admin-supplier-chats";
import { DisputeMessageResponse } from "./interfaces/admin/chats";

export const chatApi = {
  // Get messages for supplier
  getSupplierMessages: async (disputeId: number) => {
    const response = await api.get<ChatResponse>(
      `/api/supplier-chat/supplier/${disputeId}/messages`
    );
    return response.data;
  },

  // Get messages for admin
  getSupplierMessagesForAdmin: async (
    id: number
  ): Promise<DisputeMessageResponse> => {
    const response = await api.get(`api/dispute-chat/admin-chat/${id}`);
    // console.log("response os", response);

    return response.data;
  },

  // Send message as supplier
  sendSupplierMessage: async ({
    dispute_id,
    message,
    image,
  }: SendMessageRequest) => {
    const formData = new FormData();
    formData.append("dispute_id", dispute_id.toString());
    formData.append("message", message);
    if (image) {
      formData.append("image", image);
    }

    const response = await api.post<SendMessageResponse>(
      "/api/supplier-chat/supplier/send",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Send message as admin
  sendAdminMessage: async ({
    dispute_id,
    message,
    image,
  }: SendMessageRequest) => {
    const formData = new FormData();
    formData.append("dispute_id", dispute_id.toString());
    formData.append("message", message);
    if (image) {
      formData.append("image", image);
    }

    const response = await api.post<SendMessageResponse>(
      "/api/dispute-chat/admin",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
