import { useQuery } from "@tanstack/react-query";
import { getOngoingOrder } from "@/api/suppliers";
import type { OngoingOrderRequest } from "@/api/interfaces/suppliers";

export const useSupplierOngoingOrder = (data: OngoingOrderRequest) => {
  // console.log("data", data);
  return useQuery({
    queryKey: ["supplier-ongoing-order", data.order_id],
    queryFn: () => getOngoingOrder(data),
    enabled: !!data.order_id,
  });
};
