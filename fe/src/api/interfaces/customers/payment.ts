export interface PaymentSheetResponse {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
  publishableKey: string;
  bid_details: {
    amount: number;
    supplier_name: string;
    quotation_type: string;
  };
}
