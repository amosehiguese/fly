"use client";

import AnimatedDiv from "@/components/AnimatedDiv";
import CarryingAssistanceSvg from "@/components/svg/icons/carrying-assistance";
import CompanyRelocationSvg from "@/components/svg/icons/company-relocation";
import EstateClearanceSvg from "@/components/svg/icons/estate-clearance";
import EvacuationMoveSvg from "@/components/svg/icons/evacuation-move";
import HeavyLiftingSvg from "@/components/svg/icons/heavy-lifting";
import JunkRemovalSvg from "@/components/svg/icons/junk-removal";
import LocalMovingSVG from "@/components/svg/icons/local-moving";
import LongDistanceMoveSvg from "@/components/svg/icons/long-distance-move";
import MoveOutCleaningSvg from "@/components/svg/icons/move-out-cleaning";
import MovingAbroadSvg from "@/components/svg/icons/moving-abroad";
import PrivacyMoveSvg from "@/components/svg/icons/privacy-move";
import StorageSvg from "@/components/svg/icons/storage";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import React from "react";
import ServiceIcon1 from "../svg/icons/serrvice-icon1";
import ServiceIcon2 from "../svg/icons/service-icon2";
import ServiceIcon3 from "../svg/icons/service-icon3";
import ServiceIcon4 from "../svg/icons/service-icon4";

const moveTypes = [
  {
    name: "Move locally",
    nameSv: "Flytta lokalt",
    type: "moving-service,local_move",
    icon: <LocalMovingSVG />,
    iconSv: <ServiceIcon1 />,
    href: "/services/local-moving/",
  },
  {
    name: "Long-distance move",
    nameSv: "Långdistansflytt",
    type: "moving-service,long_distance_move",
    icon: <LongDistanceMoveSvg />,
    iconSv: <ServiceIcon2 />,
    href: "/services/long-distance-move/",
  },
  {
    name: "Moving abroad",
    nameSv: "Utlandsflytt",
    type: "moving-service,moving_abroad",
    icon: <MovingAbroadSvg />,
    iconSv: <ServiceIcon3 />,
    href: "/services/moving-abroad/",
  },
  {
    name: "Company relocation",
    nameSv: "Företagsflytt",
    type: "company-relocation",
    icon: <CompanyRelocationSvg />,
    iconSv: <ServiceIcon4 />,
    href: "/services/company-relocation/",
  },
  {
    name: "Move-out cleaning",
    nameSv: "Flyttstädning",
    type: "move-out-cleaning",
    icon: <MoveOutCleaningSvg />,
    iconSv: <ServiceIcon1 />,
    href: "/services/move-out-cleaning/",
  },
  {
    name: "Storage",
    nameSv: "Magasin",
    type: "storage",
    icon: <StorageSvg />,
    iconSv: <ServiceIcon2 />,
    href: "/services/storage/",
  },
  {
    name: "Heavy lifting",
    nameSv: "Tungflytt",
    type: "heavy-lifting",
    icon: <HeavyLiftingSvg />,
    iconSv: <ServiceIcon3 />,
    href: "/services/heavy-lifting/",
  },
  {
    name: "Carrying assistance",
    nameSv: "Bärhjälp",
    type: "carrying-assistance",
    icon: <CarryingAssistanceSvg />,
    iconSv: <ServiceIcon4 />,
    href: "/services/carrying-assistance/",
  },
  {
    name: "Junk Removal",
    nameSv: "Avfallshantering",
    type: "junk-removal",
    icon: <JunkRemovalSvg />,
    iconSv: <ServiceIcon1 />,
    href: "/services/junk-removal/",
  },
  {
    name: "Estate emptying",
    nameSv: "Dödsbotömning",
    type: "estate-clearance",
    icon: <EstateClearanceSvg />,
    iconSv: <ServiceIcon2 />,
    href: "/services/estate-clearance/",
  },
  {
    name: "Evacuation Move",
    nameSv: "Evakueringsflytt",
    type: "evacuation-move",
    icon: <EvacuationMoveSvg />,
    iconSv: <ServiceIcon3 />,
    href: "/services/evacuation-move/",
  },
  {
    name: "Private Move",
    nameSv: "Sekretessflytt",
    type: "privacy-move",
    icon: <PrivacyMoveSvg />,
    iconSv: <ServiceIcon4 />,
    href: "/services/privacy-move/",
  },
];

const OurServices = () => {
  const t = useTranslations("home.services");
  const locale = useLocale();

  return (
    <section className="px-6 md:px-16 w-full py-12 bg-[#FFF1F2] mb-12 lg:mb-24 flex flex-col items-center ">
      <div className="max-w-[1280px] w-full md:mb-8">
        <h2 className="text-3xl font-livvic md:text-5xl mb-4 font-extrabold text-center">
          {t("title")}
        </h2>
        <p className="text-[#5C5B5B] md:text-xl font-medium text-center">
          {t("description")}
        </p>
      </div>
      <AnimatedDiv
        initial={{ y: 100, opacity: 0.5 }}
        whileInView={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
        viewport={{ once: true, amount: 0.2 }}
        className=" max-w-[1280px] mt-4 grid grid-cols-1 lg:grid-cols-4 gap-y-12 w-full justify-items-center "
      >
        {moveTypes.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="w-[90px] h-[120px] lg:w-[100px] md:h-[133px] hover:scale-110 ease-in-out transition-transform duration-300 "
          >
            {item.icon}
            <div className="flex flex-col items-center ">
              <p className="font-bold w-[200px] text-center -mt-4 font-urbanist md:text-lg  text-[#3F3F3F]">
                {locale === "en" ? item.name : item.nameSv}
              </p>
            </div>
          </Link>
        ))}
      </AnimatedDiv>
    </section>
  );
};

export default OurServices;
