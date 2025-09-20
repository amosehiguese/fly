import { fetchDashboardCounts } from "@/api/admin";
import { useQuery } from "@tanstack/react-query";

export const useDashboardCounts = () => {
  return useQuery({
    queryKey: ["dasboard-counts"],
    queryFn: fetchDashboardCounts,
  });
};
