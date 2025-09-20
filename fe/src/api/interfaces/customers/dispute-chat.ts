export interface DisputeMessageRequestBody {
  message: string;
  dispute_id: string;
  image?: File;
}

export interface DisputeMessageResponse {
  message: string;
  timestamp: Date;
}

export interface DisputeMessage {
  id: number;
  sender_id: number;
  message: string;
  sender_type: "customer" | "admin" | "supplier";
  created_at: string;
  image_url?: string;
  is_read: boolean;
}

//   export interface ChatResponse {
//     message: string;
//     timestamp: Date;
//   }

//   export interface ChatsResponse {
//     data: ChatList[];
//     message: string;
//   }

//   export interface Chat {
//     conversation_id: number;
//     bid_id: number;
//     order_id: string;
//     created_at: string;
//     updated_at: string;
//     quotation_type: string;
//     unread_count: number;
//     last_message: string;
//   }

//   export interface ChatList {
//     chat_created_at: string;
//     id: number;
//     supplier_id: number;
//     supplier_name: string;
//   }
