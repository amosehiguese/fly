"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useSupplierOngoingOrder,
  useSupplierUpdateOrderStatus,
} from "@/hooks/supplier";
import { FullPageLoader } from "@/components/ui/loading/FullPageLoader";
import { parseArrayField } from "@/lib/parseArrayField";
import { InitiateChatButton } from "@/components/InitiateChatButton";
import { useTranslations } from "next-intl";

const quotationType = (type: string) => {
  if (type === "Private Move") return "privateMove";
  if (type === "Secrecy Move") return "secrecyMove";
  if (type === "Evacuation Move") return "evacuationMove";
  if (type === "Estate Clearance") return "estateClearance";
  if (type === "Company Relocation") return "companyRelocation";
  if (type === "Heavy Lifting") return "heavyLifting";
  if (type === "Move-out Cleaning") return "moveOutCleaning";
  return "";
};

export default function OrderDetails() {
  const router = useRouter();
  const tCommon = useTranslations("common");
  const t = useTranslations("supplier.orderDetails");
  const t2 = useTranslations("quotation");
  const { id } = useParams<{ id: string }>();
  const [selectedStatus, setSelectedStatus] = useState<"ongoing" | "delivered">(
    "ongoing"
  );

  const { data: orderResponse, isLoading: isOrderLoading } =
    useSupplierOngoingOrder({ order_id: id });

  const {
    mutate: updateOrderStatusMutate,
    isPending: updateOrderStatusPending,
  } = useSupplierUpdateOrderStatus();

  const order = orderResponse?.data;
  const isCompleted = order?.status === "completed";

  const handleUpdateStatus = () => {
    updateOrderStatusMutate({
      order_id: id,
      status: selectedStatus,
    });
  };

  if (isOrderLoading) {
    return <FullPageLoader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold">
            {t("orderDetails")}
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 sm:px-6 space-y-6"
        >
          {/* Status Update Section */}
          <div
            className={cn(
              "rounded-lg border p-4 sm:p-6 space-y-4",
              "transform transition-all duration-200 hover:shadow-md"
            )}
          >
            <h2 className="text-lg sm:text-xl font-medium">
              {t("updateOrderStatus")}
            </h2>
            <Select
              disabled={isCompleted}
              value={selectedStatus}
              onValueChange={(value: "ongoing" | "delivered") =>
                setSelectedStatus(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">
                  {tCommon("status.ongoing")}
                </SelectItem>
                <SelectItem value="delivered">
                  {tCommon("status.delivered")}
                </SelectItem>
              </SelectContent>
            </Select>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleUpdateStatus}
                disabled={
                  isCompleted ||
                  updateOrderStatusPending ||
                  order?.payment_status === "awaiting_initial_payment"
                }
                className={cn(
                  "w-full transition-all duration-200",
                  "bg-primary hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {updateOrderStatusPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    ⟳
                  </motion.div>
                ) : (
                  t("updateStatus")
                )}
              </Button>
            </motion.div>
            {order?.payment_status === "awaiting_initial_payment" && (
              <p className="text-sm text-red-500">
                {t("waitForInitialPayment")}
              </p>
            )}
          </div>

          <InitiateChatButton
            isAdmin={false}
            recipientId={order?.customer_id}
            recipientType="customer"
            senderType="supplier"
          />

          {/* Order Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-medium">{t("orderInformation")}</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t("orderId")}</p>
                  <p className="font-medium">{order?.order_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("serviceType")}</p>
                  <p className="font-medium">
                    {order?.service_type
                      ? t2(`${quotationType(order?.service_type || "")}.title`)
                      : t("nA")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("paymentStatus")}</p>
                  <p className="font-medium capitalize">
                    {order?.payment_status
                      ? tCommon(`paymentStatus.${order?.payment_status}`)
                      : t("nA")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("orderStatus")}</p>
                  <p className="font-medium capitalize">
                    {order?.order_status
                      ? tCommon(`status.${order?.order_status}`)
                      : t("nA")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-medium">{t("customerDetails")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t("customerName")}</p>
                  <p className="font-medium">{order?.name || "Kustomer"} </p>
                </div>
                <div className="">
                  <p className="text-sm text-gray-500">{t("contact")}</p>
                  <p className="font-medium">{order?.phone}</p>
                  <p className="text-sm text-wrap">{order?.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-medium">{t("movingDetails")}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">{t("pickupAddress")}</p>
                  <p className="font-medium">{order?.pickup_address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("deliveryAddress")}
                  </p>
                  <p className="font-medium">{order?.delivery_address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("distance")}</p>
                  <p className="font-medium">{`${(Number(order?.distance) / 1000).toFixed(2)} km`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("movingCost")}</p>
                  <p className="font-medium">{`${order?.moving_cost}`} SEK</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-medium">{t("schedule")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t("preferredDate")}</p>
                  <p className="font-medium">
                    {order?.date
                      ? new Date(order?.date).toLocaleDateString()
                      : t("nA")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t("latestDate")}</p>
                  <p className="font-medium">
                    {order?.latest_date
                      ? new Date(order?.latest_date).toLocaleDateString()
                      : t("nA")}
                  </p>
                </div>
                {/* <div>
                  <p className="text-sm text-gray-500">
                    {t("estimatedCompletion")}
                  </p>
                  <p className="font-medium">
                    {new Date(
                      order?.estimated_completion_date || ""
                    ).toLocaleDateString()}
                  </p>
                </div> */}
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-xl font-medium">{t("additionalServices")}</h2>
              <div className="flex flex-wrap gap-2">
                {parseArrayField(order?.services || "[]").map(
                  (service: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {t2(
                        `${quotationType(order?.service_type || "")}.services.${service}`
                      )}
                    </span>
                  )
                )}
              </div>
            </div>

            {order?.supplier_notes && (
              <div className="rounded-lg border p-6 space-y-4">
                <h2 className="text-xl font-medium">{t("notes")}</h2>
                <p>{order?.supplier_notes}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
