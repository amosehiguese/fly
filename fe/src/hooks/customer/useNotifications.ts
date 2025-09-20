import api from "@/api";
import { NotificationsResponse } from "@/api/interfaces/customers/notifications";
import { useQuery } from "@tanstack/react-query";

export const useNotifications = () => {
  return useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("api/notifications/customer");
      return data;
    },
  });
};
