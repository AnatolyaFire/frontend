import React from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { MessageType } from '../../types';

interface MessageBubbleProps {
  message: MessageType;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isOwn = message.isOwn;
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 2,
        alignSelf: isOwn ? 'flex-end' : 'flex-start',
        maxWidth: '70%',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          bgcolor: isOwn ? 'primary.main' : 'grey.100',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
          borderBottomRightRadius: isOwn ? 4 : 12,
          borderBottomLeftRadius: isOwn ? 12 : 4,
          width: '100%',
        }}
      >
        {!isOwn && (
          <Typography 
            variant="caption" 
            component="div" 
            sx={{ 
              opacity: 0.8, 
              display: 'block', 
              mb: 0.5,
              fontWeight: 'bold'
            }}
          >
            {message.authorRole === 'Customer' ? 'Покупатель' : 
             message.authorRole === 'Seller' ? 'Продавец' : message.authorRole}
          </Typography>
        )}
        <Typography 
          variant="body1" 
          component="div" 
          sx={{ 
            wordBreak: 'break-word',
            lineHeight: 1.4
          }}
        >
          {message.text}
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mt: 1 
        }}>
          <Typography 
            variant="caption" 
            component="div" 
            sx={{ 
              opacity: 0.7,
              fontSize: '0.75rem'
            }}
          >
            {message.displayTime || formatDateTime(message.timestamp)}
          </Typography>
          {isOwn && (
            <Typography 
              variant="caption" 
              component="div" 
              sx={{ 
                opacity: 0.7, 
                ml: 1,
                fontSize: '0.75rem'
              }}
            >
              {message.status === 'sent' ? '✓' : 
               message.status === 'delivered' ? '✓✓' : '✓✓'}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// Функция форматирования даты и времени (fallback)
const formatDateTime = (timestamp: string): string => {
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

  return `${dateStr}, ${time}`;
};