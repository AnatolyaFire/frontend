import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
}) => {
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <Box sx={{ 
      flexShrink: 0,
      p: 2, 
      borderTop: 1, 
      borderColor: 'divider',
      backgroundColor: 'background.paper'
    }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={messageText}
          onChange={handleTextareaChange}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..."
          variant="outlined"
          size="small"
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!messageText.trim() || isLoading}
          sx={{ 
            flexShrink: 0,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:disabled': {
              backgroundColor: 'grey.300',
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};