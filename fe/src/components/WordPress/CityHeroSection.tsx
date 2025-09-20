import AnimatedHeader from "@/components/AnimatedHeader";
import AnimatedImage from "@/components/AnimatedImage";
import { Link } from "@/i18n/navigation";
import React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

const CityHeroSection = ({ city }: { city: string }) => {
  const t = useTranslations("home.hero");
  const locale = useLocale();

  return (
    <AnimatedHeader
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative w-full flex mb-8 md:mb-0 flex-col-reverse md:flex-col items-center justify-center md:justify-between lg:py-16 z-[2] "
    >
      <div className="max-w-[1280px] flex flex-col-reverse md:flex-row justify-between ">
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
          <div className="absolute inset-0 bg-white/90" />
        </div>
        {/* Text Content with Background */}
        <div className="relative text-center md:text-left mt-8 md:mt-0 w-full md:w-1/2 ml:6 md:ml-16 ">
          {/* Background Container */}

          {/* Text Content */}
          <div className="relative z-10 md: mt-8 2xl:mt-12 ">
            {locale === "en" ? (
              <>
                <h1 className="md:text-4xl font-urbanist text-black text-xl leading-none font-extrabold">
                  {`Flyttman - Your moving company in ${city}`}
                </h1>
                <p className="text-black mt-4 mx-3 md:mx-0 ">
                  {`Looking for a reliable moving company in ${city}? Flyttman offers safe and efficient moving services, both within ${city} and to destinations across Sweden. We tailor every move with personal service 24/7 at competitive prices. As part of Sweden's most trusted network of moving companies, we combine national strength with local expertise in ${city}. With extensive experience and careful handling, we ensure your move is simple and secure.`}
                </p>
              </>
            ) : (
              <>
                <h1 className="md:text-4xl  font-urbanist text-black text-xl leading-none font-extrabold">
                  {`Flyttman - Din flyttfirma i ${city}`}
                </h1>
                <p className="text-black mt-4 mx-3 md:mx-0 ">{`Söker du en pålitlig flyttfirma i ${city}? Flyttman erbjuder trygg och effektiv flytthjälp, både inom ${city} och till destinationer i hela Sverige. Vi skräddarsyr varje flytt med personlig service 24/7 till konkurrenskraftiga priser. Som en del av Sveriges mest pålitliga nätverk av flyttfirmor kombinerar vi nationell styrka med lokal expertis i ${city}. Med lång erfarenhet och varsam hantering ser vi till att din flytt blir enkel och trygg.`}</p>
              </>
            )}

            <Link href="/get-quote">
              <button className="mt-6 px-6 py-3 2xl:px-8 2xl:py-4 4xl:px-10  md:text-lg 4xl:text-xl text-black font-medium bg-[#F4D7D9] shadow-lg rounded-[5px] transition hover:bg-[#F4D7D9]/90">
                {t("cta.primary")}
              </button>
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="relative z-10 mr-6 ml-6 md:ml-0 md:mr-16">
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

export default CityHeroSection;
