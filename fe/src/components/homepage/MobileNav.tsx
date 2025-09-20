"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";

// type Service = { title: string; href: string }[];

export function MobileNav() {
  const t = useTranslations("common");
  const services = t.raw("services");

  return (
    <Sheet>
      <div className="fixed top-0  z-[50] justify-between items-center flex w-full px-6 py-2">
        <Link href={"/"}>
          <Image
            src={"/logo.png"}
            width={180}
            height={180}
            alt="logo"
            className="lg:hidden  h-[40px] w-auto"
          />
        </Link>
        <SheetTrigger asChild className="lg:hidden z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Image
                src="/logo.png"
                width={80}
                height={80}
                alt="logo"
                className="object-contain"
              />
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 mt-8">
            <Link href="/" className="text-lg font-medium hover:text-primary">
              {t("navigation.home")}
            </Link>

            <Link
              href="/about-us"
              className="text-lg font-medium hover:text-primary -mb-4"
            >
              {t("navigation.about")}
            </Link>

            <Accordion type="single" collapsible>
              <AccordionItem value="services">
                <AccordionTrigger className="text-lg font-medium">
                  {t("navigation.services")}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2">
                    {services.map((service) => (
                      <Link
                        key={service.title}
                        href={service.href}
                        className="text-sm hover:text-primary transition-colors pl-4"
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* <Link
            href="https://info20f8c8e3b80.wpcomstaging.com/pricing/"
            className="text-lg font-medium hover:text-primary"
          >
            Pricing
          </Link> */}

            {/* <Link
              href="/pricing"
              className="text-lg font-medium hover:text-primary"
            >
              {t("navigation.pricing")}
            </Link> */}

            <Link
              href="/cities"
              className="text-lg font-medium hover:text-primary"
            >
              {t("navigation.cities")}
            </Link>

            <Link
              href="/moving-tips"
              className="text-lg font-medium hover:text-primary"
            >
              {t("navigation.movingTips")}
            </Link>

            <Link
              href="/get-quote"
              className="text-lg font-medium hover:text-primary"
            >
              {t("navigation.getQuote")}
            </Link>

            <Link
              href="/faq"
              className="text-lg font-medium hover:text-primary"
            >
              {t("navigation.faq")}
            </Link>

            <Link href={"/login"} className="font-semibold text-[14px]">
              <Button
                variant={"outline"}
                className="border border-[#3F3F3F] text-white bg-black hover:bg-primary hover:text-white shadow-md shadow-black"
              >
                {t("buttons.login")}
              </Button>
            </Link>
            <Link
              href={"/supplier-signup"}
              className="font-semibold text-[14px]"
            >
              <Button
                variant={"outline"}
                className="border border-[#3F3F3F] text-white bg-black hover:bg-primary hover:text-white shadow-md shadow-black"
              >
                {t("buttons.becomeAPartner")}
              </Button>
            </Link>
            <div className="flex justify-start">
              <LanguageSwitcher />
            </div>
          </div>
        </SheetContent>
      </div>
    </Sheet>
  );
}
