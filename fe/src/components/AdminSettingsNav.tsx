"use client";

import React, { useEffect, useState } from "react";
import { LinkProps } from "next/link";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/navigation";
import GeneralSettingsIcon from "./svg/icons/settings-general";
import UserManagementSettingsIcon from "./svg/icons/settings-user-management";
import { Lock, Menu, PercentCircle } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "./ui/sheet";
import Image from "next/image";
import LogOutAlert from "./LogOutAlert";
import { useTranslations } from "next-intl";

interface ActiveLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  className?: string;
  children: React.ReactNode;
  activeClassName?: string;
}

const AdminSettingsNav = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations("admin.settings.nav");

  const navs = [
    {
      title: t("general"),
      icon: <GeneralSettingsIcon color="currentColor" />,
      href: "/admin/settings",
    },
    {
      title: t("userManagement"),
      icon: <UserManagementSettingsIcon color="currentColor" />,
      href: "/admin/settings/manage-users",
    },
    {
      title: t("autoBidPercentage"),
      icon: <PercentCircle color="currentColor" />,
      href: "/admin/settings/auto-bid",
    },
    {
      title: t("changePassword"),
      icon: <Lock color="currentColor" />,
      href: "/admin/settings/request-password-reset",
    },
  ];

  const ActiveLink: React.FC<ActiveLinkProps> = ({
    href,
    className,
    children,
    activeClassName = " bg-[#F1D3CF] text-black dark:text-black",
    ...props
  }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

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
    <div className="mt-4 flex flex-col items-start w-full gap-y-4">
      {navs.map((item, index) => (
        <ActiveLink
          href={item.href}
          className="flex gap-x-3 text-black dark:text-white items-center w-full px-2 rounded-[10px] py-2 hover:bg-[#F1D3CF]/[0.5]"
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
    <div className="flex flex-col items-center pt-4 px-4 overflow-y-auto lg:min-w-[250px] lg:w-[250px] w-0">
      <div className="lg:hidden fixed top-20 -left-45 bg-transparent  p-4 flex items-center justify-between z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="">
            <button className=" p-2">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-6 ">
            <SheetTitle></SheetTitle>
            <div className="flex flex-col h-full">
              <Image
                src="/white-logo.png"
                width={80}
                height={80}
                alt="logo"
                className="mb-6"
              />
              <div className="text-black font-bold mb-4">{t("menu")}</div>
              <NavLinks />
              <div className="mt-4">
                <LogOutAlert sideEffectFunction={handleLinkClick} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="lg:flex lg:flex-col hidden w-full">
        <NavLinks />
        <div className="mt-4">
          <LogOutAlert />
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsNav;
