import { keepPreviousData, useQueryClient } from "@tanstack/react-query";

import {
  fetchBids,
  fetchCheckoutById,
  fetchOrderById,
  fetchOrders,
} from "@/api/admin";
import { useQuery } from "@tanstack/react-query";
import { OrderFilters } from "@/app/[locale]/admin/orders/page";

interface FetchOrdersProps {
  currentPage: number;
  searchQuery?: string;
  filters?: OrderFilters;
}

export const useFetchOrders = ({
  currentPage,
  searchQuery,
  filters,
}: FetchOrdersProps) => {
  return useQuery({
    queryKey: ["orders", currentPage, searchQuery, filters],
    queryFn: () => fetchOrders(currentPage, searchQuery || "", filters),
    placeholderData: keepPreviousData, // Keeps previous page data while fetching next page
  });
};

export const useFetchOrderById = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
  });
};

export function usePrefetchOrders() {
  const queryClient = useQueryClient();

  const prefetchNext = (
    page: number,
    pageSize: number,
    searchQuery: string,
    filters: OrderFilters
  ) => {
    queryClient.prefetchQuery({
      queryKey: ["orders", page + 1, pageSize, searchQuery, filters],
      queryFn: () => fetchBids(page + 1),
    });
  };

  return { prefetchNext };
}

export const useFetchCheckoutById = (id: string) => {
  return useQuery({
    queryKey: ["admin-checkout", id],
    queryFn: () => fetchCheckoutById(id),
    enabled: !!id,
  });
};
