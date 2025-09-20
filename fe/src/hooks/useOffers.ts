import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchOffers } from "@/data/test/allOffers";
import { Filters } from "@/app/admin/quotations/page";

export function useOffers(
  page: number,
  pageSize: number,
  searchQuery: string,
  filters: Filters
) {
  return useQuery({
    queryKey: ["offers", page, pageSize, searchQuery, filters],
    queryFn: () => fetchOffers(page, pageSize, searchQuery, filters),
    placeholderData: keepPreviousData,
  });
}
