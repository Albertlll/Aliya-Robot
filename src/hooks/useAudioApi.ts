import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { AudioOut, AudioApiState } from '../types/api';

/**
 * Хук для работы с аудио API
 * Предоставляет функционал для отправки аудио файлов и управления состоянием
 */
export const useAudioApi = () => {
  const [state, setState] = useState<AudioApiState>({
    isLoading: false,
    error: null,
    data: null,
  });

  /**
   * Отправка аудио файла на сервер
   * @param audioFile - WAV файл для обработки
   * @param systemPromptRu - системный промпт на русском языке
   */
  const sendAudioFile = useCallback(async (
    audioFile: File,
    systemPromptRu: string = ''
  ): Promise<void> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const result: AudioOut = await apiService.sendAudioFile(audioFile, systemPromptRu);
      
      setState({
        isLoading: false,
        error: null,
        data: result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при отправке аудио';
      
      setState({
        isLoading: false,
        error: errorMessage,
        data: null,
      });
    }
  }, []);

  /**
   * Сброс состояния
   */
  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
  }, []);

  /**
   * Очистка ошибки
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    // Состояние
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
    
    // Методы
    sendAudioFile,
    resetState,
    clearError,
  };
};

export default useAudioApi;
