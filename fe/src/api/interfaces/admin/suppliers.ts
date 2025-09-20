// Add these interfaces to your admin interfaces
export interface Supplier {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  organization_number: string;
  contact_person: string;
  reg_status: "pending" | "active" | "rejected";
  created_at: string;
}

export interface SuppliersResponse {
  message: string;
  count: number;
  activeCount: number;
  pendingCount: number;
  suppliers: Supplier[];
}

export interface UpdateSupplierStatusRequest {
  supplier_id: number;
}

export interface SupplierOrder {
  order_id: string;
  quotation_id: number;
  bid_id: number;
  quotation_type: string;
  location: string;
  bids: string;
  payment_method: string;
  payment_status: string;
  total_amount: string;
  order_status: string;
  order_date: string;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
}

export interface SupplierRatings {
  total_reviews: number;
  average_rating: string;
  total_issues: number;
  total_damages: number;
}

export interface SupplierDetails {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  organization_number: string;
  contact_person: string;
  reg_status: string;
  created_at: string;
  bank: string;
  account_number: string;
  iban: string;
  swift_code: string;
  started_year: number;
  trucks: number;
  about_us: string;
}

export interface SupplierDetailResponse {
  message: string;
  supplier: SupplierDetails;
  uploaded_documents: string[];
  orders: SupplierOrder[];
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  ratings: SupplierRatings;
  totalDisputes: number;
}
