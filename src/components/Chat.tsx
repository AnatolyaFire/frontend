import React, { useRef, useEffect } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import { MessageType } from '../../types';

interface ChatProps {
  messages: MessageType[];
  onSendMessage: (message: string) => void;
  chatUser: {
    name: string;
  };
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, chatUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Автоскролл к последнему сообщению при загрузке новых
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-area">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="user-avatar">
            <div className="avatar-placeholder">
              {chatUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="user-info">
            <div className="user-name">{chatUser.name}</div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default Chat;