import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDashboard,
  createOngoingOrder,
  updateOrderStatus,
  sendBid,
} from "../api/suppliers";
import {
  FetchDashboardResponse,
  OngoingOrderRequest,
  OngoingOrderResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  SendBidRequest,
  SendBidResponse,
} from "../api/interfaces/suppliers";

// Hook to fetch dashboard data
export const useFetchDashboard = (status?: string) => {
  return useQuery<FetchDashboardResponse, Error>(
    ["dashboard", status],
    () => fetchDashboard(status),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

// Hook to create an ongoing order
export const useCreateOngoingOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<OngoingOrderResponse, Error, OngoingOrderRequest>(
    (req) => createOngoingOrder(req),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("dashboard");
      },
    }
  );
};

// Hook to update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateOrderStatusResponse,
    Error,
    UpdateOrderStatusRequest
  >((req) => updateOrderStatus(req), {
    onSuccess: () => {
      queryClient.invalidateQueries("dashboard");
    },
  });
};

// Hook to send a bid
export const useSendBid = () => {
  const queryClient = useQueryClient();
  return useMutation<SendBidResponse, Error, SendBidRequest>(
    (req) => sendBid(req),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("dashboard");
      },
    }
  );
};
