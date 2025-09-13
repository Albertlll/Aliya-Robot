import axios, { type AxiosResponse } from 'axios';
import type { AxiosInstance } from 'axios';
import type { ChatIn, ChatOut, HealthResponse } from '../types/api';

// Базовый URL для API
const API_BASE_URL = 'http://localhost:8000';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 секунд таймаут
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const message = error.response.data?.detail || error.response.data?.message || 'Ошибка сервера';
      throw new Error(`Ошибка ${error.response.status}: ${message}`);
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      throw new Error('Сервер не отвечает. Проверьте подключение к интернету.');
    } else {
      // Что-то пошло не так при настройке запроса
      throw new Error(`Ошибка запроса: ${error.message}`);
    }
  }
);

// API методы
export const apiService = {
  /**
   * Проверка состояния сервера
   */
  async checkHealth(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await apiClient.get('/health');
    return response.data;
  },

  /**
   * Отправка сообщения в чат
   * @param message_tat - транскрибированный текст на татарском языке
   * @param system_prompt_ru - системный промпт (по умолчанию пустая строка)
   */
  async sendChatMessage(
    message_tat: string, 
    system_prompt_ru: string = ''
  ): Promise<ChatOut> {
    const requestData: ChatIn = {
      message_tat,
      system_prompt_ru,
    };

    const response: AxiosResponse<ChatOut> = await apiClient.post('/chat', requestData);
    return response.data;
  },
};

export default apiService;
