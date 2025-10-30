// Альтернативный ChatPage.tsx
import React, { useState } from 'react';
import {
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useChats } from '../components/hooks/useChat';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';
import NavBar from '../components/navBar';

const ChatPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'chats' | 'chat'>('chats');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const token = localStorage.getItem('access_token') || '';

  const {
    chats,
    selectedChat,
    loading,
    filters,
    filtersApplied,
    loadingChats,
    handleChatSelect,
    sendChatMessage,
    updateFilters,
    applyFilters,
  } = useChats(token);

  const handleChatClick = async (chat: any) => {
    await handleChatSelect(chat);
    if (isMobile) {
      setCurrentView('chat');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedChat) return;
    await sendChatMessage(selectedChat.id, selectedChat.clientId, text);
  };

  const handleBackToChats = () => {
    setCurrentView('chats');
  };

  const handleApplyFilters = () => {
    applyFilters();
  };

  // В мобильной версии показываем либо список чатов, либо окно чата
  if (isMobile) {
    return (
      <>
        <NavBar />
        <Box sx={{ height: '100vh', overflow: 'hidden' }}>
          {currentView === 'chats' ? (
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              loading={loading}
              loadingChats={loadingChats}
              filters={filters}
              onChatClick={handleChatClick}
              onUpdateFilters={updateFilters}
              onApplyFilters={handleApplyFilters}
              isMobile={true}
            />
          ) : (
            <ChatWindow
              selectedChat={selectedChat}
              loadingChats={loadingChats}
              onSendMessage={handleSendMessage}
              onMenuToggle={handleBackToChats}
              isMobile={true}
              filtersApplied={filtersApplied}
              chats={chats}
            />
          )}
        </Box></>
    );
  }

  // Десктопная версия
  return (

    <> <NavBar />
      <Box sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}>
        {/* Боковая панель с чатами */}
        <Box sx={{
          width: 380,
          flexShrink: 0,
          height: '100vh',
          borderRight: 1,
          borderColor: 'divider'
        }}>
          <ChatList
            chats={chats}
            selectedChat={selectedChat}
            loading={loading}
            loadingChats={loadingChats}
            filters={filters}
            onChatClick={handleChatClick}
            onUpdateFilters={updateFilters}
            onApplyFilters={handleApplyFilters}
            isMobile={false}
          />
        </Box>

        {/* Основная область с чатом */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <ChatWindow
            selectedChat={selectedChat}
            loadingChats={loadingChats}
            onSendMessage={handleSendMessage}
            isMobile={false}
            filtersApplied={filtersApplied}
            chats={chats}
          />
        </Box>
      </Box></>
  );
};

export default ChatPage;