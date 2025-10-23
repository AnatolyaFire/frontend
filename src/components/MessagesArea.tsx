import React, { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { ChatUser } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessagesAreaProps {
  chat: ChatUser;
  isLoading: boolean;
}

export const MessagesArea: React.FC<MessagesAreaProps> = ({
  chat,
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!isLoading && chat.messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [chat.messages, isLoading]);

  return (
    <Box
      ref={containerRef}
      sx={{ 
        flex: 1,
        overflow: 'auto', // ЕДИНСТВЕННЫЙ скролл в правой части
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}
    >
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flex: 1 
        }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Сообщения */}
          {chat.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {/* Якорь для автоматической прокрутки */}
          <div ref={messagesEndRef} />
        </>
      )}
      
      {chat.messages.length === 0 && !isLoading && (
        <Box sx={{ 
          textAlign: 'center', 
          color: 'text.secondary',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Typography variant="body1" component="div">
            Нет сообщений
          </Typography>
          <Typography variant="body2" component="div">
            Начните общение первым
          </Typography>
        </Box>
      )}
    </Box>
  );
};