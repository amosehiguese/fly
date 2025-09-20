"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/api/customers";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

export function Nav({ className }: { className: string }) {
  const t = useTranslations("customers");
  const navItems: NavItem[] = [
    {
      title: t("nav.dashboard"),
      href: "/customer",
    },
    {
      title: t("nav.orders"),
      href: "/customer/orders",
    },
    {
      title: t("nav.disputes"),
      href: "/customer/disputes",
    },
    {
      title: t("nav.settings"),
      href: "/customer/settings",
    },
  ];
  const pathname = usePathname().split("/").slice(2).join("/");
  const { data } = useQuery({
    queryFn: fetchDashboard,
    queryKey: ["user-dashboard"],
  });
  const user = data?.user;
  const stats = data?.stats;

  return (
    <div
      className={cn(
        " md:flex md:flex-col hidden px-4 fixed top-0 left-0 w-[25vw]",
        className
      )}
    >
      <div className="">
        <div>
          <div>
            <Link href="/" className="flex-shrink-0 mr-8">
              <Image
                src="/logo.png"
                width={180}
                height={100}
                alt="logo"
                className="h-[40px] w-auto"
                priority
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
          </div>
        </div>
        <nav className="flex flex-col space-y-4 mt-4 bg-[#FCFCFC]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-lg rounded-lg transition-colors",
                pathname === item.href.substring(1) || // Remove leading slash for comparison
                  (item.href !== "/customer" &&
                    pathname.startsWith(item.href.substring(1)))
                  ? "border-l bg-white shadow-md border-primary"
                  : "hover:bg-accent"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
