export type NotificationType =
  | "profile_update"
  | "new_bid"
  | "bid_approved"
  | "bid_accepted"
  | "auction_won"
  | "auction_completed"
  | "payment"
  | "review"
  | "review_issue"
  | "bid_rejected"
  | "message"
  | "dispute"
  | "dispute_chat";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  reference_id: string;
  reference_type: string;
  is_read: number; // 0 for unread, 1 for read
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  message: string;
  unread_count: number;
  notifications: Notification[];
}

// Helper function to categorize notifications
export const getNotificationCategory = (type: NotificationType) => {
  switch (type) {
    case "new_bid":
    case "bid_approved":
    case "bid_accepted":
    case "bid_rejected":
      return "REQUESTS";
    case "auction_won":
    case "auction_completed":
    case "payment":
      return "ORDERS";
    case "dispute":
    case "dispute_chat":
      return "DISPUTES";
    default:
      return "ALL";
  }
};
