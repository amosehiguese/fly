"use client";

import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function SecurityPage() {
  const t = useTranslations("common");

  return (
    <div>
      <BackHeader title={t("labels.security")} />
      <div className="p-6 space-y-4">
        <Link
          href="/customer/settings/security/change-password/request-otp"
          className="block w-full text-left p-4 rounded-lg hover:bg-accent"
        >
          {t("labels.changePassword")}
        </Link>
        <Link
          href="/customer/settings/security/update-info"
          className="block w-full text-left p-4 rounded-lg hover:bg-accent"
        >
          {t("labels.updateProfile")}
        </Link>
        {/* <button
          className="w-full text-left p-4 text-red-500 rounded-lg hover:bg-accent"
          onClick={() => console.log("Delete account clicked")}
        >
          {t("labels.deleteAccount")}
        </button> */}
      </div>
    </div>
  );
}
