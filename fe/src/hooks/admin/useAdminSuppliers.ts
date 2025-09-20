import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { fetchSuppliers, updateSupplierStatus } from "@/api/admin";
import type { UpdateSupplierStatusRequest } from "@/api/interfaces/admin/suppliers";

interface SupplierFilters {
  company_name?: string;
  reg_status?: string;
  start_date?: string;
  end_date?: string;
}

export const useAdminSuppliers = (filters?: SupplierFilters) => {
  return useQuery({
    queryKey: ["admin-suppliers", filters],
    queryFn: () => fetchSuppliers(filters),
    placeholderData: keepPreviousData,
  });
};

export const useUpdateSupplierStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSupplierStatusRequest) =>
      updateSupplierStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
    },
  });
};
