import { DisputeSupplier } from "@/api/interfaces/admin/disputes";
import { formatDateLocale } from "./formatDateLocale";

export const formatDisputesData = (
  data: DisputeSupplier[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
  locale: "en" | "sv" = "sv"
) => {
  return data.map((item) => ({
    id: item.dispute_id,
    orderId: item.order_id,
    supplierName: item.supplier_name,
    latestMessage: item.latest_message,
    latestSender: item.latest_sender,
    disputeStatus: t(`status.${item.dispute_status.toLowerCase()}`),
    disputeCreated: item.dispute_created_at
      ? formatDateLocale(item.dispute_created_at, locale)
      : "",
  }));
};
