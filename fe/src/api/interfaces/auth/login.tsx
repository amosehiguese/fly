export interface LoginRequestBody {
  identifier: string;
  password: string;
}

export interface AdminLoginRequestBody {
  username: string;
  password: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: "super_admin" | "support_admin" | "financial_admin";
}

export interface User {
  fullname: string;
  email: string;
  phone_number: string;
  role: "customer" | "supplier";
}

export interface SupplierLoginRequestBody {
  identifier: string;
  password: string;
}

export interface SupplierUser {
  id: number;
  company_name: string;
  email: string;
  phone: string;
}
