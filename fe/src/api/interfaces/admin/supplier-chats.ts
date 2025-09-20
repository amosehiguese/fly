import { SupplierChatMessage } from "../suppliers/chats";

export interface AdminSupplierChatMessage extends SupplierChatMessage {
  sender_id: number;
}

export interface AdminSupplierChatResponse {
  message: string;
  data: AdminSupplierChatMessage[];
  order_id: string;
}
