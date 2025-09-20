export const formatToQuotationType = (quotation: string | undefined) => {
  if (!quotation) return "";
  return quotation
    .replace(" ", "_")
    .replace(" ", "")
    .replace("&", "")
    .toLowerCase();
};
