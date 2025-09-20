import { keepPreviousData, useQueryClient } from "@tanstack/react-query";

import {
  deleteQuotation,
  fetchQuotationById,
  fetchQuotations,
} from "@/api/admin";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Filters } from "@/app/[locale]/admin/quotes-bids/Quotation";
import { AxiosError } from "axios";
import { ErrorResponse, handleMutationError } from "@/api";
import { useLocale } from "next-intl";
import { toast } from "sonner";

interface FetchQuotationsProps {
  currentPage: number;
  searchQuery?: string;
  filters?: Filters;
}

export const useFetchQuotations = ({
  currentPage,
  searchQuery,
  filters,
}: FetchQuotationsProps) => {
  return useQuery({
    queryKey: ["quotations", currentPage, searchQuery, filters],
    queryFn: () => fetchQuotations(currentPage, searchQuery || "", filters),
    placeholderData: keepPreviousData, // Keeps previous page data while fetching next page
  });
};

export const useFetchQuotationById = (id: string, type: string) => {
  return useQuery({
    queryKey: ["quotation", id, type],
    queryFn: () => fetchQuotationById(id, type),
    enabled: !!id && !!type,
  });
};

export function usePrefetchOrders() {
  const queryClient = useQueryClient();

  const prefetchNext = (
    page: number,
    pageSize: number,
    searchQuery: string,
    filters: Filters
  ) => {
    queryClient.prefetchQuery({
      queryKey: ["orders", page + 1, pageSize, searchQuery, filters],
      queryFn: () => fetchQuotations(page + 1),
    });
  };

  return { prefetchNext };
}

export const useDeleteQuotation = (
  setOpenDeleteDialog: (open: boolean) => void
) => {
  const locale = useLocale();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) =>
      deleteQuotation(id, type),
    onError: (error: AxiosError<ErrorResponse>) => {
      handleMutationError(error, locale);
    },
    onSuccess: () => {
      setOpenDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success(
        locale === "sv"
          ? "Offerten har tagits bort"
          : "Quotation deleted successfully"
      );
    },
  });
};
