import { BidList } from "@/api/interfaces/admin/bids";
import { formatNumber } from "./formatNumber";
import { TFunction } from "i18next";
import { formatDateLocale } from "./formatDateLocale";

export const formatBidsData = (
  data: BidList[],
  tCommon: TFunction,
  locale: "en" | "sv"
) => {
  return data.map((item) => ({
    id: item.bid_id,
    type: item.quotation_type
      ? tCommon(
          `quotationTypes.${item.quotation_type.toLowerCase().replace(" ", "_").replace(" ", "").replace("&", "")}`
        )
      : "",
    date: item.bid_created_at
      ? formatDateLocale(item.bid_created_at, locale)
      : "",
    moverName: item.supplier_name,
    price: formatNumber(Number(item.moving_cost)) + " SEK",
    status: item.bid_status
      ? tCommon(`status.${item.bid_status.toLowerCase()}`)
      : "",
  }));
};
