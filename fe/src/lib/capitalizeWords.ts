export function capitalizeWords(str: string | undefined) {
  if (str === undefined) return "";
  return str
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("[", "")
    .replaceAll("]", "")
    .replaceAll('"', "")
    .replaceAll(/(^|\s|\_)\w/g, (match) => match.toUpperCase());
}
