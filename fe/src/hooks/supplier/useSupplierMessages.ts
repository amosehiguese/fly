import { useQuery } from "@tanstack/react-query";
import {
  getSupplierDisputeConversations,
  getSupplierDisputeMessages,
} from "@/api/supplier-disputes";
import { fetchConversations, fetchMessagesById } from "@/api/suppliers";

export const useSupplierDisputeMessages = (disputeId: string) => {
  return useQuery({
    queryKey: ["supplier-dispute-messages", disputeId],
    queryFn: () => getSupplierDisputeMessages(disputeId),
    enabled: !!disputeId,
    refetchInterval: 10000, // Poll every 5 seconds
  });
};

export const useSupplierDisputeConversations = () => {
  return useQuery({
    queryKey: ["supplier-dispute-conversations"],
    queryFn: () => getSupplierDisputeConversations(),
  });
};

export const useSupplierMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ["supplier-messages", conversationId],
    queryFn: () => fetchMessagesById(conversationId),
  });
};

export const useSupplierConversations = () => {
  return useQuery({
    queryKey: ["supplier-conversations"],
    queryFn: () => fetchConversations(),
  });
};
