import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { ChatUser } from '../../types';

interface ChatHeaderProps {
  chat: ChatUser;
  isLoading: boolean;
  onMenuToggle: () => void;
  isMobile: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  isLoading,
  onMenuToggle,
  isMobile,
}) => {
  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={1}
      sx={{ flexShrink: 0 }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          {chat.name.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="div">
            {chat.name}
            {isLoading && ' (загрузка...)'}
          </Typography>
          <Typography variant="caption" component="div" color="text.secondary">
            {chat.marketplace} • {chat.chatStatus}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};