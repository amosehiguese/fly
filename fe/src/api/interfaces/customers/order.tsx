export interface SingleOrder {
  bid_id: number;
  order_id: string;
  supplier_name: string;
  supplier_id: number;
  final_price: number;
  order_created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  distance: number;
  order_status:
    | "pending"
    | "accepted"
    | "completed"
    | "ongoing"
    | "delivered"
    | "failed";
  service_type: string;
  date: string;
  payment_status: string;
  bid_created_at: string;
  bid_approved_date: string | null;
  pickup_address: string;
  delivery_address: string;
  quotation_status: "open" | "awarded";
  estimated_completed_date: string | null;
  services: string | string[];
  latest_date: string;
  items: string;
}
