import AnimatedHeader from "@/components/AnimatedHeader";
import AnimatedImage from "@/components/AnimatedImage";
import { Link } from "@/i18n/navigation";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const ServicesHeroSection = ({
  title,
  subtitle,
  description,
  servicesOffered,
}: {
  title: string;
  subtitle: string;
  description: string;
  servicesOffered: string[];
}) => {
  const tCommon = useTranslations("common");
  return (
    <AnimatedHeader
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative w-full flex flex-col-reverse lg:flex-col items-center justify-center md:justify-between md:py-16 z-[2]"
    >
      <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full z-0 ">
        <Image
          src="/hero_section_background.jpg"
          alt="Hero background"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/50" />
      </div>
      <div className="relative z-10 px-6 max-w-[1280px] md:px-16 flex flex-col-reverse md:flex-row justify-between w-full md:mt-8">
        <div className="relative text-center md:text-left mt-8 md:mt-0 w-full md:w-1/2">
          <div className="relative z-10 w-full">
            <h1 className="text-4xl md:mt-8 font-urbanist text-black leading-tight font-bold">
              {title}
            </h1>
            <p className="text-[#565B5B] mt-4">{description}</p>

            <div className="flex flex-col gap-4 mt-8">
              <h2 className="text-2xl font-urbanist text-black leading-tight font-semibold">
                {subtitle}
              </h2>

              <ul className="">
                {servicesOffered.map((service) => (
                  <li key={service} className="flex items-start gap-2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 40 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 15L17 24L32 9"
                        stroke="#BC2525"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M8 26L17 35L32 20"
                        stroke="#BC2525"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[#565B5B] font-medium text-left">
                      {service}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/get-quote">
              <button className="mt-6 mb-8 md:mb-0 px-6 py-3 2xl:px-8 2xl:py-4 4xl:px-10 4xl:py-5 2xl:text-lg 4xl:text-xl text-black font-medium bg-[#F4D7D9] shadow-lg rounded-[5px] transition hover:bg-[#F4D7D9]/90">
                {tCommon("buttons.getQuote")}
              </button>
            </Link>
          </div>
        </div>

        <div className="relative z-10">
          <AnimatedImage
            src="/07.png"
            alt="Movers holding boxes"
            width={1600}
            height={1600}
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="rounded-xl w-full h-[400px]  object-contain"
          />
        </div>
      </div>
    </AnimatedHeader>
  );
};

export default ServicesHeroSection;
