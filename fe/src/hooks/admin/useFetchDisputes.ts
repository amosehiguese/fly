import { fetchDisputes } from "@/api/admin";
import { DisputeFilters } from "@/app/admin/disputes/page";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";

import { useQuery } from "@tanstack/react-query";

interface FetchDisputesProps {
  currentPage: number;
  searchQuery?: string;
  filters?: DisputeFilters;
}

export const useFetchDisputes = ({
  currentPage,
  searchQuery,
  filters,
}: FetchDisputesProps) => {
  return useQuery({
    queryKey: ["disputes", currentPage, searchQuery, filters],
    queryFn: () => fetchDisputes(currentPage, searchQuery || "", filters),
    placeholderData: keepPreviousData, // Keeps previous page data while fetching next page
  });
};

export function usePrefetchDisputes() {
  const queryClient = useQueryClient();

  const prefetchNext = (
    page: number,
    pageSize: number,
    searchQuery: string,
    filters: DisputeFilters
  ) => {
    queryClient.prefetchQuery({
      queryKey: ["orders", page + 1, pageSize, searchQuery, filters],
      queryFn: () => fetchDisputes(page + 1),
    });
  };

  return { prefetchNext };
}
