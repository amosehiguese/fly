"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { useLocale } from "next-intl";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  subtitle?: string;
  questions: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({
  title,
  subtitle,
  questions,
}) => {
  const locale = useLocale();

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-[1280px] py-12 md:py-16 lg:py-20 px-6 md:px-16 mx-auto flex flex-col md:flex-row gap-12 items-center">
      <div className="w-full md:w-1/2">
        <div className="relative w-full h-[200px] md:h-[300px] rounded-xl overflow-hidden shadow-lg">
          <Image
            src={locale === "en" ? "/12.jpg" : "/13.jpg"}
            alt="Frequently asked questions section image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </div>
      <div className="w-full md:w-1/2 space-y-6 mt-8 md:mt-0">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        <Accordion type="single" collapsible className="w-full">
          {questions.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base sm:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
