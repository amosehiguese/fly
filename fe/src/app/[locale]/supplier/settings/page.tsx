"use client";

import { Separator } from "@/components/ui/separator";
import { SignOutAlert } from "@/components/ui/SignOutAlert";
import { useSupplierDashboard } from "@/hooks/supplier";
import { Bell, HeadphonesIcon, Lock, LogOut, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const { data: user } = useSupplierDashboard();
  const t = useTranslations("supplier");

  return (
    <div>
      <div className="max-h-screen flex items-center gap-4 p-6 border-b">
        <Image
          src="/logo-round-black.png"
          alt="supplier pp"
          width={80}
          height={80}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-semibold">
            {user?.data?.supplier_details?.company_name}
          </h1>
          <p className="text-muted-foreground">
            {user?.data?.supplier_details?.contact_person}
          </p>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4 mx-4">
          {t("settings.title")}
        </h2>

        <div className="space-y-1">
          <div className="flex items-center p-2">
            <LanguageSwitcher variant="settings" />
          </div>

          <Link
            href="settings/security"
            className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <Lock className="h-6 w-6" />
              <span>{t("settings.security")}</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Link>

          <Link
            href="settings/notifications"
            className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <Bell className="h-6 w-6" />
              <span>{t("settings.notifications")}</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Link>

          <Link
            href="mailto:support@flyttman.se"
            className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <HeadphonesIcon className="h-6 w-6" />
              <span>{t("settings.support")}</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center gap-2 p-4">
          <SignOutAlert accountType="supplier">
            <button className="border-none flex gap-4 outline-none">
              <LogOut />
              {t("settings.logOut")}
            </button>
          </SignOutAlert>
        </div>
      </div>
    </div>
  );
}
