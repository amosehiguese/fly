"use client";

import ThumbUpSvg from "@/components/svg/icons/thumb-up";
import React from "react";
import { DynamicAnimatedImage } from "../homepage/DynamicAnimatedImage";
import { formatToSentenceCase } from "@/lib/formatToSentenceCase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CityWhyChooseUs = ({ t }: { t: any }) => {
  //   const t = useTranslations("home.features");

  return (
    <section className="px-6 py-12  md:px-16 lg:py-16 2xl:py-24 4xl:py-32 bg-white items-center flex flex-col max-w-[1280px] mx-auto">
      <div className="flex flex-col md:flex-row space-x-6 justify-between md:items-center space-y-4 ">
        <div className="space-y-10 md:w-[50%] mb-8 md:mb-0">
          <div className="w-full mb-4">
            <h2 className="md:text-4xl font-urbanist text-xl  font-extrabold text-gray-800 mb-4 md:text-left text-center ">
              {formatToSentenceCase(t("whyUs.title"))}
            </h2>
          </div>
          <div className="flex md:flex-row flex-col items-center mb-2 md:mb-0 md:items-start md:space-x-8 text-center ">
            <div>
              <div className="rounded-full h-12 w-12 overflow-clip bg-primary flex items-center justify-center">
                <ThumbUpSvg className="" />
              </div>
            </div>
            <div className="flex flex-col text-left text-[#3F3F3F]">
              <h3 className="md:text-xl text-sm font-bold font-urbanist md:text-left text-center md:my-0 my-2  ">
                {t("whyUs.commitmentTitle")}
              </h3>
              <p className="text-[#5C5B5B] text-sm font-medium md:text-left text-center">
                {t("whyUs.commitmentDescription")}
              </p>
            </div>
          </div>
          <div className="flex md:flex-row flex-col items-center mb-2 md:mb-0 md:items-start md:space-x-8 text-center ">
            <div>
              <div className="rounded-full h-12 w-12 overflow-clip bg-primary flex items-center justify-center">
                <ThumbUpSvg className="" />
              </div>
            </div>
            <div className="flex flex-col text-left text-[#3F3F3F]">
              <h3 className="md:text-xl text-sm font-bold font-urbanist md:text-left text-center md:my-0 my-2  ">
                {t("whyUs.qualityTitle")}
              </h3>
              <p className="text-[#5C5B5B] text-sm font-medium md:text-left text-center ">
                {t("whyUs.qualityDescription")}
              </p>
            </div>
          </div>
          <div className="flex md:flex-row flex-col items-center mb-2 md:mb-0 md:items-start md:space-x-8 text-center ">
            <div>
              <div className="rounded-full h-12 w-12 overflow-clip bg-primary flex items-center justify-center">
                <ThumbUpSvg className="" />
              </div>
            </div>
            <div className="flex flex-col text-left text-[#3F3F3F]">
              <h3 className="md:text-xl text-sm font-bold font-urbanist md:text-left text-center md:my-0 my-2  ">
                {t("whyUs.affordabilityTitle")}
              </h3>
              <p className="text-[#5C5B5B] text-sm font-medium md:text-left text-center">
                {t("whyUs.affordabilityDescription")}
              </p>
            </div>
          </div>
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

export default CityWhyChooseUs;
