import { useState, useEffect, useCallback } from 'react';
import { ChatUser, ChatFilter, ChatHistoryRequest, MessageType } from '../../../types';
import { getChatList, getChatHistory, sendMessage } from '../chatApi';

export const useChats = (token: string) => {
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState<{ [chatId: string]: boolean }>({});

  const [filters, setFilters] = useState<ChatFilter>({
    marketplace: 'all',
    client_id: 'all',
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

  const loadChats = useCallback(async () => {
    if (!token || !filtersApplied) return;

    setLoading(true);
    setError(null);

    try {
      const apiFilters = {
        is_read: filters.is_read === 'unread' ? 'unread' : 'all',
        chat_status: 'All',
        marketplace: filters.marketplace === 'all' ? '' : filters.marketplace
      };

      const response = await getChatList(
        token, 
        apiFilters.is_read, 
        apiFilters.chat_status, 
        30,
        0,
        apiFilters.marketplace
      );
      
      let filteredChats = response.chats;
      
      if (filters.marketplace !== 'all') {
        filteredChats = filteredChats.filter(chat => 
          chat.marketplace === filters.marketplace
        );
      }
      
      if (filters.client_id !== 'all') {
        const clientId = parseInt(filters.client_id);
        filteredChats = filteredChats.filter(chat => 
          chat.clientId === clientId
        );
      }
      
      const chatsWithEmptyMessages = filteredChats.map(chat => ({
        ...chat,
        messages: [] // Всегда начинаем с пустого массива сообщений
      }));
      
      const sortedChats = sortChatsByDate(chatsWithEmptyMessages);
      
      setChats(sortedChats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки чатов');
    } finally {
      setLoading(false);
    }
  }, [token, filters, filtersApplied]);

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
      
      // Обновляем чаты с новыми сообщениями
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

      // Обновляем selectedChat с актуальными сообщениями
      setSelectedChat(prevSelected => {
        if (prevSelected && prevSelected.id === chatId) {
          return {
            ...prevSelected,
            messages: sortedMessages,
            hasMoreMessages: response.has_more
          };
        }
        return prevSelected;
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки истории');
    } finally {
      setLoadingChats(prev => ({ ...prev, [chatId]: false }));
    }
  }, [token]);

  const handleChatSelect = useCallback(async (chat: ChatUser) => {
    // Очищаем сообщения предыдущего выбранного чата
    if (selectedChat && selectedChat.id !== chat.id) {
      setSelectedChat(prevSelected => {
        if (prevSelected) {
          return { ...prevSelected, messages: [] };
        }
        return prevSelected;
      });

      // Также очищаем сообщения в основном массиве чатов для предыдущего чата
      setChats(prevChats => 
        prevChats.map(prevChat => 
          prevChat.id === selectedChat.id 
            ? { ...prevChat, messages: [] }
            : prevChat
        )
      );
    }

    // Сначала устанавливаем выбранный чат (с пустыми сообщениями)
    setSelectedChat({ ...chat, messages: [] });
    
    // Загружаем историю для нового чата
    if (!loadingChats[chat.id]) {
      await loadChatHistory(chat.id, chat.clientId);
    }
  }, [selectedChat, loadChatHistory, loadingChats]);

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

        // Обновляем сообщения во всех чатах
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

        // Обновляем selectedChat
        setSelectedChat(prevSelected => {
          if (prevSelected && prevSelected.id === chatId) {
            const updatedMessages = sortMessagesByTime([...prevSelected.messages, newMessage]);
            return {
              ...prevSelected,
              messages: updatedMessages,
              lastMessage: text.length > 50 ? text.substring(0, 50) + '...' : text,
              time: 'Только что',
              unreadCount: 0
            };
          }
          return prevSelected;
        });

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
    
    setSelectedChat(prevSelected => {
      if (prevSelected && prevSelected.id === chatId) {
        return { ...prevSelected, messages: [] };
      }
      return prevSelected;
    });
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ChatFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setFiltersApplied(false);
    setChats([]);
    setSelectedChat(null);
  }, []);

  const applyFilters = useCallback(() => {
    setFiltersApplied(true);
    setChats([]);
    setSelectedChat(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (filtersApplied) {
      loadChats();
    }
  }, [loadChats, filtersApplied]);

  return {
    chats,
    selectedChat,
    loading,
    error,
    filters,
    filtersApplied,
    loadingChats,
    loadChats,
    loadChatHistory,
    handleChatSelect,
    sendChatMessage,
    clearChatMessages,
    updateFilters,
    applyFilters,
    clearError,
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