import { fetchDisputeById } from "@/api/admin";
import { useQuery } from "@tanstack/react-query";

export const useFetchDisputeById = (id: string) => {
  return useQuery({
    queryKey: ["dispute", id],
    queryFn: () => fetchDisputeById(id),
  });
};
