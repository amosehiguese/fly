import { Quotation } from "@/api/interfaces/admin/quotations";
// import { flattenQuotations } from "./flattenQuotations";
import { formatDateLocale } from "./formatDateLocale";
import { TFunction } from "i18next";

export const formatQuotationsData = (
  data: Quotation[],
  t: TFunction,
  locale: "en" | "sv" = "en"
) => {
  // const flattenedData = flattenQuotations(data);
  return data.map((item: Quotation) => ({
    id: item.id,
    type:
      item.service_type && t
        ? t(
            `quotationTypes.${item?.service_type.toLowerCase().replace(" ", "_").replace(" ", "").replace("&", "")}`
          )
        : item?.service_type,
    date: formatDateLocale(item.created_at, locale),
    moveDate: formatDateLocale(item.date, locale),
    // "Mover Name": item.,
    location: `${item.pickup_address} - ${item.delivery_address}`,
    status:
      item.status && t ? t(`status.${item.status.toLowerCase()}`) : item.status,
  }));
};
