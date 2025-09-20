import { ErrorResponse, handleMutationError } from "@/api";
import { PaymentSheetResponse } from "@/api/interfaces/customers/payment";
import { paymentService } from "@/api/payments";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useLocale } from "next-intl";

export const usePaymentSheet = (
  bid_id: string,
  customer_email: string,
  handleSuccess: (data: PaymentSheetResponse) => void
) => {
  // Get the payment intent from your server
  const locale = useLocale();
  const { mutate, isPending, error, data } = useMutation({
    mutationKey: ["payment-sheet", bid_id],
    mutationFn: () => paymentService.createPaymentSheet(bid_id, customer_email),
    onSuccess: (data) => {
      handleSuccess(data);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<ErrorResponse, any>) =>
      handleMutationError(error, locale),
  });

  return {
    mutate,
    data,
    isPending,
    error,
  };
};
