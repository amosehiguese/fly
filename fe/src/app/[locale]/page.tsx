// pages/index.tsx
import HeroSection from "@/components/homepage/HeroSection";
import WhyChooseUs from "@/components/homepage/WhyChooseUs";
import OurDeliveryProcess from "@/components/homepage/OurDeliveryProcess";
import OurRecords from "@/components/homepage/OurRecords";
import OurServices from "@/components/homepage/OurServices";
import FAQ from "@/components/homepage/FAQ";
import TestimonialSection from "@/components/homepage/Testimonials";
import GetQuote from "@/components/homepage/GetQuote";
import Nav from "@/components/homepage/Nav";
import Footer from "@/components/homepage/Footer";
import { getTranslations } from "next-intl/server";
import GetStarted from "@/components/homepage/GetStarted";
import YourJourney from "@/components/homepage/YourJourney";
import type { Metadata } from "next";

// import BecomePartnerSection from "@/components/homepage/BecomePartnerSection";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale;

  if (locale === "sv") {
    return {
      title: "Bästa Flyttfirmor i Sverige | Trygg Flytthjälp med Flyttman",
      description:
        "Letar du efter Sveriges bästa flyttfirma? Flyttman erbjuder säker, smidig och prisvärd flytthjälp över hela landet. Få en gratis offert idag!",
    };
  }

  return {
    title: "Best Moving Company in Sweden | Safe Moving Help with Flyttman",
    description:
      "Looking for Sweden's best moving company? Flyttman offers safe, smooth, and affordable moving help across the country. Get a free quote today!",
  };
}

// Make this a server component to handle server-side translations
export default async function Page() {
  // Get translations for this page
  const t = await getTranslations("home");

  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      <Nav />
      <HeroSection />
      <OurRecords />
      <GetQuote />

      <WhyChooseUs />
      <OurServices />
      {/* <BecomePartnerSection /> */}
      <OurDeliveryProcess />
      <YourJourney />
      <FAQ />

      <div className="relative bg-[url(/09.jpg)] bg-no-repeat bg-bottom">
        <div className="absolute inset-0 bg-white/[0.7]"></div>{" "}
        {/* Overlay for image only */}
        <div className="relative z-10">
          {" "}
          {/* Container for text and GetStarted */}
          <div className="px-6 lg:px-16 w-full flex justify-center">
            <GetStarted />
          </div>
          <div className="px-6 lg:px-16 w-full flex flex-col items-center mt-20">
            <h2 className="font-urbanist font-extrabold text-3xl lg:text-5xl antialiased">
              {t("testimonials.title")}
            </h2>
            <div className="mt-4 font-medium lg:w-[50%] px-6 w-full text-center">
              {t("testimonials.subtitle")}
            </div>
            <TestimonialSection />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
