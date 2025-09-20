"use client";

import ServiceProcess from "@/components/WordPress/ServiceProcess";
import AboutService from "@/components/WordPress/AboutService";
import ServicesHeroSection from "@/components/WordPress/ServicesHeroSection";
import { useParams } from "next/navigation";
import React from "react";
import BenefitsSection from "@/components/WordPress/BenefitsSection";
import Nav from "@/components/homepage/Nav";
import Footer from "@/components/homepage/Footer";
import { useTranslations } from "next-intl";
import YourJourney from "@/components/homepage/YourJourney";
import DetailedProcessSection from "@/components/homepage/DetailedProcessSection";
import FAQSection from "@/components/homepage/FAQSection";
import ListSection from "@/components/homepage/ListSection";

function ServicePage() {
  const { id } = useParams<{ id: string }>();
  //@ts-expect-error - Dynamic translation key path is not type-safe but works at runtime
  const t = useTranslations(`servicePages.${id}`);
  const commonT = useTranslations("servicePages.common");

  // --- Data Fetching ---

  // Process (Used by existing ServiceProcess component)
  // Attempt to get specific process steps, fallback needed if this fails or is empty
  let processSteps: string[] = [];
  let processTitle: string | undefined = undefined;
  try {
    const specificProcessData = t.raw("process");
    if (
      specificProcessData?.processSteps &&
      Array.isArray(specificProcessData.processSteps)
    ) {
      processSteps = specificProcessData.processSteps.map(
        (step: { title: string; description?: string }) => step.title
      );
      processTitle =
        specificProcessData.processTitle || specificProcessData.title;
    }
  } catch {
    // Fallback or default if specific process data is missing/malformed
    console.warn(
      `Process data missing or malformed for service ${id}. Using common fallback if available.`
    );
    // You might want a more robust fallback here using commonT if needed
  }
  if (!processTitle) {
    // Try fetching common title as fallback
    processTitle = commonT("simplifyTitle");
    processSteps = [
      commonT("processSteps.plan"),
      commonT("processSteps.pack"),
      commonT("processSteps.move"),
      commonT("processSteps.settle"),
    ];
  }

  // Data for Conditional Sections
  const faqData = t.raw("faq");
  const tipsData = t.raw("tips");
  const additionalServicesData = t.raw("additional_services");
  const coreValuesData = t.raw("core_values");
  const advantagesListData = t.raw("advantages.list"); // Re-fetch for BenefitsSection
  const useCasesData = t.raw("use_cases");
  const keyFeaturesData = t.raw("key_features");
  const definitionsData = t.raw("definitions");
  const mainServicesData = t.raw("main_services");
  const whyChooseUsData = t.raw("why_choose_us");
  const commitmentData = t.raw("commitment");
  const pricingInfoData = t.raw("pricing_info");
  const sustainabilityData = t.raw("sustainability");
  const bookingProcessData = t.raw("booking_process");

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <Nav />
      <ServicesHeroSection
        title={t("title")}
        subtitle={t("subtitle")}
        description={t("description")}
        servicesOffered={t.raw("whyChoose")} // Note: 'whyChoose' data is used here
      />

      <AboutService
        title={t("aboutTitle")}
        description={t("aboutDescription")}
        servicesOffered={t.raw("servicesOffered")} // List of services for this page
      />

      {/* Service Process Section (Using existing component) */}
      {/* Ensure processTitle and processSteps have valid fallbacks if data fetch fails */}
      {processTitle && processSteps.length > 0 && (
        <ServiceProcess title={processTitle} processSteps={processSteps} />
      )}

      {/* Main Services (Uses ListSection) */}
      {mainServicesData?.list &&
        Array.isArray(mainServicesData.list) &&
        mainServicesData.list.length > 0 && (
          <ListSection
            title={mainServicesData.title}
            subtitle={mainServicesData.subtitle}
            items={mainServicesData.list}
            gridCols="md:grid-cols-2" // Adjust grid as needed
          />
        )}

      {/* Benefits / Advantages Section (Using existing component) */}
      <BenefitsSection
        benefitsTitle={t("benefitsTitle") || ""}
        advantagesDescription={t("advantages.subtitle") || ""}
        advantagesList={advantagesListData || []} // Use re-fetched data
      />

      {/* --- Conditionally Rendered Sections --- */}

      {/* Additional Services */}
      {additionalServicesData?.list &&
        Array.isArray(additionalServicesData.list) &&
        additionalServicesData.list.length > 0 && (
          <ListSection
            title={additionalServicesData.title}
            subtitle={additionalServicesData.subtitle}
            items={additionalServicesData.list}
            gridCols="md:grid-cols-2" // Adjust grid as needed
          />
        )}

      {/* Core Values */}
      {coreValuesData?.list &&
        Array.isArray(coreValuesData.list) &&
        coreValuesData.list.length > 0 && (
          <ListSection
            title={coreValuesData.title}
            subtitle={coreValuesData.subtitle}
            items={coreValuesData.list}
            gridCols="md:grid-cols-3" // Adjust grid as needed
          />
        )}

      {/* Use Cases */}
      {useCasesData?.list &&
        Array.isArray(useCasesData.list) &&
        useCasesData.list.length > 0 && (
          <ListSection
            title={useCasesData.title}
            subtitle={useCasesData.subtitle}
            items={useCasesData.list}
            gridCols="md:grid-cols-2 lg:grid-cols-3"
          />
        )}

      {/* Key Features */}
      {keyFeaturesData?.list &&
        Array.isArray(keyFeaturesData.list) &&
        keyFeaturesData.list.length > 0 && (
          <ListSection
            title={keyFeaturesData.title}
            subtitle={keyFeaturesData.subtitle}
            items={keyFeaturesData.list}
            gridCols="md:grid-cols-2"
          />
        )}

      {/* Definitions */}
      {definitionsData?.list &&
        Array.isArray(definitionsData.list) &&
        definitionsData.list.length > 0 && (
          <ListSection
            title={definitionsData.title}
            subtitle={definitionsData.subtitle}
            items={definitionsData.list}
            gridCols="md:grid-cols-2"
          />
        )}

      {/* Why Choose Us (Specific list section) */}
      {whyChooseUsData?.list &&
        Array.isArray(whyChooseUsData.list) &&
        whyChooseUsData.list.length > 0 && (
          <ListSection
            title={whyChooseUsData.title}
            subtitle={whyChooseUsData.subtitle}
            items={whyChooseUsData.list}
            gridCols="md:grid-cols-2"
          />
        )}

      {/* Tips */}
      {tipsData?.list &&
        Array.isArray(tipsData.list) &&
        tipsData.list.length > 0 && (
          <ListSection
            title={tipsData.title}
            subtitle={tipsData.subtitle}
            items={tipsData.list}
            gridCols="md:grid-cols-2"
          />
        )}

      {/* FAQ Section */}
      {faqData?.questions &&
        Array.isArray(faqData.questions) &&
        faqData.questions.length > 0 && (
          <FAQSection
            title={faqData.title}
            subtitle={faqData.subtitle}
            questions={faqData.questions}
          />
        )}

      {/* Booking Process (Uses DetailedProcessSection) */}
      {bookingProcessData?.processSteps &&
        Array.isArray(bookingProcessData.processSteps) &&
        bookingProcessData.processSteps.length > 0 && (
          <DetailedProcessSection
            title={bookingProcessData.processTitle || bookingProcessData.title}
            subtitle={
              bookingProcessData.processSubtitle || bookingProcessData.subtitle
            }
            steps={bookingProcessData.processSteps}
          />
        )}

      {/* Commitment Section (Simple text display) */}
      {commitmentData?.title && commitmentData?.text && (
        <section className="w-full max-w-4xl py-12 md:py-16 lg:py-20 px-4 md:px-6 mx-auto">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              {commitmentData.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {commitmentData.text}
            </p>
          </div>
        </section>
      )}

      {/* Pricing Info (Simple text display) */}
      {pricingInfoData?.title && pricingInfoData?.text && (
        <section className="w-full max-w-4xl py-12 md:py-16 lg:py-20 px-4 md:px-6 mx-auto bg-muted dark:bg-muted/50 rounded-lg">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              {pricingInfoData.title}
            </h2>
            {/* Split text by newline for better formatting */}
            {pricingInfoData.text
              .split("\n")
              .map((line: string, index: number) => (
                <p
                  key={index}
                  className="text-lg text-gray-600 dark:text-gray-400 mb-2"
                >
                  {line}
                </p>
              ))}
          </div>
        </section>
      )}

      {/* Sustainability (Simple text display) */}
      {sustainabilityData?.title && sustainabilityData?.text && (
        <section className="w-full max-w-4xl py-12 md:py-16 lg:py-20 px-4 md:px-6 mx-auto">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              {sustainabilityData.title}
            </h2>
            {/* Split text by newline for better formatting */}
            {sustainabilityData.text
              .split("\n")
              .map((line: string, index: number) => (
                <p
                  key={index}
                  className="text-lg text-gray-600 dark:text-gray-400 mb-2"
                >
                  {line}
                </p>
              ))}
          </div>
        </section>
      )}

      {/* --- End Conditional Sections --- */}

      <YourJourney />

      <Footer />
    </div>
  );
}

export default ServicePage;
