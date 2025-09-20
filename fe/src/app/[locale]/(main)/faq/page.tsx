"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PinkHeroSection from "@/components/WordPress/PinkHeroSection";
import FAQ from "@/components/WordPress/FAQ";
import LearnMore from "@/components/homepage/YourJourney";
import Footer from "@/components/homepage/Footer";
import { useLocale, useTranslations } from "next-intl";

interface FaqItem {
  id: string;
  title: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export default function Page() {
  const t = useTranslations("faq");
  const t2: FaqItem[] = t.raw("categories");
  const locale = useLocale();
  console.log("t2", t2);
  // FAQ data structured in categories
  const generalFaqs = t2[0].questions.map((question, index) => ({
    id: index.toString(),
    question: question.question,
    answer: question.answer,
  }));

  const bookingFaqs = t2[7].questions.map((question, index) => ({
    id: index.toString(),
    question: question.question,
    answer: question.answer,
  }));

  const faqCategories = t2.slice(1, 7).map((category) => ({
    category: category.title,
    items: category.questions.map((question, index) => ({
      id: index.toString(),
      question: question.question,
      answer: question.answer,
    })),
  }));

  return (
    <main className="flex flex-col items-center overflow-x-hidden">
      {/* Hero Section */}
      <PinkHeroSection
        title={t("title")}
        description={t("subtitle")}
        // titleTextClassName="text-3xl md:text-5xl leading-relaxed"
      />

      <FAQ
        title={t2[0].title}
        description={""}
        faqs={generalFaqs}
        image={locale === "en" ? "/12.jpg" : "/13.jpg"}
      />

      {/* FAQ Content Section */}
      <section className="max-w-[1280px] w-full py-16 px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        {faqCategories.map((category, index) => (
          <div key={index} className="">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
              {category.category}
            </h2>
            <Accordion
              type="single"
              collapsible
              defaultValue={category.items[0].id}
              className="w-full space-y-1 lg:mt-0 mt-8"
            >
              {category.items.map(
                (item: { id: string; question: string; answer: string }) => (
                  <AccordionItem value={item.id} key={item.id} className="">
                    <AccordionTrigger className="text-[18px] px-4 font-bold hover:no-underline border-b-0 [&[data-state=open]]:bg-primary [&[data-state=open]]:text-white bg-[#FFF1F2]">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#5C5B5B] text-left py-4 px-6 text-[16px] font-medium leading-loose">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
            </Accordion>
          </div>
        ))}
      </section>

      <FAQ
        title={t2[7].title}
        titlePosition="right"
        description=""
        faqs={bookingFaqs}
        image={"/05.jpg"}
      />

      <LearnMore />

      <Footer />
    </main>
  );
}
