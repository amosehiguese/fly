export interface SupplierDashboardData {
  supplier_details: SupplierDetails;
  orders: Order[];
  disputes: Dispute[];
  filters: Filters;
  pagination: Pagination;
  supplier_id: number;
}

interface SupplierDetails {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  organization_number: string;
  about_us: string;
  supplier_id: number;
}

interface Order {
  order_id: string;
  pickup_location: string | null;
  delivery_location: string | null;
  order_status: string;
  created_at: string;
  updated_at: string;
}

interface Dispute {
  dispute_id: number;
  reason: string;
  status: string;
  updated_at: string;
  order_id: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

interface Filters {
  applied: {
    location: string | null;
    order_status: string | null;
  };
}

export interface SupplierDashboardResponse {
  message: string;
  data: SupplierDashboardData;
  pagination: Pagination;
}
