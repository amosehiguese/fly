import { useQuery } from "@tanstack/react-query";
import { fetchSupplierEarnings } from "@/api/suppliers";

export const useSupplierEarnings = () => {
  return useQuery({
    queryKey: ["supplier-earnings"],
    queryFn: fetchSupplierEarnings,
  });
};
