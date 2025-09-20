"use client";

import React from "react";
import ThemeToggle from "./ThemeToggle";
import BellDot from "./svg/icons/bell-dot";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAdminUser } from "@/hooks/useUser";
import { capitalizeWords } from "@/lib/capitalizeWords";
import { MessageSquareText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import { useAdminConversations } from "@/hooks/useChat";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

const AdminHeaderBar = () => {
  const { data: admin } = useAdminUser();
  const { data } = useAdminConversations();
  const unreadMessagesCount =
    data?.reduce((acc, item) => {
      return acc + (item.unread_count || 0);
    }, 0) || 0;
  const pathname = usePathname();
  // const unreadMessages = messages
  //   ?.flatMap((message) => message.unread_count)
  //   .reduce((acc, curr) => acc + curr, 0);

  // const pathName =
  // console.log("pathname", pathname);
  // const title = pathname.split("/").pop()?.replace(/-/g, " ");

  const t = useTranslations("admin.nav");

  const navs = [
    {
      title: t("items.dashboard"),
      href: "/admin",
    },
    {
      title: t("items.quotesAndBids"),
      href: "/admin/quotes-bids",
    },
    {
      title: t("items.orders"),
      href: "/admin/orders",
    },
    // {
    //   title: "Bids",
    //   icon: <BidsIcon color="currentColor" />,
    //   href: "/admin/bids",
    // },
    {
      title: t("items.disputes"),
      href: "/admin/disputes",
    },

    {
      title: t("items.finance"),
      href: "/admin/finance",
    },
    {
      title: t("items.suppliers"),
      href: "/admin/suppliers",
    },
    {
      title: t("items.flyttmanAI"),
      href: "/admin/assistant",
    },
    {
      title: t("items.settings"),
      href: "/admin/settings",
    },
  ];

  const getActivePageTitle = () => {
    // Normalize the pathname by removing trailing slash
    const normalizedPath = pathname.replace(/\/$/, "");

    // If we're at the root admin page
    if (normalizedPath === "/admin") {
      return t("items.dashboard");
    }

    // Find the most specific matching nav item
    const matchingNavs = navs.filter((nav) =>
      normalizedPath.startsWith(nav.href.replace(/\/$/, ""))
    );

    // Get the nav item with the longest href (most specific match)
    const activeNav = matchingNavs.reduce(
      (longest, current) =>
        current.href.length > longest.href.length ? current : longest,
      matchingNavs[0]
    );

    return activeNav?.title || "";
  };

  const title = getActivePageTitle();

  return (
    <div className="flex justify-between px-2  md:px-8 md:mt-2 mt-32 mb-2 md:mb-0 items-center w-screen md:w-full">
      <h1 className="md:text-[28px] capitalize text-[20px] mr-2 font-bold text-[#373737] dark:text-white">
        {title}
      </h1>
      <div className="flex gap-x-4 items-center">
        <LanguageSwitcher />
        <ThemeToggle />
        {/* <div className="bg-[#F4F4F2] dark:bg-[#D3D3D3]  flex md:w-8 md:h-12 w-6 h-10 justify-center items-center rounded-[8px]">
          <BellDot />
        </div> */}
        <div className="flex gap-2 items-center">
          {/* <div className="relative">
                <Link href={"/customer/notifications"}>
                  <Bell className="" size={20} />
                </Link>

                {notifications?.unread_count !== undefined &&
                  Number(notifications.unread_count) > 0 && (
                    <div>
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {notifications?.unread_count}
                      </span>
                    </div>
                  )}
              </div> */}
          <div className="relative">
            <Link href={"/admin/chats"}>
              <MessageSquareText className="" size={28} />
            </Link>

            {(unreadMessagesCount || 0) > 0 && (
              <span className="absolute top-0 left-5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            )}
          </div>
        </div>

        <Separator orientation="vertical" className="h-8 w-[2px]" />
        <div className="flex gap-x-2">
          <Avatar>
            <AvatarImage
              src="https://s3-alpha-sig.figma.com/img/98bc/0212/5fd98d9c8b4654b6f7604f3ded553bb4?Expires=1736726400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=BR-6A-pTosjCY3H5TGqxdvOCRPAmVuW5WUOoN73rDEVHQAF38K8kQI4XwMyqOYF4e--g6ztGsmcQP6Zo4-9l2yD9-H3OTIJmcH7DoFGY3rLtlatvSXTcVe4591B8K6Gf1EmlxDg7Abikx81hThRahYPcv16scHuWhlxH5Cxe8V~1dhn3C7hOz2UYyHAP4hznZDQ0R9G3fjvz1IQP3~ek~Cs1Z8aRRrUqskoj47CX6E1xvdCFgp8Dw~pMyFtJgPN42gsakvS4Dp9SUGh7xmgQhqhpNx5HNEHmmbK5tEEo9wXf-FMHZzqdGSnDa5v3eBeUnEkoE1SSLH-413cPrvwZuw__"
              alt="@shadcn"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-between">
            <small className="text-subtitle font-bold dark:text-white">
              {admin?.username}
            </small>
            <small className="text-subtitle text-[12px] md:text-[14px] dark:text-white font-light">
              {capitalizeWords(admin?.role)}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeaderBar;
