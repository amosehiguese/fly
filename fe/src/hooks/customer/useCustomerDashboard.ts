import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/api/customers";

export const useCustomerDashboard = () => {
  return useQuery({
    queryFn: fetchDashboard,
    queryKey: ["user-dashboard"],
  });
};
