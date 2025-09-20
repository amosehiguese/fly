import { fetchMyOrderById } from "@/api/customers";
import { useQuery } from "@tanstack/react-query";

export const useFetchMyOrderById = (id: string) => {
  return useQuery({
    queryKey: ["customer-order", id],
    queryFn: () => fetchMyOrderById(id),
    enabled: !!id,
  });
};
