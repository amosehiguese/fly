"use client";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

const BecomePartnerSection = () => {
  const t = useTranslations("home.partner");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-primary/5 py-16 md:py-20 lg:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {t("title")}
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl mb-8 max-w-2xl">
              {t("description")}
            </p>
            <Link
              href="/partner"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t("cta")}
            </Link>
          </div>
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4">{t("benefits.title")}</h3>
              <ul className="space-y-4">
                {t
                  .raw("benefits.items")
                  .map((benefit: string, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="text-primary">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BecomePartnerSection;
