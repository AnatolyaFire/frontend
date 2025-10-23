// apiService.ts

const API_BASE_URL = 'http://45.144.178.5/api';
const REQUEST_TIMEOUT = 1000000;

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${normalizedEndpoint}`;

    console.log('🔧 API Request:', {
      url,
      method: options.method || 'GET',
      body: options.body
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        redirect: 'follow',
        credentials: 'omit',
        ...options
      };

      if (options.body) {
        fetchOptions.body = options.body;
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        contentType: response.headers.get('content-type')
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Проверяем Content-Type перед парсингом JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('⚠️ Response is not JSON:', text.substring(0, 200));
        throw new Error(`Expected JSON but got: ${contentType}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ API Error:', error);

      if (error instanceof SyntaxError) {
        throw new Error('Сервер вернул не JSON ответ. Возможно, требуется авторизация или произошла ошибка на сервере.');
      }

      throw error;
    }
  }
  async GetMe(token: string): Promise<unknown> {
    return this.request<unknown>('/me', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,

      }
    });
  }
  async GetChatList(token: string): Promise<unknown> {
    return this.request<unknown>('/api/chats/chat-list', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
  }
}

export const apiService = new ApiService();