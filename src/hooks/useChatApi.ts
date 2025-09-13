import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { ChatOut, ApiState } from '../types/api';

export const useChatApi = () => {
  const [apiState, setApiState] = useState<ApiState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const sendMessage = useCallback(async (message_tat: string, system_prompt_ru: string = '') => {
    setApiState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiService.sendChatMessage(message_tat, system_prompt_ru);
      setApiState({
        isLoading: false,
        error: null,
        data: response,
      });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setApiState({
        isLoading: false,
        error: errorMessage,
        data: null,
      });
      throw error;
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const response = await apiService.checkHealth();
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(errorMessage);
    }
  }, []);

  const clearError = useCallback(() => {
    setApiState(prev => ({ ...prev, error: null }));
  }, []);

  const resetState = useCallback(() => {
    setApiState({
      isLoading: false,
      error: null,
      data: null,
    });
  }, []);

  return {
    ...apiState,
    sendMessage,
    checkHealth,
    clearError,
    resetState,
  };
};
