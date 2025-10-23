import React from 'react';
import {
  Box,
  Typography,
  List,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { ChatUser, ChatFilter } from '../../types';
import { ChatListItem } from './ChatListItem';

interface ChatListProps {
  chats: ChatUser[];
  selectedChat: ChatUser | null;
  loading: boolean;
  loadingMore: boolean; // Добавляем проп
  loadingChats: { [chatId: string]: boolean };
  filters: ChatFilter;
  pagination: {
    hasMore: boolean;
    total: number;
  };
  onChatClick: (chat: ChatUser) => void;
  onUpdateFilters: (filters: Partial<ChatFilter>) => void;
  onApplyFilters: () => void;
  onLoadMore: () => void; // Добавляем проп для загрузки еще
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  loading,
  loadingMore,
  loadingChats,
  filters,
  pagination,
  onChatClick,
  onUpdateFilters,
  onApplyFilters,
  onLoadMore,
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Панель фильтров */}
      <Box sx={{ p: 2, flexShrink: 0 }}>

        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Маркетплейс</InputLabel>
          <Select
            value={filters.marketplace}
            label="Маркетплейс"
            onChange={(e) => onUpdateFilters({ marketplace: e.target.value })}
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
            onChange={(e) => onUpdateFilters({ chat_status: e.target.value })}
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
            onChange={(e) => onUpdateFilters({ is_read: e.target.value })}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="unread">Непрочитанные</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          onClick={onApplyFilters}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <FilterList />}
        >
          {loading ? 'Загрузка...' : 'Показать чаты'}
        </Button>

        {chats.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Загружено: {chats.length} чатов
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Список чатов */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {chats.length === 0 && !loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {filters.is_read === 'unread' ? 'Нет непрочитанных чатов' : 'Чаты не найдены'}
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ p: 0, flex: 1 }}>
              {chats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChat?.id === chat.id}
                  isLoading={loadingChats[chat.id]}
                  onChatClick={onChatClick}
                />
              ))}
            </List>

            {/* Кнопка "Загрузить еще" */}
            {pagination.hasMore && (
              <Box sx={{ p: 2, flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  startIcon={loadingMore ? <CircularProgress size={16} /> : null}
                >
                  {loadingMore ? 'Загрузка...' : 'Загрузить еще'}
                </Button>
              </Box>
            )}
          </>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Box>
  );
};