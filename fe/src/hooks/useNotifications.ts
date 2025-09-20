/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface NotificationConfig {
  queryKey: string[];
  fetchFn: () => Promise<any>;
  onNewNotification?: (notification: any) => void;
  getNotificationMessage: (notification: any) => string;
  shouldNotify?: (notification: any, lastNotification: any) => boolean;
  pollingInterval?: number;
  icon?: string;
}

export function useNotifications({
  queryKey,
  fetchFn,
  onNewNotification,
  getNotificationMessage,
  shouldNotify = (notification, lastNotification) =>
    lastNotification?.id !== notification.id && !notification.is_read,
  pollingInterval = 30000,
  icon = "/logo.png",
}: NotificationConfig) {
  const lastNotificationRef = useRef<any>(null);

  const { data: notifications, ...queryResults } = useQuery({
    queryKey,
    queryFn: fetchFn,
    refetchInterval: pollingInterval,
  });

  useEffect(() => {
    if (!notifications?.length) return;

    const latestNotification = notifications[0];

    if (shouldNotify(latestNotification, lastNotificationRef.current)) {
      showLocalNotification(
        "New Notification",
        getNotificationMessage(latestNotification),
        icon
      );

      onNewNotification?.(latestNotification);
      lastNotificationRef.current = latestNotification;
    }
  }, [
    notifications,
    shouldNotify,
    getNotificationMessage,
    icon,
    onNewNotification,
  ]);

  return { notifications, ...queryResults };
}

function showLocalNotification(title: string, body: string, icon: string) {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body, icon });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body, icon });
      }
    });
  }
}
