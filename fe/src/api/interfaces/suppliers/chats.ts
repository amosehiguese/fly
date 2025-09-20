export interface SupplierDisputeChatMessage {
  id: number;
  message: string;
  sender_type: "admin" | "supplier";
  sender_id: number;
  image_url: string | null;
  created_at: string;
}

export interface SupplierDisputeChatResponse {
  message: string;
  data: SupplierDisputeChatMessage[];
}

export interface SupplierDisputeConversation {
  dispute_id: number;
  order_id: string;
  dispute_status: string;
  dispute_created_at: string;
  latest_message: string;
  latest_sender: string;
  latest_message_time: string;
  unread_count: number;
}

export interface SupplierDisputeConversationsResponse {
  message: string;
  data: SupplierDisputeConversation[];
}

export interface SendDisputeMessageResponse {
  message: string;
  chat_id: number;
  image_url: string | null;
}

export interface Message {
  sender_id: number;
  message: string;
  sender_type: "customer" | "admin" | "supplier";
  created_at: string;
  image_url?: string;
  order_id?: string;
}

export interface ChatResponse {
  message: string;
  timestamp: Date;
}

export interface ChatsResponse {
  data: ChatList[];
  message: string;
}

export interface Chat {
  conversation_id: number;
  bid_id: number;
  order_id: string;
  created_at: string;
  updated_at: string;
  quotation_type: string;
  unread_count: number;
  last_message: string;
}

export interface ChatList {
  last_message: string;
  last_message_time: string;
  last_sender_type: "customer" | "supplier";
  last_sender_name: string;
  chat_id: number;
  customer_id: number;
  customer_name: string | null;
}

export interface SendMessageRequest {
  conversation_id: number;
  message: string;
}
