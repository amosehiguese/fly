export interface CheckoutData {
  order_id: string;
  customer_name: string;
  from_address: string;
  delivery_address: string;
  phone: string;
  total_price: number;
  rut_discount_applied: boolean;
  rut_deduction: number;
  amount_to_pay: number;
  remaining_balance: number;
  payment_status: string;
  moving_cost: number;
  additional_services: number;
  truck_cost: number;
  extra_insurance: boolean;
  insurance_cost: number;
  ssn: string;
}

export type CheckoutResponse = CheckoutData;
