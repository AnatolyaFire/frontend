import React, { useState } from 'react';
import {
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useChats } from '../components/hooks/useChat';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';

const ChatPage: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const token = localStorage.getItem('access_token') || '';

  const {
    chats,
    selectedChat, // Получаем selectedChat из хука
    loading,
    filters,
    filtersApplied,
    loadingChats,
    handleChatSelect, // Теперь эта функция сама управляет selectedChat
    sendChatMessage,
    updateFilters,
    applyFilters,
  } = useChats(token);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleChatClick = async (chat: any) => {
    // Просто вызываем handleChatSelect из хука
    await handleChatSelect(chat);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedChat) return;
    await sendChatMessage(selectedChat.id, selectedChat.clientId, text);
  };

  const handleApplyFilters = () => {
    applyFilters();
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        loading={loading}
        loadingChats={loadingChats}
        filters={filters}
        onChatClick={handleChatClick}
        onUpdateFilters={updateFilters}
        onApplyFilters={handleApplyFilters}
      />
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Боковая панель с чатами */}
      <Box
        component="nav"
        sx={{ 
          width: { md: 380 }, 
          flexShrink: 0,
          height: '100vh'
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ 
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              width: 380,
              height: '100vh',
              overflow: 'hidden'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              width: 380,
              height: '100vh',
              position: 'fixed',
              overflow: 'hidden'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Основная область с чатом */}
      <Box component="main" sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0
      }}>
        <ChatWindow
          selectedChat={selectedChat}
          loadingChats={loadingChats}
          onSendMessage={handleSendMessage}
          onMenuToggle={handleDrawerToggle}
          isMobile={isMobile}
          filtersApplied={filtersApplied}
          chats={chats}
        />
      </Box>
    </Box>
  );
};

export default ChatPage;