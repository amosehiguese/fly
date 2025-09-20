import {
  Conversation,
  Message,
  UpdateReadStatusRequest,
  SendMessageRequest,
  ConversationsResponse,
  ApiResponse,
  AdminInitiateConversationRequest,
  InitiateConversationRequest,
  MessagesConversation,
  AdminMessagesResponse,
} from "@/api/interfaces/chats";
import api from ".";

export const chatApi = {
  // Customer/Supplier endpoints
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<ConversationsResponse>(
      "/api/conversation/conversations"
    );
    return data.data;
  },

  getConversationById: async (id: number): Promise<Conversation> => {
    const { data } = await api.get<ApiResponse<Conversation>>(
      `/api/conversation/conversation/${id}`
    );
    return data.data;
  },

  getMessages: async (
    chatId: number
  ): Promise<Message[] | MessagesConversation> => {
    const { data } = await api.get(`/api/conversation/messages/${chatId}`);
    return data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<ApiResponse<number>>(
      "/api/conversation/unread-count"
    );
    return data.data;
  },

  markAsRead: async (request: UpdateReadStatusRequest): Promise<void> => {
    await api.post("/api/conversation/mark-read", request);
  },

  sendMessage: async (request: SendMessageRequest): Promise<Message> => {
    const formData = new FormData();
    formData.append("chat_id", request.chat_id.toString());
    formData.append("message", request.message);
    if (request.image) {
      formData.append("image", request.image);
    }
    const { data } = await api.post<ApiResponse<Message>>(
      "/api/conversation/message",
      formData
    );
    return data.data;
  },

  initiateConversation: async (
    request: InitiateConversationRequest
  ): Promise<{ message: string; chat_id: number }> => {
    const { data } = await api.post<{ message: string; chat_id: number }>(
      "/api/conversation/initiate",
      request
    );
    return data;
  },

  // Admin endpoints
  adminGetConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<ConversationsResponse>(
      "/api/conversation/admin/conversations"
    );
    return data.data;
  },

  adminGetConversationById: async (id: number): Promise<Conversation> => {
    const { data } = await api.get<ApiResponse<Conversation>>(
      `/api/conversation/admin/conversation/${id}`
    );
    return data.data;
  },

  adminGetMessages: async (chatId: number): Promise<Message[]> => {
    const { data } = await api.get<AdminMessagesResponse>(
      `/api/conversation/admin/messages/${chatId}`
    );
    //@ts-expect-error - return type is not type-safe but works at runtime

    return data.data;
  },

  adminSendMessage: async (request: SendMessageRequest): Promise<Message> => {
    const { data } = await api.post<ApiResponse<Message>>(
      "/api/conversation/admin/message",
      request
    );
    return data.data;
  },

  adminInitiateConversation: async (
    request: AdminInitiateConversationRequest
  ): Promise<{ message: string; chat_id: number }> => {
    const { data } = await api.post<{ message: string; chat_id: number }>(
      "/api/conversation/admin/initiate",
      request
    );
    return data;
  },
};
