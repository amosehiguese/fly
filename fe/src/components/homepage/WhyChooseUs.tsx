"use client";

// import AnimatedImage from "@/components/AnimatedImage";
import ThumbUpSvg from "@/components/svg/icons/thumb-up";
import React from "react";
import { useTranslations } from "next-intl";
import { DynamicAnimatedImage } from "./DynamicAnimatedImage";

interface FeatureItem {
  title: string;
  description: string;
}

const WhyChooseUs = () => {
  const t = useTranslations("home.features");

  return (
    <section className="px-6 py-12  lg:px-16 lg:py-16 2xl:py-24 4xl:py-32 bg-white items-center flex flex-col max-w-[1280px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center space-x-6 lg:space-x-20 lg:justify-start space-y-4 ">
        <div className="space-y-10 lg:w-[50%] mb-8 lg:mb-0">
          <div className="w-full mb-4">
            <h2 className="lg:text-5xl font-urbanist text-3xl  font-extrabold text-gray-800 mb-4 lg:text-left text-center ">
              {t("title")}
            </h2>
          </div>
          {t.raw("items").map((item: FeatureItem, index: number) => (
            <div
              key={index}
              className="flex lg:flex-row flex-col items-center mb-2 lg:mb-0 lg:items-start lg:space-x-8 text-center "
            >
              <div>
                <div className="rounded-full h-12 w-12 overflow-clip bg-primary flex items-center justify-center">
                  <ThumbUpSvg className="" />
                </div>
              </div>
              <div className="flex flex-col text-left text-[#3F3F3F]">
                <h3 className="text-2xl font-bold font-urbanist lg:text-left text-center lg:my-0 my-2  ">
                  {item.title}
                </h3>
                <p className="text-[#5C5B5B] text-[16px] font-medium ">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <DynamicAnimatedImage
          images={[
            { src: "/03.jpg", alt: "Flyttman worker packing boxes" },
            { src: "/10.jpg", alt: "Flyttman worker packing boxes" },
            { src: "/01.jpg", alt: "Flyttman worker packing boxes" },
          ]}
          width={600}
          height={400}
          borderColor="border-red-500"
        />
      </div>
    </section>
  );
};

export default WhyChooseUs;
