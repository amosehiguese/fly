import { useQuery } from "@tanstack/react-query";

import { fetchQuotationById } from "@/api/suppliers";

export const useFetchQuotationById = (id: string, type: string) => {
  return useQuery({
    queryKey: ["supplier-quotation", id],
    queryFn: () => fetchQuotationById(id, type),
    enabled: !!id,
  });
};
