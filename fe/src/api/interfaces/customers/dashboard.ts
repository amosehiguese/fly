// Base interfaces for common properties
export interface BaseQuotation {
  id: number;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  latest_date: string;
  service_type: string[];
}

// User interface
export interface User {
  id: number;
  iat: number;
  exp: number;
  fullname: string | null;
  email: string;
  phone_number: string;
}

// Quotations by service type
export interface QuotationResults {
  companyRelocation: BaseQuotation[];
  moveOutCleaning: BaseQuotation[];
  storage: BaseQuotation[];
  heavyLifting: BaseQuotation[];
  carryingAssistance: BaseQuotation[];
  junkRemoval: BaseQuotation[];
  estateClearance: BaseQuotation[];
  evacuationMove: BaseQuotation[];
  privacyMove: BaseQuotation[];
}

export interface MyDispute {
  dispute_id: number;
  reason: string;
  request_details: string;
  dispute_status: string;
  // images: string[];
  dispute_created_at: string;
  // updated_at: string;
  order_id: string;
  supplier_name: string;
  supplier_phone: string;
  supplier_email: string;
  total_price: number;
  order_status: string;
  payment_status: string;
  order_created_at: string; // Date string in ISO 8601 format (e.g., 2025-01-06T00:09:36.000Z)
  pickup_address: string;
  delivery_address: string;
  latest_date: string; // Date string in ISO 8601 format (e.g., 2023-09-30T00:00:00.000Z)
  services: string | string[];
  service_type: string;
}

export interface MyOrder {
  order_id: string;
  mover_name: string;
  mover_contact: string;
  mover_email: string;
  total_price: number;
  order_status: string;
  order_created_at: string;
  payment_status: string;
  pickup_address: string;
  delivery_address: string;
  latest_date: string; // Date string in ISO 8601 format (e.g., 2024-01-05T00:00:00.000Z)
  services: string | string[];
  service_type: string;
}

export interface MyStats {
  totalQuotations: number;
  totalOrders: number;
  // pendingOrders: string;
  // approvedOrders: string;
  // completedOrders: string;
  // paidOrders: string;
  totalDisputes: number;
}

// export interface MyQuotation {

//     id: number
//     quotation_type: string
//     from_city: string
//     to_city: string
//     move_date: string
//     type_of_service: string
//     status: string
//     created_at: string
//     email_address: string

// }

// Main dashboard interface
export interface DashboardData {
  totalQuotations: number;
  disputes: MyDispute[];
  quotations: QuotationResults;
  orders: MyOrder[];
}

// API response interface
export interface DashboardResponse {
  status: number;
  message: string;
  user: User;
  data: DashboardData;
  stats: MyStats;
  error?: string;
}
