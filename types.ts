export interface MessageType {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  authorId: string;
  authorRole: 'Customer' | 'Seller' | 'Support' | 'System' | 'NotificationUser';
  isRead: boolean;
  isImage: boolean;
  context?: {
    sku: string;
    orderNumber: string;
  };
  rawData?: any;
  displayTime?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  clientId: number;
  marketplace: string;
  chatStatus: string;
  chatType: string;
  messages: MessageType[];
  hasMoreMessages?: boolean;
  lastLoadedMessageId?: number;
}

export interface ChatHistoryRequest {
  client_id: number;
  chat_id: string;
  direction: 'Backward' | 'Forward';
  from_message_id?: number;
  limit: number;
  max_messages?: number;
}

export interface SendMsgRequest {
  client_id: number;
  chat_id: string;
  text: string;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ChatFilter {
  marketplace: string;
  client_id: string; // Меняем chat_status на client_id
  is_read: string;
}

// Добавляем интерфейсы для API
export interface ChatApiItem {
  chat_id: string;
  text: string;
  created_at: string;
  unread_count: number;
  client_id: number;
  marketplace: string;
  chat_status: string;
  chat_type: string;
}

export interface MessageApiItem {
  message_id: number;
  text: string;
  created_at: string;
  author_role: string;
  author_id: string;
  is_read: boolean;
  is_image: boolean;
  context?: {
    sku: string;
    order_number: string;
  };
  raw_data?: any;
}

export interface ChatListResponse {
  messages: ChatApiItem[];
  total_unread_messages: number;
}

export interface ChatHistoryResponse {
  messages: MessageApiItem[];
  total_messages: number;
}