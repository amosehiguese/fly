export interface SupplierDispute {
  id: string;
  order_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierDisputesResponse {
  message: string;
  data: SupplierDispute[];
}
