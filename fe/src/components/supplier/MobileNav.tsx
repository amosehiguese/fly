"use client";

import React from "react";
import { Sheet, SheetTrigger } from "../ui/sheet";
import NavSheetContent from "./NavSheetContent";
import { Bell } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useSupplierDashboard } from "@/hooks/supplier";
import { useSupplierNotifications } from "@/hooks/supplier/useSupplierNotifications";
import { useConversations } from "@/hooks/useChat";
import { useTranslations } from "next-intl";
// import { useSupplierConversations } from "@/hooks/supplier/useSupplierMessages";

const MobileNav = () => {
  const pathname = usePathname();
  const t = useTranslations("supplier.nav");
  const { data } = useSupplierDashboard();
  const { data: notifications } = useSupplierNotifications();
  const { data: conversations } = useConversations();
  const supplierDetails = data?.data.supplier_details;
  const unReadMessagesCount = conversations?.reduce(
    (acc, curr) => acc + curr.unread_count,
    0
  );

  if (pathname !== `/supplier`) return null;
  return (
    <Sheet>
      <header className="sticky top-0 z-50 w-full border-b bg-white/60 backdrop-blur-sm px-2">
        <div className="container flex h-14 sm:h-16 items-center w-full justify-between px-2 sm:px-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <SheetTrigger className="lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </SheetTrigger>
            <div>
              {/* <Link href="/supplier">
                <Image
                  width={400}
                  height={400}
                  quality={100}
                  alt="logo"
                  className="w-16 h-8 sm:w-24 sm:h-12"
                  src={"/logo.png"}
                />
              </Link> */}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/supplier" className="flex items-center gap-2">
              <span className="text-sm sm:text-xl font-bold truncate max-w-[120px] sm:max-w-none">
                {t("greeting")} {supplierDetails?.company_name}
              </span>
            </Link>
          </div>

          <div className="flex  items-center gap-2 sm:gap-4">
            <Link href="/supplier/notifications" className="relative">
              <Bell className="h-6 w-6 sm:h-6 sm:w-6" />
              <div
                className={`absolute -right-1 -top-2 ${
                  (notifications?.unread_count || 0) > 0
                    ? "bg-red-600"
                    : "bg-inherit"
                }  flex h-4 w-4 sm:h-4 sm:w-4 items-center justify-center rounded-full text-[8px] sm:text-[10px] text-white`}
              >
                {(notifications?.unread_count || 0) > 0 && (
                  <div
                    className={` flex h-3 w-3 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-600 text-[8px] sm:text-[10px] text-white`}
                  >
                    <span>{notifications?.unread_count}</span>
                  </div>
                )}
              </div>
            </Link>

            <Link href="/supplier/chats" className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 sm:h-6 sm:w-6"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {(unReadMessagesCount || 0) > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-600 text-[8px] sm:text-[10px] text-white">
                  {unReadMessagesCount || 0}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <NavSheetContent />
    </Sheet>
  );
};

export default MobileNav;
