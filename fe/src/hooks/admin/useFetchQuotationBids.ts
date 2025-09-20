import { fetchQuotationBidsById } from "@/api/admin";
import { useQuery } from "@tanstack/react-query";

export const useFetchQuotationBidsById = (id: string, type: string) => {
  return useQuery({
    queryKey: ["quotation-bids", id],
    queryFn: () => fetchQuotationBidsById(id, type),
    enabled: !!id,
  });
};
