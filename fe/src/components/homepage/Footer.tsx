"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
export default function Footer() {
  const t = useTranslations("common.footer");

  const tCommon = useTranslations("common");
  const tServices = tCommon.raw("services");
  console.log("tServices", tServices, Array.isArray(tServices));

  return (
    <footer className="bg-[#1F1F1F] text-white w-full py-16">
      <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-11 gap-8">
        {/* Logo and Description */}
        <div className="space-y-4 col-span-3">
          <Image
            src="/logo.png"
            alt={t("logoAlt")}
            width={200}
            height={80}
            className="mb-4"
          />
          <p className="text-gray-300 max-w-sm">{t("description")}</p>
          {/* <div className="flex space-x-4 mt-6">
            <Link
              href="https://facebook.com/flyttman"
              className="hover:text-primary"
            >
              <Facebook className="w-6 h-6" />
            </Link>
            <Link
              href="https://youtube.com/flyttman"
              className="hover:text-primary"
            >
              <Youtube className="w-6 h-6" />
            </Link>
            <Link
              href="https://linkedin.com/company/flyttman"
              className="hover:text-primary"
            >
              <Linkedin className="w-6 h-6" />
            </Link>
          </div> */}
        </div>

        {/* Quick Links */}
        <div className="col-span-2">
          <h3 className="text-xl font-semibold mb-4">{t("about.title")}</h3>
          <ul className="space-y-3">
            {[
              {
                name: t("about.items.0"),
                href: "/",
              },
              {
                name: t("about.items.1"),
                href: "/about-us",
              },
              {
                name: t("about.items.2"),
                href: "/cities",
              },
              // {
              //   name: t("about.items.3"),
              //   href: "/pricing",
              // },
              {
                name: t("about.items.4"),
                href: "/moving-tips",
              },
              {
                name: t("about.items.5"),
                href: "/faq",
              },
              {
                name: t("about.items.6"),
                href: "/privacy-policy",
              },
            ].map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  target={item.href === "/privacy-policy" ? "_blank" : "_self"}
                  className="text-gray-300 hover:text-primary"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services Column 1 */}
        <div className="col-span-2">
          <h3 className="text-xl font-semibold mb-4">{t("services.title")}</h3>
          <ul className="space-y-3">
            {tServices
              ?.slice(0, 6)
              ?.map(
                (service: { title: string; href: string }, index: number) => (
                  <li key={index.toString()}>
                    <Link
                      href={service.href}
                      className="text-gray-300 hover:text-primary"
                    >
                      {service.title}
                    </Link>
                  </li>
                )
              )}
          </ul>
        </div>

        {/* Services Column 2 & Contact */}
        <div className="col-span-2">
          <h3 className="text-xl font-semibold mb-4">{t("services.title")}</h3>
          <ul className="space-y-3">
            {tServices
              ?.slice(6, 12)
              ?.map(
                (service: { title: string; href: string }, index: number) => (
                  <li key={index.toString()}>
                    <Link
                      href={service.href}
                      className="text-gray-300 hover:text-primary"
                    >
                      {service.title}
                    </Link>
                  </li>
                )
              )}
          </ul>
        </div>
        <div className="col-span-2">
          <h3 className="text-xl font-semibold mt-8 mb-4">
            {t("contact.title")}
          </h3>
          <ul className="space-y-3">
            {/* <li className="flex items-center space-x-3">
              <Phone className="w-5 h-5" />
              <span>(877)-555-6666</span>
            </li> */}
            <li className="flex items-center space-x-3">
              <Mail className="w-5 h-5" />
              <a
                href="mailto:support@flyttman.se"
                className="hover:text-primary transition-colors"
              >
                support@flyttman.se
              </a>
            </li>
            {/* <li className="flex items-center space-x-3">
              <MapPin className="w-5 h-5" />
              <span>123 Main Street</span>
            </li> */}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-800">
        <p className="text-center text-gray-400">{t("allRightsReserved")}</p>
        <p className="text-center text-gray-400">{t("poweredBy")}</p>
      </div>
    </footer>
  );
}
