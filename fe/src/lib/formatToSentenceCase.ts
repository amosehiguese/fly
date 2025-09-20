const cityNames = [
  "Stockholm",
  "Göteborg",
  "Malmö",
  "Norrland",
  "Uppsala",
  "Västerås",
  "Örebro",
  "Linköping",
  "Helsingborg",
  "Jönköping",
  "Norrköping",
  "Lund",
  "Umeå",
  "Gävle",
  "Borås",
  "Södertälje",
  "Eskilstuna",
  "Halmstad",
  "Växjö",
  "Karlstad",
  "Luleå",
  "Sundsvall",
  "Trollhättan",
  "Östersund",
  "Borlänge",
  "Upplands Väsby",
  "Falun",
  "Tumba",
  "Kalmar",
  "Kristianstad",
  "Karlskrona",
  "Nyköping",
];

const cityMap = Object.fromEntries(
  cityNames.map((name) => [name.toLowerCase(), name])
);

const cityRegex = new RegExp(
  cityNames
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|"),
  "gi"
);

export const formatToSentenceCase = (str: string) => {
  if (!str) return "";
  const lowercasedStr = str.toLowerCase();
  const sentenceCased =
    lowercasedStr.charAt(0).toUpperCase() + lowercasedStr.slice(1);
  // Capitalize city names
  return sentenceCased.replace(
    cityRegex,
    (match) => cityMap[match.toLowerCase()]
  );
};
