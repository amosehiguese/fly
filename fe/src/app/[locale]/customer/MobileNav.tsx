"use client";

import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu, MessageSquareText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/api/customers";
import NavSheetContent from "./NavSheetContent";
import { useNotifications } from "@/hooks/customer/useNotifications";

import Link from "next/link";
import { useConversations } from "@/hooks/useChat";
import { useTranslations } from "next-intl";

export function MobileNav() {
  const t = useTranslations("customers");
  const { data } = useQuery({
    queryFn: fetchDashboard,
    queryKey: ["user-dashboard"],
  });
  const user = data?.user;
  const { data: notifications } = useNotifications();
  const { data: conversations } = useConversations();

  const unReadCounts =
    conversations?.reduce((acc, item) => {
      return acc + (item.unread_count || 0);
    }, 0) || 0;

  return (
    <Sheet>
      <header className="w-full">
        <div className="container px-0 sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b">
          <div className="w-full justify-between py-2 items-center flex">
            <div className="flex items-center">
              <SheetTrigger asChild className="md:hidden">
                <div className="p-0 mr-2">
                  <Menu size={32} />
                </div>
              </SheetTrigger>
              <div className="w-[50vw] md:w-auto">
                <div className="font-bold text-[20px] text-subtitle">
                  {t("dashboard.greeting.hi")} {user?.fullname || "user"},
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Link href={"/customer/notifications"}>
                  <Bell className="" size={24} />
                </Link>

                {notifications?.unread_count !== undefined &&
                  Number(notifications.unread_count) > 0 && (
                    <div>
                      <span className="absolute -top-2 -right-[6px] bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {notifications?.unread_count}
                      </span>
                    </div>
                  )}
              </div>
              <div className="relative">
                <Link href={"customer/chats"}>
                  <MessageSquareText className="" size={24} />
                </Link>

                {(unReadCounts || 0) > 0 && (
                  <span className="absolute -top-2 left-3 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {unReadCounts}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="font-medium text-subtitle pb-4 ">
            {t("dashboard.subtitle")}
          </div>
        </div>
        <NavSheetContent />
      </header>
    </Sheet>
  );
}
