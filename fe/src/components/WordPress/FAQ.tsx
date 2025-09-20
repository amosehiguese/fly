import Image from "next/image";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = ({
  title,
  titlePosition = "left",
  description,
  faqs,
  image = "/12.jpg",
}: {
  title: string;
  titlePosition?: "left" | "right";
  description: string;
  faqs: { id: string; question: string; answer: string }[];
  image?: string;
}) => {
  return (
    <section
      id="faq"
      className="lg:px-16 max-w-[1280px] mx-auto px-6 py-20 md:mt-0 "
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-x-12">
        <div className="md:col-span-2">
          <h2 className="font-urbanist md:text-[48px] text-[32px] md:text-left text-center font-extrabold leading-tight">
            {titlePosition === "left" && title}
          </h2>
          <p className="text-[#5C5B5B] text-[16px] 2xl:text-[24px] mb-8 font-medium  md:text-left text-center mt-4">
            {description}
          </p>
          <Image
            src={image}
            width={500}
            height={500}
            layout="responsive"
            className="w-80% h-[200px] rounded-bl-[50px] rounded-[10px]"
            alt="frequently asked questions"
          />
        </div>

        <div className="md:col-span-3">
          <h2 className="font-urbanist md:text-[48px] text-[32px] md:text-left text-center font-extrabold leading-tight mb-4">
            {titlePosition === "right" && title}
          </h2>
          <Accordion
            type="single"
            collapsible
            defaultValue={faqs[0].id}
            className="w-full space-y-1 lg:mt-0 mt-8"
          >
            {faqs.map(
              (item: { id: string; question: string; answer: string }) => (
                <AccordionItem value={item.id} key={item.id} className="">
                  <AccordionTrigger className="text-[18px] px-4 font-bold hover:no-underline border-b-0 [&[data-state=open]]:bg-primary [&[data-state=open]]:text-white bg-[#FFF1F2]">
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
