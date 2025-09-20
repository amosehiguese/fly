import { format, formatRelative } from "date-fns";
import { sv, enUS } from "date-fns/locale";

// Map locale identifiers to date-fns locale objects
const localeMap = {
  en: enUS,
  sv: sv,
};

export function getDateFormatter(locale: "en" | "sv") {
  return {
    format: (date: Date | number, formatString: string) =>
      format(date, formatString, { locale: localeMap[locale] || localeMap.en }),

    formatRelative: (date: Date | number, baseDate: Date | number) =>
      formatRelative(date, baseDate, {
        locale: localeMap[locale] || localeMap.en,
      }),
  };
}

// Add formatDateLocale function as required in the custom instructions
export function formatDateLocale(date: Date | number, locale: string) {
  const dateLocale =
    localeMap[locale as keyof typeof localeMap] || localeMap.en;
  return format(date, "PPP", { locale: dateLocale });
}
