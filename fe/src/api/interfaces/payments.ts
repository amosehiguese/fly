export interface CreatePaymentIntentRequest {
  bid_id: string;
  customer_email: string;
  payment_method_id: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}
