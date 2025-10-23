interface Message {
  content: string;
    role: 'system' | 'user' | 'assistant';
  }

export default Message;