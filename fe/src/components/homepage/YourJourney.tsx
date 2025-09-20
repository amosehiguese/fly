import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import React from "react";

const YourJourney = () => {
  const t = useTranslations("home.yourJourney");

  return (
    <section className="relative bg-[url('/11.jpg')] w-full bg-cover bg-center py-8 my-12 lg:py-24 flex flex-col items-center px-6 lg:px-16 ">
      <div className="max-w-[1280px] w-full items-center flex flex-col ">
        <div className="w-full flex-col">
          <h2 className="lg:text-5xl font-extrabold font-urbanist text-[32px] lg:text-left text-center leading-tight text-gray-800 lg:w-1/2">
            {t("title")}
          </h2>
          <p className="text-gray-700 text-[16px] font-medium lg:text-left text-center mt-4 lg:w-1/2">
            {t("description")}
          </p>
        </div>
      </div>
      <div className="lg:justify-start  justify-center max-w-[1280px] flex ">
        <Link
          href={"/about-us"}
          className="mt-6 px-6 py-3 text-[#5C5C5B] font-medium bg-[#F4D7D9] shadow-lg rounded-[5px] transition "
          style={{ boxShadow: "5px 5px 0px 0px #00000080" }}
        >
          {t("button")}
        </Link>
      </div>
    </section>
  );
};

export default YourJourney;
