import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import { 
  ChatInitiationData, 
  ChatMessageData, 
  ConversationsResponse, 
  MessagesResponse 
} from './types';

/**
 * Hook for managing driver chat functionality
 */
export const useDriverChat = () => {
  const queryClient = useQueryClient();

  // Fetch all conversations for the current driver
  const useConversations = () => {
    return useQuery<ConversationsResponse>({
      queryKey: ['driver-conversations'],
      queryFn: async () => {
        const response = await api.get('/api/drivers/conversations');
        return response.data;
      },
      // Keep data fresh with moderate refetch interval
      staleTime: 1000 * 30, // 30 seconds
    });
  };

  // Fetch messages for a specific conversation
  const useMessages = (conversationId: number) => {
    return useQuery<MessagesResponse>({
      queryKey: ['driver-messages', conversationId],
      queryFn: async () => {
        const response = await api.get(`/api/drivers/conversations/${conversationId}/messages`);
        return response.data;
      },
      // Only fetch when conversationId is available
      enabled: !!conversationId,
      // Refetch regularly to get new messages
      refetchInterval: 3000, // 3 seconds
    });
  };

  // Initialize a new conversation with a supplier
  const initiateChat = useMutation({
    mutationFn: async (data: ChatInitiationData) => {
      const response = await api.post('/api/drivers/conversations', data);
      return response.data;
    },
    onSuccess: () => {
      // Refresh conversations list
      queryClient.invalidateQueries({ queryKey: ['driver-conversations'] });
    },
  });

  // Send a message in a conversation
  const sendMessage = useMutation({
    mutationFn: async (data: ChatMessageData) => {
      const response = await api.post('/api/drivers/messages', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Refresh messages in this conversation
      queryClient.invalidateQueries({ 
        queryKey: ['driver-messages', variables.conversation_id] 
      });
    },
  });

  // Mark all messages in a conversation as read
  const markAsRead = useMutation({
    mutationFn: async (conversationId: number) => {
      const response = await api.patch(`/api/drivers/conversations/${conversationId}/read`);
      return response.data;
    },
    onSuccess: (_, conversationId) => {
      // Refresh relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['driver-messages', conversationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['driver-conversations'] 
      });
    },
  });

  return {
    useConversations,
    useMessages,
    initiateChat,
    sendMessage,
    markAsRead,
  };
};
