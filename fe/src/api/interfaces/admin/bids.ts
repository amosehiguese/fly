// Interface for a bid in a list (BidsResponse)
export interface BidList {
  bid_id: number;
  supplier_id: number;
  supplier_name: string;
  quotation_type: string;
  moving_cost: string;
  additional_notes: string;
  bid_status: "accepted" | "rejected" | "pending" | "approved";
  bid_created_at: string;
  final_price: string | null;
  initial_payment_date: string | null;
  remaining_payment_date: string | null;
  type: string;
}

// Interface for a single bid (BidResponse)
export interface Bid extends Omit<BidList, "final_price"> {
  supplier_id: number;
  supplier_phone: string;
  supplier_email: string;
  supplier_address: string;
  quotation_files: string[] | string;
  order_id: string;
  quotation_id: number;
  customer_email: string;
  avg_rating: string | null;
  moving_cost: string;
  truck_cost: string;
  additional_services: string;
  total_price: string;
}

export interface BidsResponse {
  message: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: BidList[];
}

export interface BidResponse {
  message: string;
  data: Bid;
}

export interface BidApprovalRequestBody {
  bid_id: number;
  moving_price_percentage: number;
  additional_service_percentage: number;
  truck_cost_percentage: number;
}
