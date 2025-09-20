import AnimatedHeader from "@/components/AnimatedHeader";
import AnimatedImage from "@/components/AnimatedImage";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";
import CustomButton from "../CustomButton";

const HeroSection = () => {
  const t = useTranslations("home.hero");
  return (
    <AnimatedHeader
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative w-full flex mb-0 lg:mb-0 flex-col-reverse lg:flex-col items-center justify-center lg:justify-between lg:py-16 z-[2] "
    >
      <div className="max-w-[1280px] flex flex-col-reverse lg:flex-row justify-between lg:mt-8">
        <div className="absolute inset-0 z-0 w-full ">
          <Image
            src="/hero_section_background.jpg"
            alt="Hero background"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover "
          />
          <div className="absolute inset-0 bg-white/50" />
        </div>
        {/* Text Content with Background */}
        <div className="relative text-center lg:text-left mt-8 lg:mt-0 w-full lg:w-1/2 ml:6 lg:ml-16 ">
          {/* Background Container */}

          {/* Text Content */}
          <div className="relative z-10 ">
            <h1 className="lg:text-[72px] font-urbanist text-black  text-[48px] leading-none font-extrabold">
              {t("title")}
            </h1>

            {t("description")
              .split("\n")
              .map((line, index) => (
                <p
                  key={index}
                  className="text-black mt-4 lg:text-xl mx-2 lg:mx-0 "
                >
                  {line}
                </p>
              ))}

            <Link href="/get-quote">
              <CustomButton className="mt-6 mb-4 lg:mb-0 px-6 py-3 2xl:px-8 2xl:py-4 4xl:px-10  lg:text-lg 4xl:text-xl text-white hover:text-black font-medium bg-primary shadow-lg rounded-[5px] transition hover:bg-[#F4D7D9]/90">
                {t("cta.primary")}
              </CustomButton>
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="relative z-10 mr-6 ml-6 lg:ml-0 lg:mr-16">
          <AnimatedImage
            src="/07.png"
            alt="Movers holding boxes"
            width={1600}
            height={1600}
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="rounded-xl w-full h-[350px] lg:h-[500px] object-contain"
          />
        </div>
      </div>
    </AnimatedHeader>
  );
};

export default HeroSection;
