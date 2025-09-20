"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function MobileNav() {
  const router = useRouter();
  const t = useTranslations("customers.orderDetails");
  return (
    <header className="sticky top-0 z-50 py-2 bg-white/80 backdrop-blur-sm">
      <div className="w-full mt-2 items-center flex">
        <div className="flex items-center space-x-4 ">
          <button onClick={() => router.back()} className="md:hidden">
            <ArrowLeft size={32} />
          </button>
          <div className="font-bold text-[20px] md:mb-4 text-black">
            {t("yourOrders")}
          </div>
        </div>
      </div>
    </header>
  );
}
