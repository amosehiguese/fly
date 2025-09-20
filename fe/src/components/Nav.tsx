"use client";

import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  // NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  // NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { MobileNav } from "./MobileNav";

import { LinkProps } from "next/link";

interface ActiveLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  className?: string;
  children: React.ReactNode;
  activeClassName?: string;
}

const ActiveLink: React.FC<ActiveLinkProps> = ({
  href,
  className,
  children,
  activeClassName = "text-primary",
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

const Nav = () => {
  const router = useRouter();
  return (
    <>
      <MobileNav />
      <nav className="md:flex hidden z-50 flex-row justify-center fixed top-4 left-1/2 transform -translate-x-1/2 bg-background rounded-md md:px-8 py-2">
        <NavigationMenu className="max-w-[90%] shadow:md flex items-center px-4 md:px-12">
          <Image
            src={"/logo.png"}
            width={100}
            height={100}
            alt="logo"
            className="mr-12 hidden md;flex"
          />
          <NavigationMenuList className="gap-0">
            <ActiveLink href={"/"} className="font-semibold text-[14px] mr-4">
              Home
            </ActiveLink>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="font-semibold">
                About us
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="font-semibold">
                Services
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="font-semibold">
                Contact us
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>

          <NavigationMenuList className="ml-12 space-x-2">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="font-semibold">
                EN
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <Button>Sign Up</Button>
            <Button
              variant={"outline"}
              className=" border border-primary text-primary"
              onClick={() => router.push("/login")}
            >
              Log In
            </Button>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </>
  );
};

export default Nav;
