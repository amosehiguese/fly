export interface Dispute {
  dispute_id: number;
  reason: string;
  request_details: string;
  status: DisputeStatus;
  created_at: string;
  quotation_type: string;
  transaction_amount: string;
  supplier_name: string;
  submitted_by: string;
  images: string[];
}

export interface DisputeSupplier {
  dispute_id: number;
  order_id: string;
  dispute_status: string;
  dispute_created_at: string;
  supplier_name: string;
  latest_message: string;
  latest_sender: string;
}

export interface DisputesResponse {
  message: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: DisputeSupplier[];
}

export interface DisputeResponse {
  message: string;
  data: Dispute;
}

export type DisputeStatus = "pending" | "under_review" | "resolved";
