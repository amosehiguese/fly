import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";

interface AuctionStatusResponse {
  auctionEnabled: boolean;
  message: string;
}

export function useAuctionStatus() {
  const queryClient = useQueryClient();

  const query = useQuery<AuctionStatusResponse>({
    queryKey: ["auction-status"],
    queryFn: async () => {
      const { data } = await api.get("/api/admins/auction/status");
      return data;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const mutation = useMutation({
    mutationFn: async (newStatus: boolean) => {
      const { data } = await api.post("/api/admins/auction/toggle", {
        auction_enabled: newStatus,
      });
      return data;
    },
    onMutate: async (newStatus) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["auction-status"] });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData<AuctionStatusResponse>([
        "auction-status",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<AuctionStatusResponse>(["auction-status"], {
        auctionEnabled: newStatus,
        message: `Auction mode is currently ${newStatus ? "enabled" : "disabled"}`,
      });

      // Return context with the snapshotted value
      return { previousStatus };
    },
    onError: (err, newStatus, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["auction-status"], context?.previousStatus);
    },

    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      queryClient.invalidateQueries({ queryKey: ["auction-status"] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    toggleAuction: mutation.mutate,
    isToggling: mutation.isPending,
  };
}
