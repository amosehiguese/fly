"use client";

import Footer from "@/components/homepage/Footer";
import Nav from "@/components/homepage/Nav";
import OurRecords from "@/components/homepage/OurRecords";
import YourJourney from "@/components/homepage/YourJourney";
import CityAffordabilitySection from "@/components/WordPress/CityAffordabilitySection";
import CityCommitment from "@/components/WordPress/CityCommitment";
import CityHeroSection from "@/components/WordPress/CityHeroSection";
import CityMovingService from "@/components/WordPress/CityMovingServices";
import CityQuality from "@/components/WordPress/CityQuality";
import CityWhyChooseFlyttman from "@/components/WordPress/CityWhyChooseFlyttman";
import CityWhyChooseUs from "@/components/WordPress/CityWhyChooseUs";
import { useTranslations } from "next-intl";

const cities = {
  stockholm: "Stockholm",
  goteborg: "Göteborg",
  malmo: "Malmö",
  norrland: "Norrland",
  uppsala: "Uppsala",
  vasteras: "Västerås",
  orebro: "Örebro",
  linkoping: "Linköping",
  helsingborg: "Helsingborg",
  jonkoping: "Jönköping",
  norrkoping: "Norrköping",
  lund: "Lund",
  umea: "Umeå",
  gavle: "Gävle",
  boras: "Borås",
  sodertalje: "Södertälje",
  eskilstuna: "Eskilstuna",
  halmstad: "Halmstad",
  vaxjo: "Växjö",
  karlstad: "Karlstad",
  lulea: "Luleå",
  sundsvall: "Sundsvall",
  trollhattan: "Trollhättan",
  ostersund: "Östersund",
  borlange: "Borlänge",
  "upplands-vasby": "Upplands Väsby",
  falun: "Falun",
  tumba: "Tumba",
  kalmar: "Kalmar",
  kristianstad: "Kristianstad",
  karlskrona: "Karlskrona",
  nykoping: "Nyköping",
};

function CityPage({ city }: { city: keyof typeof cities }) {
  const t = useTranslations(`citiesDetails.${city}`);

  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      <Nav />
      {/* Hero Section */}
      <CityHeroSection city={cities[city]} />
      <OurRecords />
      <CityWhyChooseUs t={t} />
      <CityCommitment t={t} />
      <CityQuality t={t} />

      {/* Affordability Section - Example */}
      <CityAffordabilitySection t={t} />
      <CityMovingService t={t} />
      <CityWhyChooseFlyttman t={t} />
      <YourJourney />
      <Footer />
    </div>
  );
}

export default CityPage;
