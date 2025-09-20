export interface Bid {
  id: number;
  supplier_id: number;
  quotation_id: number;
  quotation_type: string;
  bid_price: string;
  additional_notes: string;
  status: "accepted" | "rejected" | "pending" | "approved";
  created_at: string;
  total_price: string;
  payment_status: string;
  stripe_payment_id: string | null;
  payment_intent_id: string | null;
  escrow_release_date: string | null;
  payment_captured: number;
  dispute_reason: string | null;
  auction_end_time: string | null;
  is_auction_bid: number;
  requires_payment_method: number;
  payment_method: string;
  disbursement_status: string;
  completion_date: string | null;
  supplier_name: string;
  supplier_phone: string;
  supplier_address: string;
  supplier_email: string;
}
