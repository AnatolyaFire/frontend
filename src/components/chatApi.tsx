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
  limit: number = 20,
  offset: number = 0,
  marketplace: string = ''
): Promise<{ chats: ChatUser[]; total_count: number; total_unread: number }> => {
  
  let url = `${API_BASE_URL}/chats/chat-list?is_read=${is_read}&chat_status=${chat_status}&limit=${limit}&offset=${offset}`;
  
  // Добавляем фильтр по маркетплейсу если указан
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
  name: `Чат ${chat.marketplace} - ${chat.chat_id.slice(0, 8)}`, // Более понятное имя
  lastMessage: chat.text.length > 50 ? chat.text.substring(0, 50) + '...' : chat.text,
  time: formatTime(chat.created_at),
  unreadCount: chat.unread_count,
  isOnline: false, // Всегда false, так как API не предоставляет
  isPinned: false,
  clientId: chat.client_id,
  marketplace: chat.marketplace,
  chatStatus: chat.chat_status,
  chatType: chat.chat_type,
  messages: []
}));

  return {
    chats,
    total_count: data.messages.length,
    total_unread: data.total_unread_messages
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
  const messages: MessageType[] = data.messages.map((msg: MessageApiItem) => ({
    id: msg.message_id,
    text: msg.text,
    time: formatTime(msg.created_at),
    isOwn: msg.author_role === 'Seller', // Предполагаем, что Seller - это наш пользователь
    status: msg.is_read ? 'read' : 'sent',
    timestamp: msg.created_at,
    authorId: msg.author_id,
    authorRole: msg.author_role,
    isRead: msg.is_read,
    isImage: msg.is_image,
    context: {
      sku: msg.context.sku,
      orderNumber: msg.context.order_number
    },
    rawData: msg.raw_data
  }));

  const hasMore = request.direction === 'Backward' 
    ? messages.length > 0 && messages[0].id > (request.from_message_id || 0)
    : false;

  return {
    messages: request.direction === 'Backward' ? messages.reverse() : messages,
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

const formatChatType = (chatType: string): string => {
  const types: { [key: string]: string } = {
    'BUYER_SELLER': 'Покупатель-Продавец',
    'UNSPECIFIED': 'Не указан',
    'SUPPORT': 'Поддержка',
    'SELLER_SUPPORT': 'Поддержка продавца'
  };
  return types[chatType] || chatType;
};

const generateChatName = (chat: ChatApiItem): string => {
  const marketplace = chat.marketplace;
  const chatType = formatChatType(chat.chat_type);
  
  return `${marketplace} - ${chatType}`;
};