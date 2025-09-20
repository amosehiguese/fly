"use client";

import { Switch } from "@/components/ui/switch";
import BackHeader from "@/components/BackHeader";
import { useNotificationStore } from "@/store/notifications";
import { useTranslations } from "next-intl";

export default function NotificationsPage() {
  const { isSupplierPushEnabled, toggleSupplierPush } = useNotificationStore();
  const tCommon = useTranslations("common");

  return (
    <div>
      <BackHeader title={tCommon("notifications.titleSingular")} />
      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-lg">{tCommon("notifications.push")}</span>
          <Switch
            checked={isSupplierPushEnabled}
            onCheckedChange={toggleSupplierPush}
          />
        </div>
      </div>
    </div>
  );
}
