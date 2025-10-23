import { useState, useEffect, useCallback } from 'react';
import { ChatUser, ChatFilter, PaginationConfig, ChatHistoryRequest, MessageType } from '../../../types';
import { getChatList, getChatHistory, sendMessage } from '../chatApi';

export const useChats = (token: string) => {
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState<{ [chatId: string]: boolean }>({});
  
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    limit: 20,
    total: 0
  });

  const [filters, setFilters] = useState<ChatFilter>({
    marketplace: 'all',
    chat_status: 'All',
    is_read: 'unread'
  });

  const [filtersApplied, setFiltersApplied] = useState(false);

  const sortChatsByDate = (chats: ChatUser[]): ChatUser[] => {
    return [...chats].sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  };

  const loadChats = useCallback(async (page: number = 1) => {
    if (!token || !filtersApplied) return;

    setLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * pagination.limit;
      
      const apiFilters = {
        is_read: filters.is_read === 'unread' ? 'unread' : 'all',
        chat_status: filters.chat_status,
        marketplace: filters.marketplace === 'all' ? '' : filters.marketplace
      };

      const response = await getChatList(
        token, 
        apiFilters.is_read, 
        apiFilters.chat_status, 
        pagination.limit, 
        offset,
        apiFilters.marketplace
      );
      
      let filteredChats = response.chats;
      if (filters.marketplace !== 'all') {
        filteredChats = response.chats.filter(chat => 
          chat.marketplace === filters.marketplace
        );
      }
      
      const sortedChats = sortChatsByDate(filteredChats);
      
      setChats(sortedChats);
      setPagination(prev => ({
        ...prev,
        page,
        total: sortedChats.length
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки чатов');
    } finally {
      setLoading(false);
    }
  }, [token, filters, filtersApplied, pagination.limit]);

  const loadChatHistory = useCallback(async (
    chatId: string, 
    clientId: number
  ) => {
    if (!token) return;

    setLoadingChats(prev => ({ ...prev, [chatId]: true }));
    
    try {
      const request: ChatHistoryRequest = {
        client_id: clientId,
        chat_id: chatId,
        direction: 'Backward',
        limit: 50,
        max_messages: 1000
      };

      const response = await getChatHistory(token, request);
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { 
                ...chat, 
                messages: response.messages,
                hasMoreMessages: response.has_more,
                lastLoadedMessageId: response.messages.length > 0 
                  ? response.messages[response.messages.length - 1].id 
                  : chat.lastLoadedMessageId
              }
            : chat
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки истории');
    } finally {
      setLoadingChats(prev => ({ ...prev, [chatId]: false }));
    }
  }, [token]);

  const needsHistoryLoad = useCallback((chat: ChatUser): boolean => {
    return chat.messages.length === 0 && !loadingChats[chat.id];
  }, [loadingChats]);

  const handleChatSelect = useCallback(async (chat: ChatUser) => {
    if (needsHistoryLoad(chat)) {
      await loadChatHistory(chat.id, chat.clientId);
    }
    return true;
  }, [loadChatHistory, needsHistoryLoad]);

  const sendChatMessage = useCallback(async (
    chatId: string,
    clientId: number,
    text: string
  ) => {
    if (!token) return { success: false, error: 'No token' };

    try {
      const response = await sendMessage(token, {
        client_id: clientId,
        chat_id: chatId,
        text
      });

      if (response.success) {
        const newMessage: MessageType = {
          id: response.message_id || Date.now(),
          text,
          time: 'Только что',
          isOwn: true,
          status: 'sent',
          timestamp: new Date().toISOString(),
          authorId: 'current_user',
          authorRole: 'Seller',
          isRead: false,
          isImage: false,
          context: {
            sku: '',
            orderNumber: ''
          }
        };

        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === chatId 
              ? { 
                  ...chat, 
                  messages: [...chat.messages, newMessage],
                  lastMessage: text,
                  time: newMessage.time,
                  unreadCount: 0
                }
              : chat
          )
        );

        return { success: true };
      }
      return { success: false, error: 'Failed to send message' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка отправки сообщения';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [token]);

  const updateFilters = useCallback((newFilters: Partial<ChatFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setFiltersApplied(false);
  }, []);

  const applyFilters = useCallback(() => {
    setFiltersApplied(true);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationConfig>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (filtersApplied) {
      loadChats(pagination.page);
    }
  }, [loadChats, pagination.page, filtersApplied]);

  return {
    chats,
    loading,
    error,
    pagination,
    filters,
    filtersApplied,
    loadingChats,
    loadChats,
    loadChatHistory,
    handleChatSelect,
    sendChatMessage,
    updateFilters,
    updatePagination,
    applyFilters,
    clearError,
    needsHistoryLoad
  };
};