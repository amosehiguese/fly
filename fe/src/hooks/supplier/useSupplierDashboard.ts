import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/api/suppliers";

export const useSupplierDashboard = (status?: string) => {
  return useQuery({
    queryKey: ["supplier-dashboard", status],
    queryFn: () => fetchDashboard(status),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
