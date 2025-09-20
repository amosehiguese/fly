"use client";

import api from "@/api";
import { NotificationsResponse } from "@/api/interfaces/customers/notifications";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

export const useSupplierNotifications = () => {
  const previousLength = useRef<number>(0);

  return useQuery<NotificationsResponse>({
    queryKey: ["supplier-notifications"],
    queryFn: async () => {
      const { data } = await api.get("api/notifications/supplier");

      // Check if there are new notifications
      if (
        previousLength.current &&
        data.unread_count > previousLength.current
      ) {
        showLocalNotification("New Message", "You have a new message");
      }

      // Update the previous length
      previousLength.current = data.unread_count;

      return data;
    },
    refetchInterval: 300000, // Poll every 30 seconds
  });
};

function showLocalNotification(title: string, body: string) {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/logo.png", // Add your app icon
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, {
          body,
          icon: "/logo.png",
        });
      }
    });
  }
}
