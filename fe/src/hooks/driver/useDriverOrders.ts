import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { handleDriverMutationError } from "@/api";
import { OrderDetailsResponse, OrdersListResponse } from "./types";
import { toast } from "sonner";

/**
 * Hook for managing driver orders and tasks
 */
export const useDriverOrders = () => {
  const queryClient = useQueryClient();

  // Fetch all tasks assigned to the logged-in driver
  const useDriverTasks = (page = 1, limit = 10) => {
    return useQuery<OrdersListResponse>({
      queryKey: ["driver-orders", page, limit],
      queryFn: async () => {
        const response = await api.get(
          `api/drivers/orders?page=${page}&limit=${limit}`
        );
        return response.data;
      },
      // Keep data fresh but don't refetch on window focus for better UX
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    });
  };

  // Fetch details of a specific order
  const useOrderDetails = (orderId: string) => {
    return useQuery<OrderDetailsResponse>({
      queryKey: ["driver-order", orderId],
      queryFn: async () => {
        const response = await api.get(`/api/drivers/order/${orderId}`);
        return response.data;
      },
      // Only fetch when orderId is available
      enabled: !!orderId,
      // Keep data fresh but don't refetch on window focus for better UX
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Update order status (e.g., accept job, start transit, complete)
  const updateOrderStatus = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const response = await api.post(`/api/drivers/order/update`, {
        orderId,
        status,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      toast(data.messageSv || "Status updated");
      queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["driver-order", variables.orderId],
      });
    },
    onError: handleDriverMutationError,
  });

  const uploadProofOfDelivery = useMutation({
    mutationFn: async ({
      orderId,
      signatureImage,
      deliveryImage,
      deliveryNotes,
    }: {
      orderId: string;
      signatureImage: File;
      deliveryImage: File;
      deliveryNotes: string;
    }) => {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("signatureImage", signatureImage);
      formData.append("deliveryImage", deliveryImage);
      formData.append("deliveryNotes", deliveryNotes);
      const response = await api.post(
        `api/drivers/proof-of-delivery/${orderId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      toast(data.messageSv || "proof updated");
      const orderId = variables.orderId;
      queryClient.invalidateQueries({ queryKey: ["driver-proofOfDelivery"] });
      if (orderId) {
        queryClient.invalidateQueries({
          queryKey: ["driver-order", orderId],
        });
      }
    },
    onError: handleDriverMutationError,
  });

  // Fetch active order (if any)
  const useActiveOrder = () => {
    return useQuery<OrderDetailsResponse>({
      queryKey: ["driver-active-order"],
      queryFn: async () => {
        const response = await api.get("api/drivers/order/");
        return response.data;
      },
      // Only refetch every 30 seconds to avoid excessive API calls
      refetchInterval: 1000 * 30,
    });
  };

  // Update driver location during transit
  const updateDriverLocation = useMutation({
    mutationFn: async ({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }) => {
      const response = await api.post(`api/location/share-location`, {
        latitude,
        longitude,
      });
      return response.data;
    },
  });

  return {
    useDriverTasks,
    useOrderDetails,
    updateOrderStatus,
    useActiveOrder,
    updateDriverLocation,
    uploadProofOfDelivery,
  };
};
