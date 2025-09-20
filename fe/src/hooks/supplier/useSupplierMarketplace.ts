import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMarketplace } from "@/api/suppliers";
import type { MarketplaceFilters } from "@/api/interfaces/suppliers";

export const useSupplierMarketplace = (
  filters: Omit<MarketplaceFilters, "page">
) => {
  // Remove empty filters
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Partial<MarketplaceFilters>);

  return useInfiniteQuery({
    queryKey: ["supplier-marketplace", cleanFilters],
    queryFn: ({ pageParam = 1 }) =>
      fetchMarketplace({ ...cleanFilters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage >= lastPage.pagination.totalPages) {
        return undefined;
      }
      return lastPage.pagination.currentPage + 1;
    },
    initialPageParam: 1,
  });
};
