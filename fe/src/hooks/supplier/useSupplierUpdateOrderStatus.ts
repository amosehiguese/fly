import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "@/api/suppliers";
import type { UpdateOrderStatusRequest } from "@/api/interfaces/suppliers";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { ErrorResponse, handleMutationError } from "@/api";
import { useLocale } from "next-intl";
import { AxiosError } from "axios";

export const useSupplierUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  return useMutation({
    mutationFn: (data: UpdateOrderStatusRequest) => updateOrderStatus(data),
    onSuccess: (data) => {
      const defaultMessages = {
        en: "Order status updated successfully!",
        sv: "Orderstatus har uppdaterats!",
      };
      const displayMessage =
        locale === "sv"
          ? data.messageSv || defaultMessages.sv
          : data.message || defaultMessages.en;
      toast.success(displayMessage);
      queryClient.invalidateQueries({
        queryKey: ["supplier-dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["supplier-earnings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["quotation"],
      });
      queryClient.invalidateQueries({
        queryKey: ["supplier-ongoing-order"],
      });

      router.refresh();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: AxiosError<ErrorResponse, any>) =>
      handleMutationError(error, locale),
  });
};
