export const formatToSqlDate = (date: Date | undefined) => {
  if (date) return date.toISOString().slice(0, 10);
  else return "";
};
