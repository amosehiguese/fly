import { Quotation } from "./quotations";

export interface Order {
  order_id: string;
  quotation_id: number;
  bid_id: number;
  service_type: string;
  pickup_address: string;
  delivery_address: string;
  first_name: string;
  last_name: string;
  customer_email: string;
  customer_phone: string;
  services: string[];
  quotation_status: "awarded" | "open";
  supplier_id: number;
  supplier_name: string;
  date: string;
  latest_date: string;
  bid_created_at: string;
  bid_approved_date: string;
  supplier_notes: string;
  estimated_completion_date: string;
  final_price: number;
  payment_status: "awaiting_initial_payment" | "completed" | "pending";
  order_status: "accepted" | "pending" | "rejected";
  initial_payment_date: string | null;
  remaining_payment_date: string | null;
}

export interface OrdersResponse {
  message: string;
  pagination: Pagination;
  data: Order[];
}

export interface OrderResponse {
  message: string;
  data: {
    order_id: string;
    bid_id: number;
    distance: string;
    payment_status: string | null;
    total_price: number | null;
    customer_id: number;
    supplier: Supplier;
    quotation: Quotation;
  };
}

interface Supplier {
  id: number;
  name: string;
  average_rating: number;
  total_reviews: number;
}

export interface Pagination {
  totalOrders: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface CheckoutResponse {
  order_id: string;
  customer_name: string;
  from_address: string;
  delivery_address: string;
  phone: string;
  total_price: string;
  amount_paid: string;
  remaining_balance: string;
  rut_discount_applied: number;
  rut_deduction: string;
  payment_status: string;
}
