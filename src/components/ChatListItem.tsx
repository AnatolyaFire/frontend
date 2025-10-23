import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import { ChatUser } from '../../types';

interface ChatListItemProps {
  chat: ChatUser;
  isSelected: boolean;
  isLoading: boolean;
  onChatClick: (chat: ChatUser) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  isLoading,
  onChatClick,
}) => {
  return (
    <ListItem
      button
      selected={isSelected}
      onClick={() => onChatClick(chat)}
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
            <Typography variant="subtitle1" component="div" noWrap>
              {chat.name}
              {isLoading && ' (загрузка...)'}
            </Typography>
            <Typography variant="caption" color="text.secondary" component="div">
              {chat.time}
            </Typography>
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary" component="div" noWrap sx={{ flex: 1 }}>
              {chat.lastMessage}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {/* Отображаем номер кабинета */}
              <Chip
                label={`Каб. ${chat.clientId}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.6rem', height: 20 }}
              />
              {/* Статус чата */}
              <Chip
                label={chat.chatStatus}
                size="small"
                color={chat.chatStatus === 'OPENED' ? 'success' : 'default'}
                sx={{ fontSize: '0.6rem', height: 20 }}
              />
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
};