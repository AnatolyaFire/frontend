import React from 'react';
import { ChatUser } from '../../types';

interface ChatItemProps {
  chat: ChatUser;
  isSelected: boolean;
  onClick: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, isSelected, onClick }) => {
  const getChatStatusClass = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'OPENED': 'chat-status-opened',
      'CLOSED': 'chat-status-closed',
      'PROCESSING': 'chat-status-processing'
    };
    return statusMap[status] || 'chat-status-opened';
  };

  // Создаем понятное имя для чата
  const getChatName = (chat: ChatUser): string => {
    return `Чат ${chat.marketplace}`;
  };

  return (
    <div
      className={`chat-item ${isSelected ? 'chat-item-active' : ''} ${chat.unreadCount > 0 ? 'chat-item-unread' : ''}`}
      onClick={onClick}
    >
      <div className="chat-avatar">
        <div className="avatar-placeholder">
          {chat.marketplace.charAt(0).toUpperCase()}
        </div>
        {/* УБРАЛИ online-indicator */}
      </div>
      
      <div className="chat-info">
        <div className="chat-header">
          <div className="chat-name">{getChatName(chat)}</div>
          <div className="chat-time">{chat.time}</div>
        </div>
        
        <div className="chat-preview">
          <div className="last-message">{chat.lastMessage}</div>
          {chat.unreadCount > 0 && (
            <div className="unread-badge">{chat.unreadCount}</div>
          )}
        </div>
        
        <div className="chat-meta">
          <span className={`chat-status-badge ${getChatStatusClass(chat.chatStatus)}`}>
            {chat.chatStatus.toLowerCase()}
          </span>
          <span className="chat-marketplace">{chat.marketplace}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;