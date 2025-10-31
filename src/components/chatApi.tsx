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

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Расширяем типы для WB
interface WBChatApiItem extends ChatApiItem {
  wb_data?: {
    clientID?: number;
    clientName?: string;
    replySign?: string;
    goodCard?: any;
  };
}

interface WBChatHistoryResponse extends ChatHistoryResponse {
  has_next?: boolean;
}

// Получение списка чатов
export const getChatList = async (
  token: string,
  is_read: string = 'unread',
  chat_status: string = 'All',
  limit: number = 10,
  offset: number = 0,
  marketplace: string = ''
): Promise<{ chats: ChatUser[]; total_count: number; total_unread: number}> => {
  
  // Если указан маркетплейс WB, используем WB endpoint
  if (marketplace.toUpperCase() === 'WILDBERRIES' || marketplace.toUpperCase() === 'WB') {
    return getWBChats(token, is_read, chat_status, limit, offset);
  }

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
  };
};

// Получение истории сообщений
export const getChatHistory = async (
  token: string,
  request: ChatHistoryRequest
): Promise<{ messages: MessageType[]; has_more: boolean; total_messages: number }> => {
  
  // Определяем маркетплейс по client_id или другим параметрам
  const marketplace = getMarketplaceFromRequest(request);
  
  // Если это WB, используем WB endpoint
  if (marketplace === 'WILDBERRIES') {
    return getWBChatHistory(token, request.chat_id, request.limit || 50);
  }

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
      id: String(msg.message_id), // Приводим к string
      text: msg.text,
      time: formatTime(msg.created_at),
      isOwn: msg.author_role === 'Seller' || msg.author_role === 'seller',
      status: msg.is_read ? 'read' : 'sent',
      timestamp: msg.created_at,
      authorId: String(msg.author_id),
      authorRole: convertAuthorRole(msg.author_role), // Конвертируем роль
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
    ? messages.length > 0 && Number(messages[0].id) > (request.from_message_id || 0)
    : false;

  return {
    messages: sortedMessages,
    has_more: hasMore,
    total_messages: data.total_messages
  };
};

// Получение списка чатов ТОЛЬКО из Wildberries
export const getWBChats = async (
  token: string,
  is_read: string = 'unread',
  chat_status: string = 'All',
  limit: number = 10,
  offset: number = 0
): Promise<{ chats: ChatUser[]; total_count: number; total_unread: number}> => {
  
  const url = `${API_BASE_URL}/wb/chats?is_read=${is_read}&chat_status=${chat_status}&limit=${limit}&offset=${offset}`;

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
  
  const chats: ChatUser[] = data.messages.map((chat: WBChatApiItem) => ({
    id: chat.chat_id,
    name: `Чат WB - ${chat.wb_data?.clientName || 'Покупатель'}`,
    lastMessage: chat.text.length > 50 ? chat.text.substring(0, 50) + '...' : chat.text,
    time: formatTime(chat.created_at),
    unreadCount: chat.unread_count,
    clientId: chat.client_id,
    marketplace: chat.marketplace,
    chatStatus: chat.chat_status,
    chatType: chat.chat_type,
    messages: [],
    // Дополнительные данные из WB
    wbData: chat.wb_data ? {
      clientID: chat.wb_data.clientID,
      clientName: chat.wb_data.clientName,
      replySign: chat.wb_data.replySign,
      goodCard: chat.wb_data.goodCard
    } : undefined
  }));

  return {
    chats,
    total_count: data.messages.length,
    total_unread: data.total_unread_messages,
  };
};

// Получение истории сообщений ТОЛЬКО из Wildberries
export const getWBChatHistory = async (
  token: string,
  chat_id: string,
  limit: number = 50
): Promise<{ messages: MessageType[]; has_more: boolean; total_messages: number }> => {
  
  const url = `${API_BASE_URL}/wb/chat-history/${chat_id}?limit=${limit}`;

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

  const data: WBChatHistoryResponse = await response.json();
  
  const messages: MessageType[] = data.messages.map((msg: MessageApiItem) => {
    const { fullDateTime } = formatMessageDateTime(msg.created_at);
    
    return {
      id: String(msg.message_id), // Приводим к string
      text: msg.text,
      time: formatTime(msg.created_at),
      isOwn: msg.author_role === 'seller', // Для WB автор может быть 'seller' или 'customer'
      status: msg.is_read ? 'read' : 'sent',
      timestamp: msg.created_at,
      authorId: String(msg.author_id),
      authorRole: convertAuthorRole(msg.author_role), // Конвертируем роль
      isRead: msg.is_read,
      isImage: msg.is_image,
      context: msg.context,
      rawData: msg.raw_data,
      displayTime: fullDateTime
    };
  });

  const sortedMessages = messages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return {
    messages: sortedMessages,
    has_more: data.has_next || false,
    total_messages: data.total_messages
  };
};

// Отправка сообщения
export const sendMessage = async (
  token: string,
  request: SendMsgRequest
): Promise<{ success: boolean; message_id?: number }> => {
  
  // Определяем маркетплейс по client_id
  const marketplace = getMarketplaceFromClientId(request.client_id);
  
  // Если это WB, используем WB endpoint
  if (marketplace === 'WILDBERRIES') {
    return sendWBMessage(token, request.chat_id, request.text, request.client_id);
  }

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

// Отправка сообщения в Wildberries
export const sendWBMessage = async (
  token: string,
  chat_id: string,
  text: string,
  client_id: string = 'wb_client'
): Promise<{ success: boolean; message_id?: number }> => {
  
  const request: SendMsgRequest = {
    chat_id,
    text,
    client_id: client_id // Оставляем как string
  };

  const response = await fetch(`${API_BASE_URL}/wb/send-message`, {
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

// Вспомогательные функции для определения маркетплейса
const getMarketplaceFromRequest = (request: ChatHistoryRequest): string => {
  // Если chat_id содержит двоеточие (формат WB: "1:4019cd7d-...")
  if (request.chat_id && request.chat_id.includes(':')) {
    return 'WILDBERRIES';
  }
  
  // Если client_id указывает на WB
  if (request.client_id && (request.client_id.includes('wb') || request.client_id === 'wb_client')) {
    return 'WILDBERRIES';
  }
  
  return 'OZON';
};

const getMarketplaceFromClientId = (client_id: string): string => {
  if (client_id && (client_id.includes('wb') || client_id === 'wb_client')) {
    return 'WILDBERRIES';
  }
  return 'OZON';
};

// Конвертер ролей авторов
const convertAuthorRole = (role: string): 'Seller' | 'Customer' | 'Support' | 'System' | 'NotificationUser' => {
  const roleLower = role.toLowerCase();
  
  if (roleLower === 'seller' || roleLower === 'admin' || roleLower === 'operator') {
    return 'Seller';
  }
  
  if (roleLower === 'customer' || roleLower === 'client' || roleLower === 'user') {
    return 'Customer';
  }
  
  if (roleLower === 'support') {
    return 'Support';
  }
  
  if (roleLower === 'system') {
    return 'System';
  }
  
  return 'Customer'; // По умолчанию
};

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

// Комбинированный метод для получения всех чатов
export const getAllChats = async (
  token: string,
  is_read: string = 'unread',
  chat_status: string = 'All',
  limit: number = 10
): Promise<{ chats: ChatUser[]; total_count: number; total_unread: number}> => {
  
  try {
    // Параллельно запрашиваем чаты с обоих маркетплейсов
    const [ozonChats, wbChats] = await Promise.all([
      getChatList(token, is_read, chat_status, limit, 0, 'OZON'),
      getWBChats(token, is_read, chat_status, limit, 0)
    ]);

    const allChats = [...ozonChats.chats, ...wbChats.chats];
    
    // Сортируем по времени (новые сверху)
    const sortedChats = allChats.sort((a, b) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    return {
      chats: sortedChats,
      total_count: sortedChats.length,
      total_unread: ozonChats.total_unread + wbChats.total_unread
    };

  } catch (error) {
    console.error('Error fetching all chats:', error);
    return {
      chats: [],
      total_count: 0,
      total_unread: 0
    };
  }
};