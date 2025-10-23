import React, { useState, FormEvent, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleSendMessage = (e: FormEvent): void => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as FormEvent);
    }
  };

  return (
    <form className="message-input-container" onSubmit={handleSendMessage}>
      <div className="input-wrapper">
        <div className="text-input-wrapper">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message"
            className="message-input"
            rows={1}
          />
        </div>

        <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;