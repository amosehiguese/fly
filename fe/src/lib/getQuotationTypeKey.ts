/**
 * Maps for converting translated service types back to their original technical keys
 * Used when we need to send the raw key to the API or use in URLs
 */

// English translations to original keys
const englishToKeyMap: Record<string, string> = {
  "Private Move": "private_move",
  "Company Relocation": "company_relocation",
  "Move-Out Cleaning": "move_out_cleaning",
  Storage: "storage",
  "Heavy Lifting": "heavy_lifting",
  "Carrying Assistance": "carrying_assistance",
  "Junk Removal": "junk_removal",
  "Estate Clearance": "estate_clearance",
  "Evacuation Move": "evacuation_move",
  "Privacy Move": "privacy_move",
  "Secrecy Move": "secrecy_move",
};

// Swedish translations to original keys
const swedishToKeyMap: Record<string, string> = {
  "Privat Flytt": "private_move",
  PrivatFlytt: "private_move",
  Privatflytt: "private_move",
  Företagsflytt: "company_relocation",
  Utflyttningsstädning: "move_out_cleaning",
  Lagring: "storage",
  "Tung Lyftning": "heavy_lifting",
  Bärhjälp: "carrying_assistance",
  "Borttagning av Skräp": "junk_removal",
  Bostadsrättsrensning: "estate_clearance",
  Evakueringsflytt: "evacuation_move",
  Sekretessflytt: "privacy_move",
  "Flytt av sekretess": "secrecy_move",
};

/**
 * Converts a translated quotation type back to its original technical key
 *
 * @param translatedType - The translated service type (e.g., "Private Move" or "Privat Flytt")
 * @param locale - Optional locale, defaults to 'en'
 * @returns The original technical key (e.g., "private_move") or the input if not found
 */
export function getQuotationTypeKey(
  translatedType: string,
  locale: string = "en"
): string {
  // Handle null/undefined case
  if (!translatedType) return "";

  // First try to normalize by converting to lowercase and replacing spaces with underscores
  const normalizedType = translatedType.toLowerCase().replace(/\s+/g, "_");

  // Check if the normalized form is already a valid key
  if (
    normalizedType === "private_move" ||
    normalizedType === "company_relocation" ||
    normalizedType === "move_out_cleaning" ||
    normalizedType === "storage" ||
    normalizedType === "heavy_lifting" ||
    normalizedType === "carrying_assistance" ||
    normalizedType === "junk_removal" ||
    normalizedType === "estate_clearance" ||
    normalizedType === "evacuation_move" ||
    normalizedType === "privacy_move" ||
    normalizedType === "secrecy_move"
  ) {
    return normalizedType;
  }

  // Based on locale, try to match from the appropriate map
  if (locale === "sv") {
    return swedishToKeyMap[translatedType] || translatedType;
  }

  // Default to English
  return englishToKeyMap[translatedType] || translatedType;
}
