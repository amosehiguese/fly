import { fetchAdmins } from "@/api/admin";
import { AdminFilters, fetchAdminUsers } from "@/data/test/adminUsers";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function useFetchAdmins() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchAdmins(),
    placeholderData: keepPreviousData,
  });
}

export function usePrefetchAdminUsers() {
  const queryClient = useQueryClient();

  const prefetchNext = (
    page: number,
    pageSize: number,
    searchQuery: string,
    filters: AdminFilters
  ) => {
    queryClient.prefetchQuery({
      queryKey: ["adminUsers", page + 1, pageSize, searchQuery, filters],
      queryFn: () => fetchAdminUsers(page + 1, pageSize, searchQuery, filters),
    });
  };

  return { prefetchNext };
}
