import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications";

type AccountType = "supplier" | "customer";

export default function useMarkNotificationAsRead(accountType: AccountType) {
  const queryClient = useQueryClient();
  const invalidateQueryKey =
    accountType === "supplier" ? ["supplier-notifications"] : ["notifications"];

  const {
    mutate: markAllAsRead,
    isPending,
    error,
  } = useMutation({
    mutationFn: (notificationIds: number[]) =>
      notificationsApi.markAsRead(notificationIds),
    onSuccess: () => {
      // Invalidate and refetch notifications

      queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
    },
    onError: (error) =>
      console.log("error patching notification as read", error.message),
    // onError: handleMutationError,
  });

  const { mutate: markSingleAsRead } = useMutation({
    mutationFn: (notificationId: number) =>
      notificationsApi.markSingleAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
    },
    onError: (error) =>
      console.log("error patching notification as read", error.message),
    // onError: handleMutationError,
  });

  return {
    markAllAsRead,
    markSingleAsRead,
    isPending,
    error,
  };
}
