"use client";

import Link from "next/link";
import { Home, MessageSquare, Clock, User, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function DriverNavigation() {
  const t = useTranslations("driver");
  const pathname = usePathname();

  const isActive = (path: string) => {
    // Handle root driver path
    if (path === "/driver" && pathname === "/driver") {
      return true;
    }
    // Handle other paths
    return pathname.startsWith(path) && path !== "/driver";
  };

  const navItems = [
    { href: "/driver", icon: Home, label: t("nav.home") },
    { href: "/driver/tips", icon: DollarSign, label: t("nav.tips") },
    { href: "/driver/chats", icon: MessageSquare, label: t("nav.messages") },
    { href: "/driver/jobs", icon: Clock, label: t("nav.jobs") },
    // { href: "/driver/analytics", icon: BarChart, label: t("nav.analytics") },
    { href: "/driver/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden bg-white border-t p-2 grid grid-cols-5 text-xs text-gray-600 fixed bottom-0 left-0 right-0 z-10">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1",
              isActive(item.href) && "text-green-600"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Desktop Side Navigation */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r h-screen fixed left-0 top-0">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">{t("nav.title")}</h1>
        </div>
        <div className="flex flex-col p-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center p-3 rounded-lg mb-1 hover:bg-gray-100",
                isActive(item.href)
                  ? "bg-green-50 text-green-600"
                  : "text-gray-700"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer for the mobile bottom navigation */}
      {/* <div className="h-14 lg:hidden"></div> */}
    </>
  );
}
