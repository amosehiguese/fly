"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDriverOrders } from "@/hooks/driver/useDriverOrders";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import ProofOfDeliveryDrawer from "@/components/driver/ProofOfDeliveryDrawer";

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { useOrderDetails, updateOrderStatus } = useDriverOrders();
  const { data, isPending, error } = useOrderDetails(id);
  const [status, setStatus] = useState("in-transit");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const t = useTranslations("driver");

  //   useEffect(() => {

  //   }, [])

  if (isPending)
    return (
      <div className="flex flex-1 justify-center items-center">
        {t("loadingInfo")}
      </div>
    );
  if (error || !data?.data)
    return (
      <div className="flex flex-1 justify-center items-center">
        {t("errorOccurred")}
      </div>
    );

  const q = data.data.quotation;
  const orderStatus = data.data.orderStatus.deliveryStatus;

  // Example: you may need to adjust these fields based on your actual data structure
  return (
    <div className="max-w-lg mx-auto p-4 bg-white min-h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-2">
        {t("order")} #{q.id}
      </h2>
      <Separator className="mb-4" />

      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">{t("orderDetails")}</h3>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
          <div>
            <div className="text-xs text-gray-500">{t("fullName")}</div>
            <div className="font-bold">{q.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{t("phoneNumber")}</div>
            <div className="font-bold">{q.phone}</div>
          </div>
        </div>
      </div>

      <Separator className="mb-4" />

      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Move Information</h3>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
          <div>
            <div className="text-xs text-gray-500">{t("moveType")}</div>
            <div className="font-bold">{q.move_type}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{t("date")}</div>
            <div className="font-bold">{q.date}</div>
          </div>
        </div>
      </div>

      {orderStatus === "delivered" ? (
        <div>
          <Button
            className="bg-green-600 text-white px-6 py-2 rounded"
            onClick={() => setDrawerOpen(true)}
          >
            {t("showProof")}
          </Button>
        </div>
      ) : (
        <div className="flex items-end gap-4 mt-auto">
          <div className="flex-1 space-y-0">
            <label className="text-sm font-medium mr-2">Status:</label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value)}
              defaultValue={status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-transit">{t("inProgress")}</SelectItem>
                <SelectItem value="delivered">{t("completed")}</SelectItem>
                {/* Add more statuses as needed */}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="bg-green-600 text-white px-6 py-2 rounded"
            onClick={() => updateOrderStatus.mutate({ orderId: id, status })}
          >
            {updateOrderStatus.isPending ? "updating..." : "Change status"}
          </Button>
        </div>
      )}
      <ProofOfDeliveryDrawer
        orderId={id}
        open={drawerOpen}
        onOpenChange={() => setDrawerOpen(!drawerOpen)}
      />
    </div>
  );
}
