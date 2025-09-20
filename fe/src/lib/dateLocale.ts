import { sv } from "date-fns/locale";
import { enGB } from "date-fns/locale";

export const dateLocale = (locale: string) => {
  return locale === "en" ? enGB : sv;
};
