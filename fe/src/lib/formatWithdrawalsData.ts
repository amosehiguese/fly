/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CompletedWithdrawal,
  PendingWithdrawal,
} from "@/api/interfaces/admin/withdrawal";
// import { flattenQuotations } from "./flattenQuotations";
import { formatDateLocale } from "./formatDateLocale";
import { capitalizeWords } from "./capitalizeWords";

export const formatCompletedWithdrawalsData = (
  data: CompletedWithdrawal[] | undefined,
  t: any,
  locale: "en" | "sv" = "sv"
) => {
  // const flattenedData = flattenQuotations(data);
  return data?.map((item: CompletedWithdrawal) => ({
    id: item?.withdrawal_id,
    supplierName: capitalizeWords(item?.supplier_name),
    // Move Type: item.move_type
    date: formatDateLocale(item?.paid_date, locale),
    paymentAmount: item?.amount,
    status: t(`status.${item?.status.toLowerCase()}`),
  }));
};

export const formatPendingWithdrawalsData = (
  data: PendingWithdrawal[],
  t: any,
  locale: "en" | "sv" = "sv"
) => {
  // const flattenedData = flattenQuotations(data);
  return data?.map((item: PendingWithdrawal) => ({
    id: item?.withdrawal_id,
    supplierName: capitalizeWords(item?.supplier_name),
    // Move Type: item.move_type
    paymentAmount: item?.amount,
    date: formatDateLocale(item?.request_date, locale),
    status: t(`status.${item?.status.toLowerCase()}`),
  }));
};
