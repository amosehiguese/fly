import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { Dispute } from "@/api/interfaces/admin/disputes";

interface DisputeDetailsResponse {
  message: string;
  data: Dispute;
}

export const useDisputeDetails = (id: string) => {
  return useQuery({
    queryKey: ["dispute-details", id],
    queryFn: async () => {
      const response = await api.get<DisputeDetailsResponse>(
        `api/disputes/${id}`
      );
      return response.data;
    },
  });
};
