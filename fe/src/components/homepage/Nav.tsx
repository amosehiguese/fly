"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { MobileNav } from "./MobileNav";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Remove Shadcn imports and keep only what we need
import { LinkProps } from "next/link";

interface ActiveLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  className?: string;
  children: React.ReactNode;
  activeClassName?: string;
  locale?: "en" | "sv";
}

const ActiveLink: React.FC<ActiveLinkProps> = ({
  href,
  className,
  children,
  activeClassName = "text-primary",
  ...props
}) => {
  const pathname = usePathname();
  console.log("pathname", pathname);
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`${className || ""} ${isActive ? activeClassName : ""} hover:text-primary/80 text-nowrap`}
      {...props}
    >
      {children}
    </Link>
  );
};

const Nav = () => {
  const t = useTranslations("common");
  const services: { title: string; href: string }[] = t.raw("services");
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setServicesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <MobileNav />
      <nav className="hidden lg:flex absolute top-0 z-50 w-full bg-transparent font-medium font-livvic text-[16px]">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[1280px] px-6 lg:px-16 ">
            <div className="w-full">
              <div className="flex w-full items-center justify-between py-4">
                {/* Logo - Left aligned */}
                <Link href="/" className="flex-shrink-0 mr-8">
                  <Image
                    src="/logo.png"
                    width={180}
                    height={50}
                    alt="logo"
                    className="h-[40px] w-auto"
                    priority
                  />
                </Link>

                {/* Center Navigation Items */}
                <div className="flex items-center w-full justify-between mr-4">
                  <div>
                    <ActiveLink href="/">{t("navigation.home")}</ActiveLink>
                  </div>

                  <div>
                    <ActiveLink href="/about-us">
                      {t("navigation.about")}
                    </ActiveLink>
                  </div>

                  {/* Services Dropdown */}
                  <div className="relative" ref={servicesRef}>
                    <button
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className="flex items-center bg-transparent text-[16px] px-2 hover:text-primary/80"
                    >
                      {t("navigation.services")}
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`ml-1 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                      >
                        <path d="M4 6H11L7.5 10.5L4 6Z" fill="currentColor" />
                      </svg>
                    </button>
                    {servicesOpen && (
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-md border shadow-lg z-50">
                        <ul className="grid min-w-[300px] gap-3 p-4">
                          {services.map((service, index) => (
                            <li
                              key={index.toString()}
                              className={
                                index !== services.length - 1
                                  ? "border-b border-gray-200"
                                  : ""
                              }
                            >
                              <Link
                                href={service.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">
                                  {service.title}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* <div>
                    <ActiveLink href="/pricing">
                      {t("navigation.pricing")}
                    </ActiveLink>
                  </div> */}

                  <div>
                    <ActiveLink href={locale === "en" ? "/cities" : "/stader"}>
                      {t("navigation.cities")}
                    </ActiveLink>
                  </div>

                  <div>
                    <ActiveLink href="/get-quote">
                      {t("navigation.getQuote")}
                    </ActiveLink>
                  </div>

                  <div>
                    <ActiveLink href="/moving-tips">
                      {t("navigation.movingTips")}
                    </ActiveLink>
                  </div>

                  <div>
                    <ActiveLink href="/faq">{t("navigation.faq")}</ActiveLink>
                  </div>
                </div>

                {/* Right-aligned items */}
                <div className="flex items-center gap-2 lg:gap-4">
                  {/* Language Dropdown */}
                  <div className="notranslate mx-2 relative">
                    <LanguageSwitcher />
                  </div>

                  <ActiveLink href="/login">
                    <button className="border border-[#3F3F3F] text-white bg-black hover:bg-primary hover:text-white shadow-md shadow-black text-sm px-4 py-2 rounded-md">
                      {t("buttons.login")}
                    </button>
                  </ActiveLink>
                  <ActiveLink href="/supplier-signup">
                    <button className="border border-[#3F3F3F] text-white bg-black hover:bg-primary hover:text-white shadow-md shadow-black text-sm px-4 py-2 rounded-md">
                      {t("buttons.becomeAPartner")}
                    </button>
                  </ActiveLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Nav;
