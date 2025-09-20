export type JobStatus = "available" | "pending" | "in-transit" | "completed";

export type MoveType = "Local Move" | "International Move" | "Office Move";

export interface Job {
  id: string;
  status: "available" | "pending" | "in-transit" | "completed";
  pickup: {
    city: string;
    address: string;
  };
  delivery: {
    city: string;
    address: string;
  };
  moveType: string;
  distance: string;
  hasFragileItems: boolean;
  amount?: number;
  paymentType?: string;
  date?: string;
  flexibleDate?: string;
  moveDescription?: string;
  expectations?: string;
  customerStatus?: string;
}

export interface Dispute {
  id: string;
  reason: string;
  updatedOn: string;
  status: "resolved" | "in-review" | "pending";
  jobId: string;
}

export interface QuoteRequest {
  id: string;
  fromAddress: string;
  toAddress: string;
  moveType: MoveType;
  date: string;
  flexibleDate?: string;
  description?: string;
  expectations?: string;
  status?: string;
  totalPrice?: number;
}
