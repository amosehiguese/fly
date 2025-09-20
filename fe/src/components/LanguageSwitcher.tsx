"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
// import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

type LanguageSwitcherProps = {
  variant?: "default" | "settings";
};

const LanguageSwitcher = ({ variant = "default" }: LanguageSwitcherProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common");
  const [mounted, setMounted] = useState(false);

  // Available languages
  const languages = [
    { code: "en", name: t("languages.english"), flag: "/uk-flag.png" },
    { code: "sv", name: t("languages.swedish"), flag: "/sweden-flag.png" },
  ];

  // Find current language
  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  // Only execute on client, since cookies are not accessible on server
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle language switching
  const switchLanguage = (newLocale: string) => {
    // console.log("pathname", pathname);
    const path = pathname.split("/")[2];

    if (path === "customer") {
      router.replace(`/${newLocale}/customer/`);
    } else if (path === "supplier") {
      router.replace(`/${newLocale}/supplier/`);
    } else if (path === "driver") {
      router.replace(`/${newLocale}/driver/`);
    } else if (path === "admin") {
      router.replace(`/${newLocale}/admin/`);
    } else {
      router.push(pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`));
    }
  };

  // Don't render anything until the component is mounted
  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center h-8 px-3 py-2 ${
            variant === "settings" ? "gap-4" : "gap-2"
          }`}
        >
          <Image
            src={currentLanguage.flag}
            alt={currentLanguage.name}
            width={20}
            height={15}
            className="rounded-sm"
          />
          <span className="text-sm">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentLanguage.code === lang.code ? "bg-accent" : ""
            }`}
          >
            <Image
              src={lang.flag}
              alt={lang.name}
              width={20}
              height={15}
              className="rounded-sm"
            />
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
