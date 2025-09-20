import React from "react";
import PinkHeroSection from "@/components/WordPress/PinkHeroSection";
import OurRecords from "@/components/homepage/OurRecords";
import WhyChooseUs from "@/components/homepage/WhyChooseUs";
import Footer from "@/components/homepage/Footer";
import { useTranslations } from "next-intl";
import AboutUs from "@/components/WordPress/AboutUs";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale;

  if (locale === "sv") {
    return {
      title: "Om Oss - Pålitliga Flyttfirmor i Sverige | Flyttman",
      description:
        "Flyttman är din pålitliga flyttfirma i Sverige, specialiserad på säkra och effektiva flyttjänster. Vi erbjuder professionell hjälp för alla typer av flyttar, stora som små.",
    };
  }

  return {
    title: "About Us - Reliable Moving Company in Sweden | Flyttman",
    description:
      "Flyttman is your reliable moving company in Sweden, specializing in safe and efficient moving services. We offer professional help for all types of moves, big and small.",
  };
}

export default function Page() {
  const t = useTranslations("about");

  return (
    <main className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <PinkHeroSection title={t("title")} description={t("description")} />

      {/* About Us Content Section */}
      <AboutUs />

      {/* Stats Section */}
      <OurRecords />

      {/* Why Choose Us Section */}
      <WhyChooseUs />
      <Footer />
    </main>
  );
}
