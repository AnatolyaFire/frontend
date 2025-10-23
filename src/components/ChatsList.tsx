import React from 'react';
import ChatItem from './ChatItem';
import { ChatUser, ChatFilter, PaginationConfig } from '../../types';

interface ChatsListProps {
  chats: ChatUser[];
  selectedChatId: string | null;
  onChatSelect: (chat: ChatUser) => void;
  loading: boolean;
  pagination: PaginationConfig;
  filters: ChatFilter;
  onLoadMore: () => void;
  onFilterChange: (filters: ChatFilter) => void;
  onApplyFilters: () => void;
}

const ChatsList: React.FC<ChatsListProps> = ({
  chats,
  selectedChatId,
  onChatSelect,
  loading,
  pagination,
  filters,
  onLoadMore,
  onFilterChange,
  onApplyFilters
}) => {
  const handleFilterChange = (key: keyof ChatFilter, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    onApplyFilters();
  };

  return (
    <div className="chats-sidebar">
      {/* Форма фильтрации */}
      <div className="filters-controls">
        <div className="filter-group">
          <label>Маркетплейс:</label>
          <select 
            value={filters.marketplace || 'all'}
            onChange={(e) => handleFilterChange('marketplace', e.target.value)}
          >
            <option value="all">Все</option>
            <option value="OZON">Ozon</option>
            <option value="WB">Wildberries</option>
            <option value="YM">Yandex Market</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Статус чата:</label>
          <select 
            value={filters.chat_status}
            onChange={(e) => handleFilterChange('chat_status', e.target.value)}
          >
            <option value="All">Все</option>
            <option value="Opened">Открытые</option>
            <option value="Closed">Закрытые</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Сообщения:</label>
          <select 
            value={filters.is_read}
            onChange={(e) => handleFilterChange('is_read', e.target.value)}
          >
            <option value="all">Все</option>
            <option value="unread">Непрочитанные</option>
            <option value="read">Прочитанные</option>
          </select>
        </div>

        <button 
          className="apply-filters-btn"
          onClick={handleApplyFilters}
          disabled={loading}
        >
          {loading ? 'Загрузка...' : 'Показать чаты'}
        </button>
      </div>

      {/* Информация о пагинации */}
      {chats.length > 0 && (
        <div className="pagination-info">
          Показано: {chats.length} из {pagination.total}
        </div>
      )}

      {/* Список чатов */}
      <div className="chats-list">
        {chats.length === 0 && !loading ? (
          <div className="no-chats-message">
            {filters.is_read === 'unread' ? 'Нет непрочитанных чатов' : 'Чаты не найдены'}
          </div>
        ) : (
          <>
            {chats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onClick={() => onChatSelect(chat)}
              />
            ))}

            {/* Кнопка загрузки еще */}
            {pagination.page * pagination.limit < pagination.total && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn"
                  onClick={onLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Загрузка...' : 'Загрузить еще'}
                </button>
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="loading-indicator">
            Загрузка чатов...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsList;