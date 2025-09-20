import { useMutation } from "@tanstack/react-query";
import { createPaymentIntent } from "@/api/payments";
import type { CreatePaymentIntentRequest } from "@/api/interfaces/payments";

export const usePayment = () => {
  return useMutation({
    mutationFn: (data: CreatePaymentIntentRequest) => createPaymentIntent(data),
  });
};
