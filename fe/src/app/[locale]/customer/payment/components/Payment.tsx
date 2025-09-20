// import { usePaymentSheet } from "@/hooks/customer/usePaymentSheet";
// import { loadStripe } from "@stripe/stripe-js";
// import { useTranslations } from "next-intl";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";

// interface PaymentProps {
//   bid_id: string;
//   customer_email: string;
//   onSuccess?: () => void;
//   onError?: (error: Error) => void;
// }

// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
// );

// export const Payment = ({
//   bid_id,
//   customer_email,
//   onSuccess,
//   onError,
// }: PaymentProps) => {
//   const [isProcessing, setIsProcessing] = useState(false);
//   //   const { stripe, initPaymentSheet, confirmPayment, elements, isLoading } =
//   usePaymentSheet(bid_id, customer_email);

//   const [paymentElement, setPaymentElement] = useState<any>(null);
//   const tCommon = useTranslations("common");

//   useEffect(() => {
//     const setupPayment = async () => {
//       try {
//         const result = await initPaymentSheet();
//         console.log("result", result);
//         setPaymentElement(elements);
//       } catch (error) {
//         console.error("Setup error:", error);
//         onError?.(error as Error);
//       }
//     };

//     if (stripe && !isLoading) {
//       setupPayment();
//     }
//   }, [stripe, isLoading]);

//   const handlePayment = async () => {
//     try {
//       setIsProcessing(true);

//       // Confirm the payment
//       await confirmPayment();

//       toast.success("Payment successful!");
//       onSuccess?.();
//     } catch (error: any) {
//       console.error("Payment failed:", error);
//       toast.error(error.message || "Payment failed. Please try again.");
//       onError?.(error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (isLoading || !paymentElement) {
//     return <div>Loading payment form...</div>;
//   }

//   return (
//     <div className="w-full max-w-md mx-auto">
//       <div id="payment-element" className="mb-4">
//         {paymentElement}
//       </div>

//       <button
//         onClick={handlePayment}
//         disabled={isProcessing}
//         className={`
//           w-full px-4 py-2 text-white rounded-lg
//           ${
//             isProcessing
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-blue-600 hover:bg-blue-700"
//           }
//         `}
//       >
//         {isProcessing
//           ? tCommon("buttons.processing")
//           : tCommon("buttons.payNow")}
//       </button>
//     </div>
//   );
// };
