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
  loadingChats: { [chatId: string]: boolean };
  filters: ChatFilter;
  onChatClick: (chat: ChatUser) => void;
  onUpdateFilters: (filters: Partial<ChatFilter>) => void;
  onApplyFilters: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  loading,
  loadingChats,
  filters,
  onChatClick,
  onUpdateFilters,
  onApplyFilters,
}) => {
  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Фиксированная верхняя часть с фильтрами */}
      <Box sx={{ 
        p: 2, 
        flexShrink: 0,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6" gutterBottom>Фильтры чатов</Typography>
        
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

        {/* Заменяем фильтр статуса чата на фильтр по номеру кабинета */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Номер кабинета</InputLabel>
          <Select 
            value={filters.client_id} 
            label="Номер кабинета" 
            onChange={(e) => onUpdateFilters({ client_id: e.target.value })}
          >
            <MenuItem value="all">Все кабинеты</MenuItem>
            <MenuItem value="1">Кабинет 1</MenuItem>
            <MenuItem value="2">Кабинет 2</MenuItem>
            <MenuItem value="3">Кабинет 3</MenuItem>
            <MenuItem value="4">Кабинет 4</MenuItem>
            <MenuItem value="5">Кабинет 5</MenuItem>
            {/* Добавьте больше кабинетов по необходимости */}
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
            Найдено: {chats.length} чатов
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Скроллящаяся часть со списком чатов */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        minHeight: 0
      }}>
        {chats.length === 0 && !loading ? (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
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
                isLoading={loadingChats[chat.id]}
                onChatClick={onChatClick}
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
    </Box>
  );
};