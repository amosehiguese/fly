"use client";

import Image from "next/image";
import React, { useEffect } from "react";
import DashboardIcon from "./svg/icons/dashboard";
import QuotationIcon from "./svg/icons/quotation";
// import OrdersIcon from "./svg/icons/orders";
// import BidsIcon from "./svg/icons/bids";
import DisputesIcon from "./svg/icons/disputes";
import SettingsIcon from "./svg/icons/settings";
import { LinkProps } from "next/link";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";
import OrdersIcon from "./svg/icons/orders";
import { DollarSign, Landmark, Menu, UsersIcon } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "./ui/sheet";
import RobotIcon from "./svg/icons/RobotIcon";
import { useTranslations } from "next-intl";

interface ActiveLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  className?: string;
  children: React.ReactNode;
  activeClassName?: string;
}

const AdminNav = () => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("admin.nav");

  const navs = [
    {
      title: t("items.dashboard"),
      icon: <DashboardIcon color="currentColor" />,
      href: "/admin",
    },
    {
      title: t("items.quotesAndBids"),
      icon: <QuotationIcon color="currentColor" />,
      href: "/admin/quotes-bids",
    },
    {
      title: t("items.orders"),
      icon: <OrdersIcon color="currentColor" />,
      href: "/admin/orders",
    },
    // {
    //   title: "Bids",
    //   icon: <BidsIcon color="currentColor" />,
    //   href: "/admin/bids",
    // },
    {
      title: t("items.disputes"),
      icon: <DisputesIcon color="currentColor" />,
      href: "/admin/disputes",
    },

    {
      title: t("items.finance"),
      icon: <Landmark />,
      href: "/admin/finance",
    },
    {
      title: t("items.suppliers"),
      icon: <UsersIcon color="currentColor" />,
      href: "/admin/suppliers",
    },
    {
      title: t("items.tips"),
      icon: <DollarSign color="currentColor" />,
      href: "/admin/tips",
    },
    {
      title: t("items.flyttmanAI"),
      icon: <RobotIcon color="currentColor" />,
      href: "/admin/assistant",
    },
    {
      title: t("items.settings"),
      icon: <SettingsIcon color="currentColor" />,
      href: "/admin/settings",
    },
  ];

  const ActiveLink: React.FC<ActiveLinkProps> = ({
    href,
    className,
    children,
    activeClassName = "text-black bg-white text-black",
    ...props
  }) => {
    const pathname = usePathname();
    const isActive =
      href === `/admin`
        ? pathname === `/admin`
        : pathname.startsWith(`${href}`);

    return (
      <Link
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {children}
      </Link>
    );
  };

  const NavLinks = () => (
    <div className="flex flex-col items-start w-full gap-y-4">
      {navs.map((item, index) => (
        <ActiveLink
          href={item.href}
          className="flex gap-x-3 items-center text-white w-full pl-2 rounded-lg py-2 hover:bg-gray-400 transition-colors"
          key={index}
        >
          <div className="w-6">{item.icon}</div>
          <div className="font-medium">{item.title}</div>
        </ActiveLink>
      ))}
    </div>
  );

  const handleLinkClick = () => {
    setOpen(false);
  };

  useEffect(() => {
    handleLinkClick();
  }, [pathname]);

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-black dark:bg-black p-4 flex items-center justify-between z-50">
        <Link href="/admin">
          <Image src="/white-logo.png" width={80} height={80} alt="logo" />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="text-white p-2">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] bg-black dark:bg-black/[0.8] p-6 "
          >
            <SheetTitle></SheetTitle>
            <div className="flex flex-col h-full">
              <Link href="/admin">
                <Image
                  src="/white-logo.png"
                  width={80}
                  height={80}
                  alt="logo"
                  className="mb-6"
                />
              </Link>
              <div className="text-white font-bold mb-4">{t("menu")}</div>
              <NavLinks />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <div className="md:flex flex-col md:fixed hidden w-[25vw] xl:w-[18vw] min-h-[100vh] items-center pt-4 px-4 bg-black overflow-y-auto">
        <Link href="/admin">
          <Image src={"/white-logo.png"} width={100} height={100} alt="logo" />
        </Link>
        <div className="text-white flex w-full justify-start mt-2 font-bold">
          {t("menu")}
        </div>
        <NavLinks />
      </div>
    </>
  );
};

export default AdminNav;
