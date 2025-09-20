import React from "react";
import { Button } from "./ui/button";
import AnimatedImage from "./AnimatedImage";
import { useTranslation } from "react-i18next";

const services = [
  {
    key: "piano",
    image: "/piano-moving.jpg",
  },
  {
    key: "packing",
    image: "/moving-packing.jpg",
  },
  {
    key: "carrying",
    image: "/carrying-aid.jpg",
  },
];

const OurMovingServices = () => {
  const { t } = useTranslation("services");

  return (
    <section className="flex flex-col items-center">
      <div className="text-[26px] text-[#4A4A4A] font-bold my-2">
        {t("title")}
      </div>
      <div className="md:w-[60%] mb-8 text-body">{t("subtitle")}</div>

      <div className="w-full grid gap-4 md:grid-cols-3">
        {services.map((item, index) => (
          <div className="relative" key={item.key}>
            <AnimatedImage
              src={item.image}
              width={1000}
              height={1000}
              className="lg:h-[60vh] h-[30vh] rounded-[16px] filter brightness-75"
              alt={t(`services.${item.key}.title`)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: index }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 },
                marginRight: "12px",
              }}
            />
            <div
              id="our-moving-services-overlay"
              className="absolute inset-0 pointer-events-none flex flex-col mx-4 items-center justify-center text-white bg-transparent rounded-[16px]"
            >
              <h3 className="text-primary font-bold text-[20px] mb-2">
                {t(`services.${item.key}.title`)}
              </h3>
              <h3 className="text-white font-medium line-clamp-4 custom-clamp-4">
                {t(`services.${item.key}.description`)}
              </h3>
              <Button className="mt-4">
                {t(`services.${item.key}.readMore`)}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurMovingServices;
