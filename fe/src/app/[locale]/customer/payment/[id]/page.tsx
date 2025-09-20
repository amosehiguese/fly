"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, PenSquare } from "lucide-react";
import { useCheckout } from "@/hooks/customer/useCheckout";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import SuccessModal from "@/components/ui/success-modal";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import PaymentForm from "../components/PaymentForm";
import { usePaymentSheet } from "@/hooks/customer/usePaymentSheet";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import { Card } from "@/components/ui/card";
import { useParams, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function PaymentPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const bid_id = searchParams.get("bid_id");
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const t = useTranslations("customers.payment");
  const locale = useLocale();
  // console.log("bid_id", bid_id);

  const handlePaymentSuccess = () => {
    setIsPaymentSuccess(true);
  };

  const {
    data: myDashboard,
    isLoading: myDashboardLoading,
    error: myDashboardError,
  } = useCustomerDashboard();

  const {
    data: checkoutData,
    isPending: checkoutLoading,
    error: checkoutError,
  } = useCheckout(id);
  const {
    data: paymentSheetData,
    mutate,
    isPending: isPaymentSheetPending,
    error: paymentSheetError,
  } = usePaymentSheet(bid_id || "", myDashboard?.user.email || "", () =>
    console.log("payment sheet data")
  );

  // const { clientSecret } = usePaymentSheet(
  //   id.split("-")[2],
  //   myDashboard?.user.email || ""
  // );

  // useEffect(() => {
  //   if (checkoutData) {
  //     toast.info(JSON.stringify(checkoutData), { duration: 20000 });
  //   } else if (checkoutError) {
  //     toast.error(JSON.stringify(checkoutError.response?.data?.error));
  //   }
  // }, [checkoutData, checkoutError]);

  useEffect(() => {
    if (bid_id && myDashboard?.user.email) {
      mutate();
    }
  }, [bid_id, myDashboard?.user.email]);

  const options: StripeElementsOptions = {
    // passing the client secret obtained from the server
    // mode: "payment",
    locale: locale || "sv",
    return_url: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/customer/payment/success?order_id=${checkoutData?.order_id}`,
    clientSecret: paymentSheetData?.paymentIntent,
  };

  if (myDashboardLoading || checkoutLoading || isPaymentSheetPending) {
    return <FullPageLoader />;
  }
  if (myDashboardError || checkoutError || paymentSheetError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="border border-red-500 p-4 rounded-md">
          <p className="text-red-500">{t("loadingError")}</p>
        </div>
      </div>
    );
  }

  return (
    paymentSheetData?.paymentIntent && (
      <Elements stripe={stripePromise} options={options}>
        <div className="min-h-screen bg-white">
          {/* Header */}
          <header className="sticky top-0 bg-white border-b p-4 z-20 backdrop-blur-sm bg-opacity-50">
            <div className="flex items-center max-w-lg mx-auto">
              <button className="p-2 -ml-2">
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-semibold text-center flex-1 mr-8">
                {t("checkout")}
              </h1>
            </div>
          </header>

          <main className="max-w-lg mx-auto p-4 space-y-6">
            {/* Customer Info Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold">
                      {checkoutData?.customer_name}
                    </h2>
                    <p className="text-gray-600">{checkoutData?.phone}</p>
                    <p className="text-sm text-gray-500">
                      {t("orderIdLabel")} {checkoutData?.order_id}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <PenSquare className="h-5 w-5 text-gray-900" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Order Notice */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 leading-relaxed">
                {t("orderNotice")}
              </p>
              {checkoutData?.rut_discount_applied && (
                <p className="text-sm text-blue-600 mt-2">{t("rutNotice")}</p>
              )}
            </div>

            {/* Pickup & Delivery */}
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {t("pickupLocationTitle")}
                  </h3>
                  <p className="text-gray-600">{checkoutData?.from_address}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {t("deliveryLocationTitle")}
                  </h3>
                  <p className="text-gray-600">
                    {checkoutData?.delivery_address}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-lg">
                  {t("priceBreakdown.movingCost")}
                </span>
                <span className="text-lg">SEK {checkoutData?.moving_cost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg">
                  {t("priceBreakdown.additionalServices")}
                </span>
                <span className="text-lg">
                  SEK {checkoutData?.additional_services}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg">{t("priceBreakdown.truckCost")}</span>
                <span className="text-lg">SEK {checkoutData?.truck_cost}</span>
              </div>
              {
                //@ts-expect-error - key is not type-safe but works at runtime

                checkoutData?.extra_insurance === 1 && (
                  <div className="flex justify-between">
                    <span className="text-lg">
                      {t("priceBreakdown.extraInsurance")}
                    </span>
                    <span className="text-lg">
                      SEK {checkoutData?.insurance_cost}
                    </span>
                  </div>
                )
              }
              <div className="flex justify-between">
                <span className="text-lg">
                  {t("priceBreakdown.totalPrice")}
                </span>
                <span className="text-lg">SEK {checkoutData?.total_price}</span>
              </div>
              {checkoutData?.rut_discount_applied && (
                <div className="flex justify-between text-green-600">
                  <span className="text-lg">
                    {t("priceBreakdown.taxDeduction")}
                  </span>
                  <span className="text-lg">
                    - SEK {checkoutData?.rut_deduction}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-lg">
                  {`${t("priceBreakdown.amountToPayNow", {
                    percentage:
                      checkoutData?.payment_status ===
                      "awaiting_initial_payment"
                        ? "20"
                        : "80",
                  })}`}
                </span>
                <span className="text-lg">
                  SEK {checkoutData?.amount_to_pay}
                </span>
              </div>
              {checkoutData?.remaining_balance &&
                checkoutData?.remaining_balance > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span className="text-lg">
                      {t("priceBreakdown.remainingBalance")}
                    </span>
                    <span className="text-lg">
                      SEK {checkoutData?.remaining_balance}
                    </span>
                  </div>
                )}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span className="text-lg">
                  {t("priceBreakdown.totalDueToday")}
                </span>
                <span className="text-lg">
                  SEK {checkoutData?.amount_to_pay}
                </span>
              </div>
            </div>

            {checkoutData?.ssn && (
              <div className="flex justify-between">
                <span className="text-lg">{t("priceBreakdown.ssn")}</span>
                <span className="text-lg border border-gray-300 rounded-md p-2">
                  {checkoutData?.ssn}
                </span>
              </div>
            )}

            <SuccessModal
              buttonText={t("successModal.buttonText")}
              onButtonClick={() => router.push(`/customer`)}
              isOpen={isPaymentSuccess}
              title={t("successModal.title")}
              description={t("successModal.description")}
            />

            <PaymentForm
              handleSuccess={handlePaymentSuccess}
              clientSecret={paymentSheetData?.paymentIntent}
              orderId={checkoutData?.order_id}
            />
          </main>
        </div>
      </Elements>
    )
  );
}
