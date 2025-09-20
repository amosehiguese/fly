import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSupplierDashboard } from "@/hooks/supplier";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  BriefcaseIcon,
  CircleDollarSign,
  DollarSignIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UserPlusIcon,
} from "lucide-react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import React from "react";
import { SignOutAlert } from "../ui/SignOutAlert";
import { Separator } from "../ui/separator";
import { useTranslations } from "next-intl";

const NavSheetContent = () => {
  const pathname = usePathname();
  const t = useTranslations("supplier.nav");
  const { data: supplier } = useSupplierDashboard();
  const supplierDetails = supplier?.data.supplier_details;

  const navItems = [
    {
      title: t("menu.dashboard"),
      href: "/supplier",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: t("menu.jobs"),
      href: "/supplier/jobs",
      icon: <BriefcaseIcon />,
    },
    {
      title: t("menu.earnings"),
      href: "/supplier/earnings",
      icon: <DollarSignIcon />,
    },
    {
      title: t("menu.drivers"),
      href: "/supplier/drivers",
      icon: <UserPlusIcon />,
    },
    {
      title: t("menu.tips"),
      href: "/supplier/tips",
      icon: <CircleDollarSign />,
    },
    {
      title: t("menu.settings"),
      href: "/supplier/settings",
      icon: <SettingsIcon />,
    },
  ];

  return (
    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
      <SheetHeader>
        <SheetTitle>
          <Link href="/supplier">
            <Image
              width={100}
              height={100}
              alt="logo"
              className="w-24 h-12"
              src={"/logo.png"}
            />
          </Link>
          <div className="mt-8 flex space-x-2 ">
            <Avatar className="w-12 h-12">
              <AvatarImage
                className="w-12 h-12 rounded-full"
                src="/pp-placeholder.jpg"
                alt="@shadcn"
              />
              <AvatarFallback>PP</AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight justify-center text-subtitle">
              <div className="text-[13px] font-medium ">
                {supplierDetails?.company_name || "user"}
              </div>
              <div className="text-[10px] font-light">
                {supplierDetails?.email}
              </div>
            </div>
          </div>

          {/* <div className="border-[#E70C18] border rounded-[10px] py-2 my-8 grid grid-cols-3">
            <div className="leading-[1.5]">
              <div className="text-subtitle text-center font-medium">
                {stats?.totalQuotations}
              </div>
              <div className="text-[#C4C4C4] text-center font-medium text-[12px]">
                Quotes
              </div>
            </div>
            <div className="leading-[1.5]">
              <div className="text-subtitle text-center font-medium">
                {stats?.totalOrders}
              </div>
              <div className="text-[#C4C4C4] text-center font-medium text-[12px]">
                Orders
              </div>
            </div>
            <div className="leading-[1.5]">
              <div className="text-subtitle text-center font-medium">
                {stats?.totalDisputes}
              </div>
              <div className="text-[#C4C4C4] text-center font-medium text-[12px]">
                Disputes
              </div>
            </div>
          </div> */}
        </SheetTitle>
      </SheetHeader>
      <nav className="flex flex-col space-y-4 mt-4 bg-[#FCFCFC]">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-lg rounded-lg transition-colors",
              pathname === item.href
                ? "border-l rounded-lg bg-white shadow-md border-primary"
                : "hover:bg-accent"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
        <Separator className="mb-2 mt-4" />
        <SignOutAlert accountType="supplier">
          <button className="px-3 py-2 text-lg rounded-lg transition-colors flex gap-2">
            <LogOutIcon />
            {t("menu.logout")}
          </button>
        </SignOutAlert>
      </nav>
    </SheetContent>
  );
};

export default NavSheetContent;
