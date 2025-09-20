"use client";

import { Separator } from "@/components/ui/separator";
import { SignOutAlert } from "@/components/ui/SignOutAlert";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import { Bell, HeadphonesIcon, LogOut, ChevronRight, User } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("customers.settings");
  const { data: user } = useCustomerDashboard();

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
          <h1 className="text-2xl font-semibold">{user?.user.fullname}</h1>
          <p className="text-muted-foreground">{user?.user.email}</p>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4 mx-4">{t("title")}</h2>

        <div className="space-y-1">
          <div className="flex items-center p-2">
            <LanguageSwitcher variant="settings" />
          </div>

          <Link
            href="settings/security"
            className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <User className="h-6 w-6" />
              <span>{t("profile")}</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Link>

          <Link
            href="settings/notifications"
            className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <Bell className="h-6 w-6" />
              <span>{t("notifications")}</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Link>

          <Link
            href="mailto:support@flyttman.se"
            className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-4">
              <HeadphonesIcon className="h-6 w-6" />
              <span>{t("support")}</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center gap-2 p-4">
          <SignOutAlert accountType="customer">
            <button className="border-none flex gap-4 outline-none">
              <LogOut />
              {t("logOut")}
            </button>
          </SignOutAlert>
        </div>
      </div>
    </div>
  );
}
