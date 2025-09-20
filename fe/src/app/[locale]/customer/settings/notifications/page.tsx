"use client";

import { Switch } from "@/components/ui/switch";
import BackHeader from "@/components/BackHeader";

import { useNotificationStore } from "@/store/notifications";
import { useTranslations } from "next-intl";

export default function NotificationsPage() {
  const { isCustomerPushEnabled, toggleCustomerPush } = useNotificationStore();
  const tCommon = useTranslations("common");

  return (
    <div>
      <BackHeader title={tCommon("notifications.titleSingular")} />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg">{tCommon("notifications.push")}</span>
          <Switch
            checked={isCustomerPushEnabled}
            onCheckedChange={toggleCustomerPush}
          />
        </div>
        {/* <div className="flex items-center justify-between">
          <span className="text-lg">Email Notifications</span>
          <Switch checked={isEmailEnabled} onCheckedChange={toggleEmail} />
        </div> */}
      </div>
    </div>
  );
}
