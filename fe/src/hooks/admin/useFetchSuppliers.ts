// import { AdminFilters, fetchAdminUsers } from "@/data/test/adminUsers";
// import {
//   keepPreviousData,
//   useQuery,
//   useQueryClient,
// } from "@tanstack/react-query";

// export function useAdminUsers(
//   page: number,
//   pageSize: number,
//   searchQuery: string,
//   filters: AdminFilters
// ) {
//   return useQuery({
//     queryKey: ["adminUsers", page, pageSize, searchQuery, filters],
//     queryFn: () => fetchAdminUsers(page, pageSize, searchQuery, filters),
//     placeholderData: keepPreviousData,
//   });
// }

// export function usePrefetchAdminUsers() {
//   const queryClient = useQueryClient();

//   const prefetchNext = (
//     page: number,
//     pageSize: number,
//     searchQuery: string,
//     filters: AdminFilters
//   ) => {
//     queryClient.prefetchQuery({
//       queryKey: ["adminUsers", page + 1, pageSize, searchQuery, filters],
//       queryFn: () => fetchAdminUsers(page + 1, pageSize, searchQuery, filters),
//     });
//   };

//   return { prefetchNext };
// }
