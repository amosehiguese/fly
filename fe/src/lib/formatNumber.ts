export const formatNumber = (number: number | undefined) => {
  if (number === undefined) return;
  return new Intl.NumberFormat("sv-SE", {
    style: "decimal",
  }).format(number);
};
