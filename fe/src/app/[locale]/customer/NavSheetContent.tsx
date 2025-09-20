import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SignOutAlert } from "@/components/ui/SignOutAlert";
import { useCustomerDashboard } from "@/hooks/customer/useCustomerDashboard";
import { cn } from "@/lib/utils";
import { Home, ShoppingCart, SwordsIcon, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import React from "react";
import { useTranslations } from "next-intl";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

const NavSheetContent = () => {
  const t = useTranslations("customers");
  const pathname = usePathname();
  const { data } = useCustomerDashboard();
  const user = data?.user;
  const stats = data?.stats;

  const navItems: NavItem[] = [
    {
      title: t("nav.dashboard"),
      href: "/customer",
      icon: <Home className="w-4 h-4" />,
    },
    {
      title: t("nav.orders"),
      href: "/customer/orders",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      title: t("nav.disputes"),
      href: "/customer/disputes",
      icon: <SwordsIcon className="w-4 h-4" />,
    },
    {
      title: t("nav.settings"),
      href: "/customer/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
      <SheetHeader>
        <SheetTitle>
          <Link href="/customer">
            <Image
              width={100}
              height={100}
              alt="logo"
              className="w-24 h-12"
              src={"/logo.png"}
            />
          </Link>
          <div className="mt-8 flex space-x-2 ">
            <Avatar className="">
              <AvatarImage src="/pp-placeholder.jpg" alt="@shadcn" />
              <AvatarFallback>PP</AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight justify-center text-subtitle">
              <div className="text-[13px] font-medium ">
                {user?.fullname || "user"}
              </div>
              <div className="text-[10px] font-light">{user?.email}</div>
            </div>
          </div>

          <div className="border-[#E70C18] border rounded-[10px] py-2 my-8 grid grid-cols-3">
            <div className="leading-[1.5]">
              <div className="text-subtitle text-center font-medium">
                {stats?.totalQuotations}
              </div>
              <div className="text-[#C4C4C4] text-center font-medium text-[12px]">
                {t("nav.stats.quotes")}
              </div>
            </div>
            <div className="leading-[1.5]">
              <div className="text-subtitle text-center font-medium">
                {stats?.totalOrders}
              </div>
              <div className="text-[#C4C4C4] text-center font-medium text-[12px]">
                {t("nav.stats.orders")}
              </div>
            </div>
            <div className="leading-[1.5]">
              <div className="text-subtitle text-center font-medium">
                {stats?.totalDisputes}
              </div>
              <div className="text-[#C4C4C4] text-center font-medium text-[12px]">
                {t("nav.stats.disputes")}
              </div>
            </div>
          </div>
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
        <Separator />
        <div className="flex items-center gap-2 px-3">
          <LogOut className="w-4 h-4" />

          <SignOutAlert accountType="customer">
            <button className="border-none outline-none">
              {t("nav.logOut")}
            </button>
          </SignOutAlert>
        </div>
      </nav>
    </SheetContent>
  );
};

export default NavSheetContent;
