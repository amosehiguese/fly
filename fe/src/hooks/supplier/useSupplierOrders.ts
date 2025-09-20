import { useQuery } from "@tanstack/react-query";
import api from "@/api";

export const useSupplierOrders = () => {
  return useQuery({
    queryKey: ["supplier-orders"],
    queryFn: async () => {
      const response = await api.get("api/suppliers/my-bids");
      return response.data;
    },
    enabled: true,
  });
};
