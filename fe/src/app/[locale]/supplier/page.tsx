"use client";

import Dashboard from "@/components/supplier/Dashboard";
import { Marketplace } from "@/components/supplier/Marketplace";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("supplier");

  return (
    <div className="container bg-white">
      <Dashboard />

      <div>
        <p className="text-[16px] text-[#373737] font-semibold mb-2">
          {t("dashboard.newJobListings")}
        </p>
      </div>

      <Marketplace />
    </div>
  );
}
