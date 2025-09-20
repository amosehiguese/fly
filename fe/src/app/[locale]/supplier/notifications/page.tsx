"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  NotificationsResponse,
  NotificationType,
} from "@/api/interfaces/suppliers/notifications";
import api from "@/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import useMarkNotificationAsRead from "@/hooks/useMarkNotificationAsRead";
import { useTranslations } from "next-intl";

export default function Page() {
  const router = useRouter();
  const t = useTranslations("common.notifications");
  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ["supplier-notifications"],
    queryFn: async () => {
      const { data } = await api.get("api/notifications/supplier");
      return data;
    },
  });

  const { markAllAsRead, markSingleAsRead } =
    useMarkNotificationAsRead("supplier");

  // Create a ref to store observer
  const observersRef = useRef<{ [key: string]: IntersectionObserver }>({});

  // Function to handle when notification becomes visible
  const handleNotificationVisible = (notificationId: number) => {
    if (!data?.notifications) return;

    const notification = data.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification && !notification.is_read) {
      markSingleAsRead(notificationId);
    }
  };

  // Set up intersection observer for notifications
  useEffect(() => {
    const observers = observersRef.current;

    return () => {
      Object.values(observers).forEach((observer) => {
        observer.disconnect();
      });
    };
  }, []);

  // Render notification item with observer

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const NotificationItem = ({ notification }: { notification: any }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!elementRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              handleNotificationVisible(notification.id);
              // Disconnect after marking as read
              observer.disconnect();
            }
          });
        },
        { threshold: 0.5 } // Trigger when 50% of the notification is visible
      );

      observer.observe(elementRef.current);
      observersRef.current[notification.id] = observer;

      return () => {
        observer.disconnect();
        delete observersRef.current[notification.id];
      };
    }, [notification]);

    return (
      <div
        ref={elementRef}
        className={cn(
          "flex justify-center gap-4 p-4 hover:bg-gray-50 transition-colors",
          !notification.is_read && "bg-gray-50"
        )}
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={200}
          height={200}
          className="rounded-full w-12 h-8"
        />
        <div className="flex-1">
          <p
            className={cn(
              "text-gray-900",
              !notification.is_read && "font-medium"
            )}
          >
            {notification.message}
          </p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    );
  };

  // Mark all notifications as read when the page loads
  useEffect(() => {
    if (data?.notifications && data.notifications.length > 0) {
      const unreadIds = data.notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);

      if (unreadIds.length > 0) {
        markAllAsRead(unreadIds);
      }
    }
  }, [data?.notifications, markAllAsRead]);

  // Move the array inside the component and use translations
  const notificationTypes: {
    type: string;
    notifications: NotificationType[];
  }[] = [
    {
      type: t("tabs.all"),
      notifications: [
        "profile_update",
        "new_bid",
        "bid_approved",
        "bid_accepted",
        "auction_won",
        "auction_completed",
        "payment",
        "review",
        "review_issue",
        "bid_rejected",
        "message",
        "dispute",
        "dispute_chat",
      ],
    },
    {
      type: t("tabs.bids"),
      notifications: [
        "new_bid",
        "bid_accepted",
        "bid_rejected",
        "payment",
        "message",
      ],
    },
    {
      type: t("tabs.jobs"),
      notifications: [
        "bid_approved",
        "bid_accepted",
        "auction_won",
        "auction_completed",
      ],
    },
    {
      type: t("tabs.disputes"),
      notifications: ["dispute", "dispute_chat"],
    },
  ];

  // Update the filterNotifications function to handle translated types
  const filterNotifications = (tab: string) => {
    if (!data?.notifications) return [];
    if (tab === t("tabs.all")) return data.notifications;

    const tabData = notificationTypes.find((item) => item.type === tab) as {
      type: string;
      notifications: NotificationType[];
    };
    return data.notifications.filter((notification) =>
      tabData?.notifications.includes(notification.type as NotificationType)
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="p-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl text-center w-full font-semibold">
            {t("title")}
          </h1>
        </div>
        {!data || data?.notifications.length < 0 ? (
          <div className="flex flex-col justify-center flex-1 h-[80vh] items-center">
            <Image
              src={"/empty-notification.png"}
              alt="no notification"
              width={500}
              height={500}
              className="w-36 h-36"
            />
            <div className="font-semibold text-subtitle text-[32px]">
              {t("noNotifications.title")}
            </div>
            <small className="mt-2 text-subtitle text-[16px] font-semibold">
              {t("noNotifications.description")}
            </small>
          </div>
        ) : (
          <Tabs defaultValue={t("tabs.all")} className="w-full">
            <TabsList className="w-full space-x-0 mx-4 px-0 justify-between pb-0 border-primary rounded-none h-auto bg-transparent border-t-0 border-b">
              {notificationTypes.map(({ type }) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
                >
                  {type}
                  {type === t("tabs.all") ? (
                    data?.unread_count && data.unread_count > 0 ? (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {data.unread_count}
                      </span>
                    ) : null
                  ) : (
                    filterNotifications(type).length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {filterNotifications(type).reduce(
                          (acc, curr) => acc + (curr.is_read ? 0 : 1),
                          0
                        )}
                      </span>
                    )
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {notificationTypes.map(({ type }) => (
              <TabsContent key={type} value={type} className="mt-0 mx-4">
                {isLoading ? (
                  <div className="space-y-4 p-4 w-full ">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filterNotifications(type).map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
