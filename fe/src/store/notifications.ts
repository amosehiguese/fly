import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  isCustomerPushEnabled: boolean;
  isSupplierPushEnabled: boolean;
  toggleCustomerPush: () => void;
  toggleSupplierPush: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      isCustomerPushEnabled: false,
      isSupplierPushEnabled: false,
      toggleCustomerPush: () =>
        set((state) => ({
          isCustomerPushEnabled: !state.isCustomerPushEnabled,
        })),
      toggleSupplierPush: () =>
        set((state) => ({
          isSupplierPushEnabled: !state.isSupplierPushEnabled,
        })),
    }),

    {
      name: "notification-settings",
    }
  )
);
