import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Menu as MenuIcon,
  Send as SendIcon,
  FilterList
} from '@mui/icons-material';
import { useChats } from '../components/hooks/useChat';
import { ChatUser, MessageType } from '../../types';

const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const token = localStorage.getItem('access_token') || '';

  const {
    chats,
    loading,
    error,
    pagination,
    filters,
    filtersApplied,
    loadingChats,
    handleChatSelect,
    sendChatMessage,
    updateFilters,
    applyFilters,
    clearError
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

  const handleSendMessage = async () => {
    if (!selectedChat || !messageText.trim()) return;
    await sendChatMessage(selectedChat.id, selectedChat.clientId, messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApplyFilters = () => {
    applyFilters();
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    if (filtersApplied) {
      // Чаты загружаются автоматически через хук
    }
  }, [filtersApplied]);

  const ChatListItem = ({ chat, isSelected }: { chat: ChatUser; isSelected: boolean }) => {
    const isLoading = loadingChats[chat.id];
    
    return (
      <ListItem
        button
        selected={isSelected}
        onClick={() => handleChatClick(chat)}
        disabled={isLoading}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&.Mui-selected': {
            backgroundColor: 'primary.light',
          },
          opacity: isLoading ? 0.7 : 1
        }}
      >
        <ListItemAvatar>
          <Badge
            color="error"
            badgeContent={chat.unreadCount}
            invisible={chat.unreadCount === 0}
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                chat.marketplace.charAt(0)
              )}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" noWrap>
                {chat.name}
                {isLoading && ' (загрузка...)'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {chat.time}
              </Typography>
            </Box>
          }
          secondary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                {chat.lastMessage}
              </Typography>
              <Chip
                label={chat.chatStatus}
                size="small"
                color={chat.chatStatus === 'OPENED' ? 'success' : 'default'}
                sx={{ ml: 1, fontSize: '0.6rem', height: 20 }}
              />
            </Box>
          }
        />
      </ListItem>
    );
  };

  const MessageBubble = ({ message }: { message: MessageType }) => {
    const isOwn = message.isOwn;
    
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          mb: 1
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 2,
            maxWidth: '70%',
            bgcolor: isOwn ? 'primary.main' : 'grey.100',
            color: isOwn ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            borderBottomRightRadius: isOwn ? 4 : 12,
            borderBottomLeftRadius: isOwn ? 12 : 4
          }}
        >
          {!isOwn && (
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
              {message.authorRole === 'Customer' ? 'Покупатель' : message.authorRole}
            </Typography>
          )}
          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
            {message.text}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {new Date(message.timestamp).toLocaleString('ru-RU')}
            </Typography>
            {isOwn && (
              <Typography variant="caption" sx={{ opacity: 0.7, ml: 1 }}>
                {message.status === 'sent' ? '✓' : message.status === 'delivered' ? '✓✓' : '✓✓'}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    );
  };

  const FiltersPanel = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Фильтры чатов
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Маркетплейс</InputLabel>
        <Select
          value={filters.marketplace}
          label="Маркетплейс"
          onChange={(e) => updateFilters({ marketplace: e.target.value })}
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="OZON">Ozon</MenuItem>
          <MenuItem value="WB">Wildberries</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Статус чата</InputLabel>
        <Select
          value={filters.chat_status}
          label="Статус чата"
          onChange={(e) => updateFilters({ chat_status: e.target.value })}
        >
          <MenuItem value="All">Все</MenuItem>
          <MenuItem value="Opened">Открытые</MenuItem>
          <MenuItem value="Closed">Закрытые</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Сообщения</InputLabel>
        <Select
          value={filters.is_read}
          label="Сообщения"
          onChange={(e) => updateFilters({ is_read: e.target.value })}
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="unread">Непрочитанные</MenuItem>
          <MenuItem value="read">Прочитанные</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        fullWidth
        onClick={handleApplyFilters}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <FilterList />}
      >
        {loading ? 'Загрузка...' : 'Показать чаты'}
      </Button>

      {chats.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Показано: {chats.length} из {pagination.total}
        </Typography>
      )}
    </Box>
  );

  const ChatsList = () => (
    <>
      <FiltersPanel />
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {chats.length === 0 && !loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {filters.is_read === 'unread' ? 'Нет непрочитанных чатов' : 'Чаты не найдены'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChat?.id === chat.id}
              />
            ))}
          </List>
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </>
  );

  const ChatArea = () => {
    const isLoading = selectedChat && loadingChats[selectedChat.id];
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              {selectedChat?.name.charAt(0)}
            </Avatar>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {selectedChat?.name}
              {isLoading && ' (загрузка...)'}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2, position: 'relative' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            selectedChat?.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          
          {selectedChat && selectedChat.messages.length === 0 && !isLoading && (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
              <Typography variant="body1">
                Нет сообщений
              </Typography>
              <Typography variant="body2">
                Начните общение первым
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите сообщение..."
              variant="outlined"
              size="small"
              disabled={isLoading}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isLoading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  };

  const NoChatSelected = () => (
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
      <Typography variant="h5" gutterBottom>
        {!filtersApplied ? 'Выберите фильтры' : chats.length === 0 ? 'Чаты не найдены' : 'Выберите чат'}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {!filtersApplied 
          ? 'Настройте фильтры слева и нажмите "Показать чаты"' 
          : chats.length === 0 
          ? 'Попробуйте изменить параметры фильтрации' 
          : 'Выберите чат из списка слева чтобы начать общение'}
      </Typography>
    </Box>
  );

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ChatsList />
    </Box>
  );

  if (error) {
    return (
      <Dialog open={true} maxWidth="sm" fullWidth>
        <DialogTitle>Ошибка загрузки чатов</DialogTitle>
        <DialogContent>
          <Typography>{error}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearError} variant="contained">
            Закрыть
          </Button>
          <Button onClick={() => window.location.reload()} variant="outlined">
            Обновить страницу
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 380 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 380, position: 'relative' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? <ChatArea /> : <NoChatSelected />}
      </Box>
    </Box>
  );
};

export default ChatPage;