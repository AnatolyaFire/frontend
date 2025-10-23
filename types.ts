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
}

export interface ChatFilter {
  marketplace: string;
  chat_status: string;
  is_read: string;
}