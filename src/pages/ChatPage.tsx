import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useChats } from '../components/hooks/useChat';
import { ChatUser } from '../../types';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';

const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const token = localStorage.getItem('access_token') || '';

const {
  chats,
  loading,
  loadingMore, // Добавляем
  error,
  pagination, // Теперь используем pagination.hasMore
  filters,
  filtersApplied,
  loadingChats,
  handleChatSelect,
  sendChatMessage,
  updateFilters,
  applyFilters,
  clearError,
  loadMoreChats // Добавляем
} = useChats(token);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleChatClick = async (chat: ChatUser) => {
    setSelectedChat(chat);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        loading={loading}
        loadingMore={loadingMore}
        loadingChats={loadingChats}
        filters={filters}
        pagination={pagination}
        onChatClick={handleChatClick}
        onUpdateFilters={updateFilters}
        onApplyFilters={handleApplyFilters}
        onLoadMore={loadMoreChats} // Передаем функцию
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Боковая панель с чатами */}
      <Box
        component="nav"
        sx={{ width: { md: 380 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 380,
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
              boxSizing: 'border-box', 
              width: 380,
              position: 'relative',
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
        overflow: 'hidden'
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