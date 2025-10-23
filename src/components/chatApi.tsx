import { 
  ChatUser, 
  MessageType, 
  ChatHistoryRequest, 
  SendMsgRequest,
  ChatListResponse,
  ChatApiItem,
  ChatHistoryResponse,
  MessageApiItem
} from '../../types';

const API_BASE_URL = 'http://45.144.178.5/api';

// Получение списка чатов
export const getChatList = async (
  token: string,
  is_read: string = 'unread',
  chat_status: string = 'All',
  limit: number = 10,
  offset: number = 0,
  marketplace: string = ''
): Promise<{ chats: ChatUser[]; total_count: number; total_unread: number; has_more: boolean }> => {
  
  let url = `${API_BASE_URL}/chats/chat-list?is_read=${is_read}&chat_status=${chat_status}&limit=${limit}&offset=${offset}`;
  
  if (marketplace) {
    url += `&marketplace=${marketplace}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }, 
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ChatListResponse = await response.json();
  
  const chats: ChatUser[] = data.messages.map((chat: ChatApiItem) => ({
    id: chat.chat_id,
    name: `Чат ${chat.marketplace} - ${chat.chat_id.slice(0, 8)}`,
    lastMessage: chat.text.length > 50 ? chat.text.substring(0, 50) + '...' : chat.text,
    time: formatTime(chat.created_at),
    unreadCount: chat.unread_count,
    clientId: chat.client_id,
    marketplace: chat.marketplace,
    chatStatus: chat.chat_status,
    chatType: chat.chat_type,
    messages: []
  }));

  return {
    chats,
    total_count: data.messages.length,
    total_unread: data.total_unread_messages,
    has_more: data.messages.length === limit
  };
};

// Получение истории сообщений
export const getChatHistory = async (
  token: string,
  request: ChatHistoryRequest
): Promise<{ messages: MessageType[]; has_more: boolean; total_messages: number }> => {
  const response = await fetch(`${API_BASE_URL}/chats/chat-history`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ChatHistoryResponse = await response.json();
  
  // Преобразуем сообщения из API в нашу структуру
  const messages: MessageType[] = data.messages.map((msg: MessageApiItem) => {
    const { fullDateTime } = formatMessageDateTime(msg.created_at);
    
    return {
      id: msg.message_id,
      text: msg.text,
      time: formatTime(msg.created_at),
      isOwn: msg.author_role === 'Seller',
      status: msg.is_read ? 'read' : 'sent',
      timestamp: msg.created_at,
      authorId: msg.author_id,
      authorRole: msg.author_role,
      isRead: msg.is_read,
      isImage: msg.is_image,
      context: msg.context ? {
        sku: msg.context.sku || '',
        orderNumber: msg.context.order_number || ''
      } : undefined,
      rawData: msg.raw_data,
      displayTime: fullDateTime
    };
  });

  // Сортируем сообщения по времени (от старых к новым)
  const sortedMessages = messages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const hasMore = request.direction === 'Backward' 
    ? messages.length > 0 && messages[0].id > (request.from_message_id || 0)
    : false;

  return {
    messages: sortedMessages,
    has_more: hasMore,
    total_messages: data.total_messages
  };
};

// Отправка сообщения
export const sendMessage = async (
  token: string,
  request: SendMsgRequest
): Promise<{ success: boolean; message_id?: number }> => {
  const response = await fetch(`${API_BASE_URL}/chats/send-message`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

// Вспомогательные функции
const formatTime = (timestamp: string): string => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} дн назад`;
  
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit',
    year: 'numeric'
  });
};

// Функция для форматирования даты и времени в сообщениях
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