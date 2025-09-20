import { useQuery } from "@tanstack/react-query";
import { fetchSupplierById } from "@/api/admin";

export const useAdminSupplierDetails = (id: string) => {
  return useQuery({
    queryKey: ["admin-supplier", id],
    queryFn: () => fetchSupplierById(id),
    enabled: !!id,
  });
};
