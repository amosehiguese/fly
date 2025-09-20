export interface Order {
  order_id: string;
  pickup_location: string;
  delivery_location: string;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  dispute_id: number;
  reason: string;
  status: "pending" | "resolved";
  updated_at: string;
  order_id: string;
}

export interface SupplierDetails {
  company_name: string;
  contact_person: string;
  email: string;
  postal_code: string;
  city: string;
  organization_number: string;
  about_us: string;
}

export interface DashboardData {
  orders: Order[];
  disputes: Dispute[];
  supplier_details: SupplierDetails;
}

export interface FetchDashboardResponse {
  message: string;
  data: DashboardData;
  pagination: pagination;
}

export type OrderStatus =
  | "accepted"
  | "ongoing"
  | "delivered"
  | "failed"
  | "completed";

export interface OngoingOrderRequest {
  order_id: string;
}

export interface OngoingOrderResponse {
  supplier_id: number;
  supplier_name: string;
  order_id: string;
  bid_created_at: string;
  bid_approved_date: string | null;
  supplier_notes: string;
  estimated_completion_date: string;
  moving_cost: string;
  payment_status: string;
  order_status: string;
  id: number;
  service_type: string;
  pickup_address: string;
  distance: string;
  delivery_address: string;
  date: string;
  latest_date: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  customer_id: number;
  services: string;
  status: string;
  table_name: string;
  estimated_completed_date: string;
  quotation_type: string;
  from_city: string;
  to_city: string;
}

export interface UpdateOrderStatusRequest {
  order_id: string;
  status: OrderStatus;
}

export interface UpdateOrderStatusResponse {
  message: string;
  messageSv?: string;
  data: {
    order_id: string;
    status: Exclude<OrderStatus, "failed" | "completed" | "accepted">;
    updated_at: string;
  };
}

export interface SendBidRequest {
  quotation_id: string;
  quotation_type: string;
  moving_cost: string;
  truck_cost: string;
  additional_services: string;
  supplier_notes: string;
  estimated_pickup_date_from: string;
  estimated_pickup_date_to: string;
  estimated_delivery_date_from: string;
  estimated_delivery_date_to: string;
}

export interface SendBidResponse {
  message: string;
  bidId: number;
}

export interface MarketplaceQuotation {
  id: number;
  table_name: string;
  pickup_address: string;
  delivery_address: string;
  move_date: string;
  service_type: string;
  status: string;
  created_at: string;
}

export interface MarketplaceBid {
  bid_id: number;
  supplier_id: number;
  bid_price: string;
  total_price: string;
  additional_notes: string | null;
  bid_created_at: string;
  bid_status: "accepted" | "rejected" | "pending";
}

export interface pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface MarketplaceItem {
  quotation: MarketplaceQuotation;
  bids: MarketplaceBid[];
}

export interface MarketplaceResponse {
  message: string;
  marketplace: MarketplaceItem[];
  hasMore?: boolean;
  pagination: pagination;
}

export interface MarketplaceFilters {
  from_city?: string;
  to_city?: string;
  move_date?: string;
  type_of_service?: string;
  page?: number;
}
