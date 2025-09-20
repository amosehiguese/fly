import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import CustomButton from "../CustomButton";
import { useLocale, useTranslations } from "next-intl";

interface BenefitsSectionProps {
  benefitsTitle: string;
  // benefitsDescription: string;
  // advantagesTitle: string;
  advantagesDescription: string;
  advantagesList: { title: string; subtitle: string }[];
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({
  benefitsTitle,
  // benefitsDescription,
  // advantagesTitle,
  advantagesDescription,
  advantagesList,
}) => {
  const t = useTranslations("home.getStarted");
  const locale = useLocale();

  return (
    <section className="py-16 w-full bg-white">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-10">
          {/* Image with red border */}
          <div className="w-full md:w-1/2 border-t-8 border-red-600 rounded-xl shadow-lg shadow-red-500 overflow-hidden">
            <div className="relative w-full h-[200px] md:h-[300px] border-8  rounded-lg  border-white">
              {locale === "en" ? (
                <Image
                  src={"/12.jpg"}
                  alt="Flyttman trusted moving partners"
                  fill
                  className="object-cover w-full"
                />
              ) : (
                <Image
                  src={"/13.jpg"}
                  alt="Flyttman trusted moving partners"
                  fill
                  className="object-cover w-full"
                />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-1/2 ">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {benefitsTitle}
            </h2>

            {/* {advantagesDescription && (
              <p className="text-gray-700 text-lg leading-relaxed mb-2">
                {advantagesDescription}
              </p>
            )} */}
            <ul className="mb-2 space-y-2">
              {advantagesList.map(
                (item: { title: string; subtitle: string }, index: number) => (
                  <li key={index.toString()} className="flex items-start gap-4">
                    <h3 className=" font-bold text-gray-900">
                      {item.title}:{" "}
                      <span className="text-[#565B5B] font-medium">
                        {item.subtitle}
                      </span>
                    </h3>
                    {/* <span className="text-[#565B5B] font-medium text-left">
                      {item.subtitle}
                    </span> */}
                  </li>
                )
              )}
            </ul>

            <Link href={"/get-quote"}>
              <CustomButton className="bg-pink-100 border-2 border-pink-200 text-gray-800 font-medium py-3 px-8 rounded-md hover:bg-pink-200 transition duration-300">
                {t("button")}
              </CustomButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
