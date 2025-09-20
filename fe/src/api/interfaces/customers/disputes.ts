export interface MyDisputes {
  id: string;
  quotation_id: string;
  category: string;
  description: string;
  photo_url: string;
  status: "Pending" | "Resolved";
  created_at: string;
  resolved_at: string;
}
