import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendBid } from "@/api/suppliers";
import type { SendBidRequest } from "@/api/interfaces/suppliers";

export const useSupplierBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendBidRequest) => sendBid(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supplier-dashboard"],
      });
    },
  });
};
