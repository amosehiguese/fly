export interface Admin {
  id: number;
  username: string;
  role: string;
  created_at: string;
  firstname: string;
  lastname: string;
  phone_number: string;
}

export interface AdminRequest {
  username: string;
  role: "support_admin" | "finance_admin" | "super_admin";
  firstname: string;
  lastname: string;
  phone_number: string;
  password: string;
}
