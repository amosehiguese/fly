// Base types
export type UserType = "admin" | "customer" | "supplier";
export type Priority = "high" | "medium" | "low";
export type ChatStatus = "open" | "closed";
export type ReadStatus = "read" | "unread";

// Base interface for entities with timestamps
export interface TimestampedEntity {
  created_at: string;
  updated_at?: string;
}

// Base interface for entities with sender information
export interface SenderInfo {
  sender_type: UserType;
  sender_id: number;
  sender_name: string;
}

// Base interface for chat participants
export interface ChatParticipant {
  initiator_type: UserType;
  initiator_id: number;
  recipient_type: UserType;
  recipient_id: number;
}

export interface MessagesConversation {
  initiator_name: string;
  recipient_name: string;
  messages: Message[];
}

// Message interface
export interface Message extends TimestampedEntity {
  id: number;
  chat_id: number;
  sender_type: UserType;
  sender_id: number;
  message: string;
  image_url: string | null;
  read_status: ReadStatus;
  sender_name: string;
}

// Conversation interface
export interface Conversation extends ChatParticipant, TimestampedEntity {
  id: number;
  reason: string;
  priority: Priority;
  status: ChatStatus;
  initiator_last_read: number;
  recipient_last_read: number;
  other_party_name: string;
  unread_count: number;
  last_message: string;
  last_message_time: string;
  is_initiator: boolean;
}

// API Response interfaces
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export type ConversationsResponse = ApiResponse<Conversation[]>;
export type MessagesResponse = ApiResponse<MessagesConversation>;
export type AdminMessagesResponse = ApiResponse<MessagesConversation>;

export interface SendMessageRequest {
  chat_id: number;
  message: string;
  image?: File | null;
}

export interface UpdateReadStatusRequest {
  chat_id: number;
  last_read_message_id: number;
}

export interface InitiateConversationRequest {
  recipient_type: UserType;
  recipient_id: number;
  reason: string;
  priority: Priority;
}

export interface AdminInitiateConversationRequest {
  recipient_type: Exclude<UserType, "admin">;
  recipient_id: number;
  reason: string;
}
