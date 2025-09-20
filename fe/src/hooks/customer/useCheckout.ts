import { useQuery } from "@tanstack/react-query";
import { fetchCheckoutData } from "@/api/customers";

export const useCheckout = (order_id: string) => {
  return useQuery({
    queryKey: ["checkout", order_id],
    queryFn: () => fetchCheckoutData(order_id),
    enabled: !!order_id,
  });
};
