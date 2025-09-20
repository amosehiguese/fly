import { keepPreviousData, useQueryClient } from "@tanstack/react-query";

import { deleteBid, fetchBidById, fetchBids } from "@/api/admin";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BidFilters } from "@/app/[locale]/admin/quotes-bids/Bids";
import { toast } from "sonner";
import { ErrorResponse, handleMutationError } from "@/api";
import { AxiosError } from "axios";
import { useLocale } from "next-intl";

interface FetchBidsProps {
  currentPage: number;
  searchQuery?: string;
  filters?: BidFilters;
}

export const useFetchBids = ({
  currentPage,
  searchQuery,
  filters,
}: FetchBidsProps) => {
  return useQuery({
    queryKey: ["bids", currentPage, searchQuery, filters],
    queryFn: () => fetchBids(currentPage, searchQuery || "", filters),
    placeholderData: keepPreviousData, // Keeps previous page data while fetching next page
  });
};

export const useFetchBidById = (id: string) => {
  return useQuery({
    queryKey: ["bid", id],
    queryFn: () => fetchBidById(id),
    enabled: !!id,
  });
};

export const useDeleteBid = (setOpenDeleteDialog: (open: boolean) => void) => {
  const locale = useLocale();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBid(id),
    onSuccess: () => {
      toast.success(
        locale === "en" ? "Bid deleted successfully" : "Bid raderad"
      );
      queryClient.invalidateQueries({ queryKey: ["bids"] });
      setOpenDeleteDialog(false);
    },
    onError: (error: AxiosError<ErrorResponse>) =>
      handleMutationError(error, locale),
  });
};

export function usePrefetchBids() {
  const queryClient = useQueryClient();

  const prefetchNext = (
    page: number,
    pageSize: number,
    searchQuery: string,
    filters: BidFilters
  ) => {
    queryClient.prefetchQuery({
      queryKey: ["bids", page + 1, pageSize, searchQuery, filters],
      queryFn: () => fetchBids(page + 1),
    });
  };

  return { prefetchNext };
}
