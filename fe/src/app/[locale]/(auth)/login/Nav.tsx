"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const Nav = () => {
  const t = useTranslations("common");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="logo"
            width={150}
            height={40}
            className="w-24 md:w-32"
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" className="font-bold">
              {t("nav.login")}
            </Button>
          </Link>
          <Link href="/supplier-signup">
            <Button className="font-bold">{t("buttons.becomeAPartner")}</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
