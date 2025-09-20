import Image from "next/image";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

// const faqs = [
//   {
//     id: "1",
//     question: "What areas do you cover for local moves?",
//     answer:
//       "We provide local moving services within city limits and nearby areas.",
//   },
//   {
//     id: "2",
//     question: "How far in advance should I book a long-distance move?",
//     answer:
//       "We recommend booking at least 2–4 weeks in advance to ensure availability and smooth planning.",
//   },
//   {
//     id: "3",
//     question: "Can you move my office outside of regular business hours?",
//     answer:
//       "Yes, we offer flexible scheduling to minimize disruptions to your business operations",
//   },
//   {
//     id: "4",
//     question: "What does the evacuation move service include?",
//     answer:
//       "Our evacuation move includes quick, secure transport and cleanup to ensure a swift transition in urgent situations.",
//   },
//   {
//     id: "5",
//     question: "Is insurance included with your services?",
//     answer:
//       "Yes, we offer basic coverage, with additional insurance options available for added peace of mind.",
//   },
//   // {id: '', question: '', answer: ''}
// ];

const FAQ = () => {
  const t = useTranslations("home.faq");
  const locale = useLocale();

  return (
    <section id="faq" className=" max-w-[1280px] mx-6 lg:mx-16 py-20 lg:mt-0 ">
      <div className="grid grid-cols-1 lg:grid-cols-5 w-full ">
        <div className="lg:col-span-2  ">
          <h2 className="font-livvic lg:text-[48px]  text-[32px] lg:text-left text-center font-bold leading-tight">
            {t("title")}
          </h2>
          <p className="text-[#5C5B5B] text-[16px] 2xl:text-[24px] mb-8 font-medium  lg:text-left text-center mt-4">
            {t("description")}
          </p>
          {locale === "en" ? (
            <Image
              src={"/12.jpg"}
              width={500}
              height={500}
              layout="responsive"
              className="w-89% h-[200px] rounded-bl-[50px] rounded-[10px]"
              alt="frequently asked questions"
            />
          ) : (
            <Image
              src={"/13.jpg"}
              width={500}
              height={500}
              layout="responsive"
              className="w-89% h-[200px] rounded-bl-[50px] rounded-[10px]"
              alt="frequently asked questions"
            />
          )}
        </div>
        <div className="lg:col-span-3 justify-self-end lg:w-[90%]">
          <Accordion
            type="single"
            collapsible
            defaultValue={"0"}
            className="w-full space-y-1 lg:mt-0 mt-8"
          >
            {t
              .raw("items")
              .map(
                (
                  item: { id: string; question: string; answer: string },
                  index: number
                ) => (
                  <AccordionItem
                    value={index.toString()}
                    key={index}
                    className="w-full min-w-full"
                  >
                    <AccordionTrigger className="text-[18px] px-4 font-bold hover:no-underline border-b-0 [&[data-state=open]]:bg-primary [&[data-state=open]]:text-white bg-[#FFF1F2] text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#5C5B5B] text-left py-4 px-6 text-[16px] font-medium">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
