import { useState, useEffect, useCallback } from 'react';
import { ChatUser, ChatFilter, PaginationConfig, ChatHistoryRequest, MessageType } from '../../../types';
import { getChatList, getChatHistory, sendMessage } from '../chatApi';

export const useChats = (token: string) => {
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState<{ [chatId: string]: boolean }>({});
  
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false
  });

  const [filters, setFilters] = useState<ChatFilter>({
    marketplace: 'all',
    chat_status: 'All',
    is_read: 'unread'
  });

  const [filtersApplied, setFiltersApplied] = useState(false);

  const sortChatsByDate = (chats: ChatUser[]): ChatUser[] => {
    return [...chats].sort((a, b) => {
      const aTime = new Date(a.time).getTime();
      const bTime = new Date(b.time).getTime();
      return bTime - aTime;
    });
  };

  const sortMessagesByTime = (messages: MessageType[]): MessageType[] => {
    return [...messages].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
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
      
      const chatsWithEmptyMessages = filteredChats.map(chat => ({
        ...chat,
        messages: []
      }));
      
      const sortedChats = sortChatsByDate(chatsWithEmptyMessages);
      
      setChats(sortedChats);
      setPagination(prev => ({
        ...prev,
        page,
        total: response.total_count,
        hasMore: response.has_more
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки чатов');
    } finally {
      setLoading(false);
    }
  }, [token, filters, filtersApplied, pagination.limit]);

  const loadMoreChats = useCallback(async () => {
    if (!token || !filtersApplied || !pagination.hasMore || loadingMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const nextPage = pagination.page + 1;
      const offset = (nextPage - 1) * pagination.limit;
      
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
      
      const newChatsWithEmptyMessages = filteredChats.map(chat => ({
        ...chat,
        messages: []
      }));
      
      const sortedNewChats = sortChatsByDate(newChatsWithEmptyMessages);
      const allChats = [...chats, ...sortedNewChats];
      
      setChats(allChats);
      setPagination(prev => ({
        ...prev,
        page: nextPage,
        total: prev.total + response.total_count,
        hasMore: response.has_more
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки чатов');
    } finally {
      setLoadingMore(false);
    }
  }, [token, filters, filtersApplied, pagination, chats, loadingMore]);

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
      
      const sortedMessages = sortMessagesByTime(response.messages);
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { 
                ...chat, 
                messages: sortedMessages,
                hasMoreMessages: response.has_more,
                lastLoadedMessageId: sortedMessages.length > 0 
                  ? sortedMessages[sortedMessages.length - 1].id 
                  : undefined
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
        const now = new Date();
        const { fullDateTime } = formatMessageDateTime(now.toISOString());
        
        const newMessage: MessageType = {
          id: response.message_id || Date.now(),
          text,
          time: 'Только что',
          isOwn: true,
          status: 'sent',
          timestamp: now.toISOString(),
          authorId: 'current_user',
          authorRole: 'Seller',
          isRead: false,
          isImage: false,
          context: {
            sku: '',
            orderNumber: ''
          },
          displayTime: fullDateTime
        };

        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === chatId 
              ? { 
                  ...chat, 
                  messages: sortMessagesByTime([...chat.messages, newMessage]),
                  lastMessage: text.length > 50 ? text.substring(0, 50) + '...' : text,
                  time: 'Только что',
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

  const clearChatMessages = useCallback((chatId: string) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [] }
          : chat
      )
    );
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ChatFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setFiltersApplied(false);
    setPagination(prev => ({ ...prev, page: 1, hasMore: false }));
    setChats([]);
  }, []);

  const applyFilters = useCallback(() => {
    setFiltersApplied(true);
    setPagination(prev => ({ ...prev, page: 1, hasMore: false }));
    setChats([]);
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
    loadingMore,
    error,
    pagination,
    filters,
    filtersApplied,
    loadingChats,
    loadChats,
    loadMoreChats,
    loadChatHistory,
    handleChatSelect,
    sendChatMessage,
    clearChatMessages,
    updateFilters,
    updatePagination,
    applyFilters,
    clearError,
    needsHistoryLoad
  };
};

// Вспомогательная функция для форматирования даты и времени
const formatMessageDateTime = (timestamp: string): { fullDateTime: string } => {
  if (!timestamp) return { fullDateTime: '' };

  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

  const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  let dateStr = '';
  if (isToday) {
    dateStr = 'Сегодня';
  } else if (isYesterday) {
    dateStr = 'Вчера';
  } else {
    dateStr = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  return { 
    fullDateTime: `${dateStr}, ${time}`
  };
};