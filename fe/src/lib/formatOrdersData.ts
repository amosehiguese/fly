import { Order } from "@/api/interfaces/admin/order";
import { formatNumber } from "./formatNumber";
import { formatDateLocale } from "./formatDateLocale";
import { TFunction } from "i18next";

export const formatOrdersData = (
  data: Order[],
  t?: TFunction,
  locale: "en" | "sv" = "en"
) => {
  return data.map((item) => ({
    orderId: item.order_id,
    customer: `${item.first_name || "Customer"} ${item.last_name || ""}`,
    type:
      item.service_type && t
        ? t(
            `quotationTypes.${item?.service_type.toLowerCase().replace(" ", "_").replace(" ", "").replace("&", "")}`
          )
        : item?.service_type,
    date: formatDateLocale(item.date, locale),
    moverName: item.supplier_name,
    location: item.pickup_address + " - " + item.delivery_address,
    total: formatNumber(Number(item.final_price)) + " SEK",
    status:
      item.order_status && t
        ? t(`status.${item?.order_status?.toLowerCase()}`)
        : item?.order_status,
    paymentStatus:
      item.payment_status && t
        ? t(`paymentStatus.${(item?.payment_status || "").toLowerCase()}`)
        : item?.payment_status,
  }));
};
