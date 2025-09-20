"use client";

import { Button } from "@/components/ui/button";
import { useFetchMyOrderById } from "@/hooks/customer/useFetchMyOrders";
import { formatNumber } from "@/lib/formatNumber";
import { Box, ChevronLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { capitalizeWords } from "@/lib/capitalizeWords";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PinSheet } from "@/components/PinSheet";
import { useState } from "react";
import Image from "next/image";
import { useInitiateConversation } from "@/hooks/customer/useInitiateConversation";
import StarRating from "@/components/StarRating";
import api, { ErrorResponse, handleMutationError } from "@/api/index";
import { AxiosError } from "axios";
import { useFetchReviews } from "@/hooks/customer/useFetchReviews";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InitiateChatButton } from "@/components/InitiateChatButton";
import { useLocale, useTranslations } from "next-intl";
import { formatDateLocale } from "@/lib/formatDateLocale";
import { useParams } from "next/navigation";
import { formatToQuotationType } from "@/lib/formatToQuotationType";

export default function OrderDetails() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");

  const {
    data: order,
    isPending: isOrderPending,
    error: orderError,
  } = useFetchMyOrderById(id);
  const {
    data,
    isPending: isReviewsPending,
    error: reviewsError,
  } = useFetchReviews();
  const reviews = data?.reviews;
  const hasReview = false;
  const myReview = reviews?.find(
    (review) => review.order_id === order?.order_id
  );
  const [isPinSheetOpen, setIsPinSheetOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (pin: string) => {
      const response = await api.post("api/customers/update-order-status", {
        order_id: order?.order_id,
        order_pin: pin.toString(),
        status: order?.order_status === "pending" ? "failed" : "completed",
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        locale === "en"
          ? "Order status updated successfully!"
          : "Orderstatus har uppdaterats"
      );
      setIsPinSheetOpen(false);
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["customer-order", order?.order_id],
      });
      if (isPinSheetOpen) {
        router.refresh();
      } else {
        router.push("/customer/orders");
      }
    },
    onError: (err: AxiosError<ErrorResponse>) => {
      handleMutationError(err, locale);
    },
  });

  const handlePinComplete = (pin: string) => {
    mutation.mutate(pin);
  };

  const handleAcceptBid = (bidId?: string) => {
    if (!bidId) return;
    setIsPinSheetOpen(true);
  };

  const rejectBid = useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/customers/reject-bid", {
        bid_id: order?.bid_id,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        locale === "en" ? "Bid rejected successfully!" : "Budet avvisades"
      );
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["customer-order", order?.order_id],
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<ErrorResponse, any>) =>
      handleMutationError(error, locale),
  });

  const renderButtons = () => {
    const buttonClass = "w-full bg-primary text-white rounded-md";
    const firstButton = () => {
      if (order?.order_status === "failed") {
        return <Button disabled>{t("orderDetails.confirmOrder")}</Button>;
      }

      if (
        order?.payment_status === "pending" ||
        order?.payment_status === "awaiting_initial_payment" ||
        order?.payment_status === "initial_paid"
      ) {
        return (
          <Button
            onClick={() =>
              router.push(
                `/customer/payment/${order?.order_id}?bid_id=${order?.bid_id}`
              )
            }
          >
            {t("orderDetails.payNow")}
          </Button>
        );
      }

      if (order?.order_status === "delivered") {
        return (
          <Button
            onClick={() => handleAcceptBid(order?.order_id)}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t("orderDetails.processing")
              : t("orderDetails.confirmOrder")}
          </Button>
        );
      }

      return <Button disabled>{t("orderDetails.confirmOrder")}</Button>;
    };

    const secondButton = () => {
      if (order?.order_status === "completed") {
        return hasReview ? (
          <div>
            <StarRating rating={Number(myReview?.rating)} />
          </div>
        ) : (
          <Link href={`/customer/rate-order?order_id=${order?.order_id}`}>
            <Button className={buttonClass}>
              {t("orderDetails.rateOrder")}
            </Button>
          </Link>
        );
      }

      if (order?.order_status === "failed") {
        return <Button disabled>{t("orderDetails.orderFailed")}</Button>;
      }

      if (
        order?.payment_status === "awaiting_initial_payment" &&
        order?.order_status === "accepted"
      ) {
        return (
          <Button
            className={cn(
              buttonClass,
              "bg-white text-red-500 border hover:text-white border-red-500"
            )}
            onClick={() => setIsRejectModalOpen(true)}
            disabled={rejectBid.isPending}
          >
            {rejectBid.isPending
              ? t("orderDetails.rejecting")
              : t("orderDetails.reject")}
          </Button>
        );
      }

      if (order?.order_status === "pending") {
        return (
          <Button
            className={cn(
              buttonClass,
              "bg-white text-red-500 border hover:text-white border-red-500"
            )}
            onClick={() => setIsRejectModalOpen(true)}
            disabled={rejectBid.isPending}
          >
            {rejectBid.isPending
              ? t("orderDetails.rejecting")
              : t("orderDetails.reject")}
          </Button>
        );
      }

      return (
        <Button
          className={cn(
            "bg-white text-primary border border-primary",
            buttonClass
          )}
          disabled={
            !["ongoing", "delivered"].includes(order?.order_status || "")
          }
          onClick={() =>
            router.push(`/customer/raise-dispute?order_id=${order?.order_id}`)
          }
        >
          {t("orderDetails.fileAppeal")}
        </Button>
      );
    };

    return (
      <>
        <div className="grid grid-cols-2 items-center gap-4">
          {firstButton()}
          {secondButton()}
        </div>
      </>
    );
  };

  if (isOrderPending || isReviewsPending) {
    return <FullPageLoader />;
  }

  if (orderError || reviewsError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="border border-red-500 p-4 rounded-md">
          <p className="text-red-500">{t("orderDetails.errorFetching")}</p>
          <Button onClick={() => router.refresh()}>
            {t("orderDetails.tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-[#EC1B25] md:rounded-[10px] rounded-b-[24px] p-4 mb-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Order Info */}
          <div className="flex md:flex-row flex-col items-center mb-8">
            <div className="flex gap-x-4 items-start w-full md:w-auto justify-start">
              <div className="bg-white flex justify-center items-center rounded-full w-12 h-12">
                <Box size={24} color="red" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{order?.order_id}</h2>
                <p className="font-bold">
                  {t("orderDetails.paymentStatusLabel")}:{" "}
                  {tCommon(`paymentStatus.${order?.payment_status}`)}
                </p>
              </div>
            </div>

            <span
              className={cn(
                "ml-auto px-4 py-1 mt-14 rounded-full",
                order?.order_status === "ongoing"
                  ? "bg-yellow-100 text-yellow-600"
                  : order?.order_status === "delivered"
                    ? "bg-blue-100 text-blue-600"
                    : order?.order_status === "completed"
                      ? "bg-green-100 text-green-600"
                      : order?.order_status === "failed"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
              )}
            >
              {tCommon(`status.${order?.order_status || "pending"}`)}
            </span>
          </div>
        </div>

        {/* Mover Info */}
        <div className="flex justify-between items-center gap-4 mb-8 p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <Image
              width={48}
              height={48}
              src="/pp-placeholder.jpg"
              alt="Mover"
              className="rounded-full w-16 h-16"
            />
            <div>
              <h3 className="font-semibold">{order?.supplier_name}</h3>
              <p className="text-gray-600">
                {t("orderDetails.professionalMover")}
              </p>
            </div>
          </div>
          <InitiateChatButton
            isAdmin={false}
            recipientId={order.supplier_id}
            recipientType="supplier"
            senderType="customer"
          />
        </div>

        {/* Move Details */}
        <div className="space-y-4 px-6 md:px-6 mb-8 flex flex-col">
          <div className="flex flex-col">
            <span className="text-gray-600">
              {t("orderDetails.fromAddress")}
            </span>
            <span className="font-semibold">{order?.pickup_address}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600">{t("orderDetails.toAddress")}</span>
            <span className="font-semibold">{order?.delivery_address}</span>
          </div>
          <Separator />
        </div>

        {/* payment details */}
        <div className="space-y-4 px-6 md:px-6 mb-8 flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              {t("orderDetails.totalAmount")}
            </span>
            <span className="font-semibold">
              SEK {formatNumber(Number(order?.final_price))}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              {t("orderDetails.paymentStatusLabel")}
            </span>
            <span className="font-semibold">
              {tCommon(`paymentStatus.${order?.payment_status}`)}
            </span>
          </div>
          <Separator />
        </div>

        {/* logistics information */}

        <div>
          <h2 className="text-[16px] px-6 font-semibold mb-4">
            {t("orderDetails.logisticsInfo")}
          </h2>
          <div className="space-y-4 px-6 md:px-6 mb-8 flex flex-col">
            <div className="flex flex-col space-y-1">
              <span className="text-gray-600">
                {t("orderDetails.moveType")}
              </span>
              <span className="font-semibold">
                {tCommon(
                  `quotationTypes.${formatToQuotationType(order?.service_type)}`
                )}
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-gray-600">{tCommon("date.date")}</span>
              <span className="font-semibold">
                {formatDateLocale(order?.date, locale)}
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-gray-600">{t("orderDetails.items")}</span>
              <span className="font-semibold">
                {order?.items && order?.items.startsWith('"[')
                  ? order?.items
                      ?.replaceAll('"', "")
                      ?.replaceAll("[", "")
                      ?.replaceAll("]", "")
                      ?.replaceAll(",", ", ")
                      ?.replaceAll("\\", "")
                  : capitalizeWords(order?.items ?? "")}
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-gray-600">
                {t("orderDetails.distance")}
              </span>
              <span className="font-semibold">{order?.distance} km</span>
            </div>

            <Separator />
          </div>
        </div>

        {/* Review Section */}
        <div className="flex justify-center items-center gap-x-4  md:gap-x-8 px-6 mb-6">
          {renderButtons()}
        </div>

        <PinSheet
          isOpen={isPinSheetOpen}
          onClose={() => setIsPinSheetOpen(false)}
          onComplete={handlePinComplete}
        />

        <RejectConfirmationModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={() => {
            rejectBid.mutate();
            setIsRejectModalOpen(false);
          }}
          isPending={rejectBid.isPending}
          t={t}
        />
      </div>
    </div>
  );
}

interface ChatButtonProps {
  supplierId: number;
}

export const ChatButton = ({ supplierId }: ChatButtonProps) => {
  const { mutate: initiateChat, isPending } = useInitiateConversation();
  const t = useTranslations("customers.orderDetails");

  return (
    <Button
      variant="outline"
      onClick={() => initiateChat(supplierId)}
      disabled={isPending}
    >
      {isPending ? t("connecting") : t("messageSupplier")}
    </Button>
  );
};

export const acceptBid = async (bidId: string) => {
  const response = await api.post("/api/bids/accept", { bid_id: bidId });
  return response.data;
};

const RejectConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  t: ReturnType<typeof useTranslations<"customers.orderDetails">>;
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("rejectModal.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("rejectModal.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("rejectModal.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isPending ? t("rejecting") : t("rejectModal.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
