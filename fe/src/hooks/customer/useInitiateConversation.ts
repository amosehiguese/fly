import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import api from "@/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface InitiateConversationResponse {
  message: string;
  chat_id: number;
}

export const useInitiateConversation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (supplierId: number) => {
      const response = await api.post<InitiateConversationResponse>(
        "api/conversation/initiate-chat",
        {
          supplier_id: supplierId,
          reason: "Hey, I have a question about your service",
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Chat initiated successfully");
      router.push(`/customer/chats/${data.chat_id}`);
    },
    onError: (
      error: AxiosError<{
        message?: string;
        error?: string;
        conversation_id?: number;
        order_id?: string;
      }>
    ) => {
      // console.log("error", error.response);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to initiate chat"
      );
      router.push(`/customer/chats/${error.response?.data?.conversation_id}`);
    },
  });
};
