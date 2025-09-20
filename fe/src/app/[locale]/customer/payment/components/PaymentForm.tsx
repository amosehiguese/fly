import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const PaymentForm = ({
  handleSuccess,
  orderId,
}: {
  handleSuccess: () => void;
  clientSecret: string;
  orderId: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Add loading state
  const tCommon = useTranslations("common");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.log("stripe or elements not found");
      return;
    }

    setIsProcessing(true); // Set loading state to true

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}customer/payment/success?order_id=${orderId}`,
      },
    });

    if (error) {
      setIsProcessing(false);
      setErrorMessage(error.message || tCommon("payment.paymentFailed"));
      toast.error(error.message || tCommon("payment.paymentFailed"));
    } else {
      setIsProcessing(false);
      handleSuccess();
    }
  };

  return (
    <form>
      <PaymentElement />
      <Button
        onClick={handleSubmit}
        disabled={!stripe || !elements}
        className="w-full mt-4"
      >
        {isProcessing
          ? tCommon("buttons.processing")
          : tCommon("buttons.payNow")}
      </Button>
      {errorMessage && <div className="error">{errorMessage}</div>}
    </form>
  );
};

export default PaymentForm;
