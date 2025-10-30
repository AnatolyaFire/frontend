import React from 'react';
import { MessageType } from '../../types';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const getStatusIcon = (status: MessageType['status']): string => {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  const getAuthorName = (role: string, id: string): string => {
    const names: { [key: string]: string } = {
      'Seller': 'Вы',
      'Customer': 'Покупатель',
      'Support': 'Поддержка',
      'System': 'Система',
      'NotificationUser': 'Уведомление'
    };
    return names[role] || role;
  };

  const formatMessageDateTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      }) + ' ' + date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className={`message ${message.isOwn ? 'message-own' : 'message-their'}`}>
      <div className="message-content">
        {!message.isOwn && (
          <div className="message-author">
            {getAuthorName(message.authorRole, message.authorId)}
          </div>
        )}
        <div className="message-text">{message.text}</div>
        <div className="message-time">
          {formatMessageDateTime(message.timestamp)}
          {message.isOwn && (
            <span className="message-status">
              {getStatusIcon(message.status)}
            </span>
          )}
          {!message.isRead && message.isOwn && (
            <span className="message-unread-indicator">●</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;