import { fetchMyDisputes } from "@/api/customers";
import { useQuery } from "@tanstack/react-query";

export const useFetchMyDisputes = () => {
  return useQuery({
    queryKey: ["my-disputes"],
    queryFn: fetchMyDisputes,
  });
};
