import api from "./index";
import { PaymentSheetResponse } from "./interfaces/customers/payment";
import type {
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
} from "./interfaces/payments";

export const createPaymentIntent = async (
  data: CreatePaymentIntentRequest
): Promise<PaymentIntentResponse> => {
  const response = await api.post("/api/payments/create-intent", data);
  return response.data;
};

export const paymentService = {
  createPaymentSheet: async (
    bid_id: string,
    customer_email: string
  ): Promise<PaymentSheetResponse> => {
    const response = await api.post(`api/payment/payment-sheet`, {
      bid_id,
      customer_email,
    });
    return response.data;
  },
};
