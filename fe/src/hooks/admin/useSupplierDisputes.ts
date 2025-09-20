import { useQuery } from "@tanstack/react-query";
import { fetchDisputes } from "@/api/admin";

export const useAdminSupplierDisputes = () => {
  return useQuery({
    queryKey: ["supplier-disputes"],
    queryFn: () => fetchDisputes(1, "", { orderStatus: "pending" }),
  });
};
