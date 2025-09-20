"use client";

import { Sheet } from "@/components/ui/sheet";
import { ArrowLeft } from "lucide-react";
import NavSheetContent from "../NavSheetContent";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function MobileNav() {
  const router = useRouter();
  const t = useTranslations("customers.disputeDetails");
  return (
    <Sheet>
      <div className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur-sm mt-4 items-center flex">
        <div className="flex items-center space-x-4 mb-2">
          <button onClick={() => router.back()} className="md:hidden">
            <ArrowLeft size={24} />
          </button>
          <div className="font-bold text-[20px] text-subtitle md:mb-4">
            {t("yourDisputes")}
          </div>
        </div>
      </div>
      <NavSheetContent />
    </Sheet>
  );
}
