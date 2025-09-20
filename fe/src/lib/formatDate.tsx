// Format the date to a human-readable form
const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short", // Use 'short' for abbreviated month names
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export const formatDate = (date: string | undefined) => {
  if (!date) return ""; // Handle undefined case
  return new Date(date).toLocaleString("sv-SE", options);
};
