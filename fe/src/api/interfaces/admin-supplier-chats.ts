export interface Message {
  sender_id: number;
  message: string;
  sender_type: "admin" | "supplier";
  created_at: string;
  image_url?: string;
}

export interface ChatResponse {
  message: string;
  data: Message[];
  order_id: string;
}

export interface SendMessageRequest {
  chat_id: number;
  message: string;
  image?: File;
}

export interface SendMessageResponse {
  message: string;
  chat_id: number;
  image_url?: string;
}
