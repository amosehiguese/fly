import api from ".";

export const notificationsApi = {
  // Mark multiple notifications as read
  markAsRead: async (notificationIds: number[]) => {
    const response = await api.patch("/api/notifications/read", {
      notification_ids: notificationIds,
    });
    return response.data;
  },

  // Mark single notification as read
  markSingleAsRead: async (notificationId: number) => {
    const response = await api.patch(
      `/api/notifications/read/${notificationId}`
    );
    return response.data;
  },
};
