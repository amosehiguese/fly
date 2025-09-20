import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFixedPercentage, updateFixedPercentage } from "@/api/admin";
import { toast } from "sonner";

export function useFixedPercentage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["fixed-percentage"],
    queryFn: getFixedPercentage,
  });

  const mutation = useMutation({
    mutationFn: updateFixedPercentage,
    onSuccess: (data) => {
      toast.success(data.message || "Fixed percentage updated successfully");
      queryClient.invalidateQueries({ queryKey: ["fixed-percentage"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update fixed percentage");
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    updatePercentage: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
