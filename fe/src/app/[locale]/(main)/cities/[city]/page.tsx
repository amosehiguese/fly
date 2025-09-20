import type { Metadata } from "next";
import CityPage from "./client";
import { metadataByCityId } from "@/i18n/cityMetadata";

// Dynamic metadata generation with fallback for unknown cities
export async function generateMetadata({
  params,
}: {
  params: { locale: string; city: string };
}): Promise<Metadata> {
  const { locale, city } = params;

  // Get city metadata from our lookup table
  const cityMetadata = metadataByCityId[city];

  // If we have specific metadata for this city
  if (cityMetadata) {
    return {
      title: cityMetadata.title[locale as "sv" | "en"] || cityMetadata.title.en,
      description:
        cityMetadata.description[locale as "sv" | "en"] ||
        cityMetadata.description.en,
    };
  }

  // Format the city name for display if no specific entry exists (fallback)
  const formattedCity = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Create generic metadata based on locale as fallback
  if (locale === "sv") {
    return {
      title: `Flyttfirma i ${formattedCity} | Flyttman`,
      description: `Flyttman erbjuder professionella flyttjänster i ${formattedCity}. Kontakta oss för en offert och få hjälp med din flytt redan idag.`,
    };
  }

  // Default to English
  return {
    title: `Moving Company in ${formattedCity} | Flyttman`,
    description: `Flyttman offers professional moving services in ${formattedCity}. Contact us for a quote and get help with your move today.`,
  };
}

const Page = ({ params }: { params: { city: string } }) => {
  const city = params.city;

  return <CityPage city={city} />;
};

export default Page;
