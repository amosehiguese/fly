"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import PinkHeroSection from "@/components/WordPress/PinkHeroSection";
import MoneyBagSvg from "@/components/svg/icons/money-bag-icon";
import { motion } from "framer-motion";
import LearnMore from "@/components/homepage/YourJourney";
import Footer from "@/components/homepage/Footer";
import { useTranslations, useLocale } from "next-intl";
import Testimonials from "@/components/WordPress/Testimonials";

interface PricingPlan {
  id: number;
  title: string;
  description: string;
  price: string;
  features: Array<string>;
  color: string;
  borderColor: string;
  buttonBg: string;
  buttonTextColor: string;
  priceBgColor: string;
  priceTextColor: string;
  paddingVertical: string;
}

export default function Pricing() {
  const router = useRouter();
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const t = useTranslations("pricing");
  const tHome = useTranslations("home");
  const locale = useLocale();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const pricingPlans: PricingPlan[] = t.raw("plans");

  const handleBookNow = () => {
    router.push("/get-quote");
  };

  return (
    <main className="flex flex-col items-center overflow-x-hidden">
      <PinkHeroSection title={t("title")} description={t("description")} />

      {/* Pricing Cards Section */}
      <section
        className="max-w-[1280px] mt-16 w-full py-8 px-4 lg:px-16"
        aria-label="Pricing plans"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              className={`border-2 ${plan.borderColor} rounded-2xl overflow-hidden`}
              initial={{
                scale: plan.id === 1 ? 2 : 0.2,
                opacity: plan.id === 2 ? 1 : 0,
              }}
              whileInView={{
                scale: plan.id === 2 ? (isLargeScreen ? 1.1 : 1) : 1,
                opacity: 1,
              }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ ease: "easeInOut", duration: 1.5 }}
            >
              <div
                className={`${plan.color} text-center h-full flex flex-col`}
                role="article"
                aria-label={`${plan.title} plan`}
              >
                <div className="flex-1">
                  <div className="flex justify-center mb-5">
                    <div className="h-24 w-24 mt-8">
                      <MoneyBagSvg color={plan.id === 2 ? "#FFF" : "#BC2525"} />
                    </div>
                  </div>

                  <h3
                    className={`text-[24px] font-bold mb-3 font-urbanist ${
                      plan.id === 2 ? "text-white" : "text-[#3F3F3F]"
                    }`}
                  >
                    {plan.title}
                  </h3>

                  <p
                    className={`mb-6 leading-relaxed mx-6 ${
                      plan.id === 2 ? "text-white" : "text-[#3F3F3F]"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="flex justify-end  w-full">
                    <div
                      className={`${plan.priceBgColor} ${plan.priceTextColor} w-[85%] rounded-l-[32px] px-4 py-3 mb-6 flex items-center md justify-cente`}
                    >
                      <span className="mr-2 text-xl font-medium">
                        {t("startingAt")}
                      </span>
                      <span className="text-3xl md:text-5xl font-semibold">
                        {plan.price}
                      </span>
                      {locale === "en" && (
                        <span className="ml-2 text-xl font-medium">
                          /{t("hour")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 px-6 text-left mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <div
                          className={`h-5 w-5 rounded-full flex items-center justify-center ${
                            plan.color === "bg-red-600"
                              ? "bg-white text-red-600"
                              : "bg-red-600 text-white"
                          } mr-3`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span
                          className={`font-medium ${
                            plan.id === 2 ? "text-white" : "text-[#3F3F3F]"
                          }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  <button
                    onClick={handleBookNow}
                    className={`${plan.buttonBg} ${plan.buttonTextColor} w-full rounded-full py-3 px-10 font-medium text-sm transition-colors hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                    style={{
                      boxShadow: "2px 2px 0px 1px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    Get a Quote
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <LearnMore />
      <div className="">
        {/* Overlay for image only */}
        <div className="relative z-10 ">
          <div className="px-6 md:px-16 w-full flex flex-col items-center mt-20">
            <h2 className="font-urbanist font-extrabold text-3xl md:text-5xl antialiased">
              {tHome("testimonials.title")}
            </h2>
            <div className="mt-4 font-medium md:w-[50%]">
              {tHome("testimonials.subtitle")}
            </div>
            <Testimonials />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
