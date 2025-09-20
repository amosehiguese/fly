"use client";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { toast } from "sonner";

interface PaymentSheetProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function PaymentSheet({
  amount,
  onSuccess,
  onClose,
}: PaymentSheetProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Complete Payment</SheetTitle>
          <SheetDescription>
            Amount to pay: SEK {amount.toLocaleString()}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <PaymentElement />
          <Button
            type="submit"
            disabled={isProcessing || !stripe || !elements}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
