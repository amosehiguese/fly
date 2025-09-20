import { formatDate, parseISO } from "date-fns";
import { sv, enUS } from "date-fns/locale";

export function formatDateLocale(
  date: string,
  locale: "en" | "sv",
  format: string = "dd MMMM, yyyy"
) {
  if (!date) return "";
  return formatDate(parseISO(date), format, {
    locale: locale === "en" ? enUS : sv,
  });
}
