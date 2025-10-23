import React from 'react';
import { Box, Typography } from '@mui/material';
import { ChatUser } from '../../types';
import { ChatHeader } from './ChatHeader';
import { MessagesArea } from '../components/MessagesArea';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  selectedChat: ChatUser | null;
  loadingChats: { [chatId: string]: boolean };
  onSendMessage: (text: string) => void;
  onMenuToggle: () => void;
  isMobile: boolean;
  filtersApplied: boolean;
  chats: ChatUser[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedChat,
  loadingChats,
  onSendMessage,
  onMenuToggle,
  isMobile,
  filtersApplied,
  chats,
}) => {
  if (!selectedChat) {
    return (
      <NoChatSelected 
        filtersApplied={filtersApplied}
        chats={chats}
      />
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <ChatHeader
        chat={selectedChat}
        isLoading={loadingChats[selectedChat.id]}
        onMenuToggle={onMenuToggle}
        isMobile={isMobile}
      />
      
      <MessagesArea
        chat={selectedChat}
        isLoading={loadingChats[selectedChat.id]}
      />
      
      <MessageInput
        onSendMessage={onSendMessage}
        isLoading={loadingChats[selectedChat.id]}
      />
    </Box>
  );
};

const NoChatSelected: React.FC<{ filtersApplied: boolean; chats: ChatUser[] }> = ({
  filtersApplied,
  chats,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      p: 3,
      textAlign: 'center'
    }}
  >
    <Typography variant="h5" component="div" gutterBottom>
      {!filtersApplied ? 'Выберите фильтры' : chats.length === 0 ? 'Чаты не найдены' : 'Выберите чат'}
    </Typography>
    <Typography variant="body1" component="div" color="text.secondary">
      {!filtersApplied 
        ? 'Настройте фильтры слева и нажмите "Показать чаты"' 
        : chats.length === 0 
        ? 'Попробуйте изменить параметры фильтрации' 
        : 'Выберите чат из списка слева чтобы начать общение'}
    </Typography>
  </Box>
);