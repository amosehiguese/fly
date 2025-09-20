// import { fetchOrders } from "@/data/test/allOrders";
// import { Filters } from "@/app/admin/orders/page";
// import {
//   keepPreviousData,
//   useQuery,
//   useQueryClient,
// } from "@tanstack/react-query";

// export function useOrders(
//   page: number,
//   pageSize: number,
//   searchQuery: string,
//   filters: Filters
// ) {
//   return useQuery({
//     queryKey: ["orders", page, pageSize, searchQuery, filters],
//     queryFn: () => fetchOrders(page, pageSize, searchQuery, filters),
//     placeholderData: keepPreviousData, // Keeps previous page data while fetching next page
//   });
// }

// export function usePrefetchOrders() {
//   const queryClient = useQueryClient();

//   const prefetchNext = (
//     page: number,
//     pageSize: number,
//     searchQuery: string,
//     filters: Filters
//   ) => {
//     queryClient.prefetchQuery({
//       queryKey: ["orders", page + 1, pageSize, searchQuery, filters],
//       queryFn: () => fetchOrders(page + 1, pageSize, searchQuery, filters),
//     });
//   };

//   return { prefetchNext };
// }
