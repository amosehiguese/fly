export interface DisputeMessage {
  created_at: string;
  id: number;
  image_url: string | null;
  is_read: number;
  message: string;
  sender_id: string;
  sender_type: "customer" | "admin" | "supplier";
}

export interface DisputeChat {
  dispute_id: number;
  order_id: string;
  dispute_status: string;
  latest_message: string;
  latest_sender: string;
  latest_message_time: string;
  unread_count: number;
}

export interface DisputeChatResponse {
  message: string;
  data: DisputeChat[];
  order_id: string;
  supplier_id: number;
  page: number;
}

export interface DisputeMessageResponse {
  message: string;
  data: DisputeMessage[];
}

export interface SendMessageRequest {
  dispute_id: number;
  message: string;
  image?: File;
}

export interface SendMessageResponse {
  message: string;
  chat_id: number;
  image_url?: string;
}
