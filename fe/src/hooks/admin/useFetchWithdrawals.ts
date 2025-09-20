import { useQuery } from "@tanstack/react-query";
import {
  fetchCompletedWithdrawals,
  fetchFundsOverview,
  fetchPendingWithdrawals,
} from "@/api/admin";

export const useFetchCompletedWithdrawals = (page: number = 1) => {
  const {
    data: completedWithdrawals,
    isPending: isCompletedWithdrawalsPending,
    error: completedWithdrawalsError,
  } = useQuery({
    queryKey: ["completedWithdrawals"],
    queryFn: () => fetchCompletedWithdrawals(page, 10),
  });

  return {
    completedWithdrawals,
    isCompletedWithdrawalsPending,
    completedWithdrawalsError,
  };
};

export const useFetchPendingWithdrawals = (page: number = 1) => {
  const {
    data: pendingWithdrawals,
    isLoading: isPendingWithdrawalsPending,
    error: pendingWithdrawalsError,
  } = useQuery({
    queryKey: ["pendingWithdrawals"],
    queryFn: () => fetchPendingWithdrawals(page, 10),
  });

  return {
    pendingWithdrawals,
    isPendingWithdrawalsPending,
    pendingWithdrawalsError,
  };
};

export const useFetchFundsOverview = () => {
  const {
    data: fundsOverview,
    isLoading: isFundsOverviewPending,
    error: fundsOverviewError,
  } = useQuery({
    queryKey: ["fundsOverview"],
    queryFn: fetchFundsOverview,
  });

  return {
    fundsOverview,
    isFundsOverviewPending,
    fundsOverviewError,
  };
};
