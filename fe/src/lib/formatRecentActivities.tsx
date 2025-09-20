import { RecentActivities } from "@/api/interfaces/admin/recentActivities";
import { formatDateLocale } from "./formatDateLocale";

export const formatRecentActivities = (
  data: RecentActivities[],
  locale: "en" | "sv" = "sv"
) => {
  return data.map((item) => ({
    id: item.reference_id,
    title: item.title,
    message: item.message,
    date: formatDateLocale(item.created_at, locale),
    type: item.type,
  }));
};
