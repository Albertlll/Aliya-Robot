import React, { useState, useCallback } from 'react';
import mouthSvg from '../assets/mouth_1.svg';
import { useChatApi } from '../hooks/useChatApi';
import type { ChatOut } from '../types/api';

interface MouthProps {
  className?: string;
  transcribedText?: string; // Транскрибированный текст для отправки
  onResponse?: (response: ChatOut) => void; // Колбэк для получения ответа
}

const Mouth: React.FC<MouthProps> = ({ 
  className, 
  transcribedText = '', 
  onResponse 
}) => {
  const { isLoading, error, data, sendMessage, clearError } = useChatApi();
  const [lastSentText, setLastSentText] = useState<string>('');

  // Функция для отправки сообщения
  const handleSendMessage = useCallback(async () => {
    if (!transcribedText.trim()) {
      console.warn('Нет текста для отправки');
      return;
    }

    try {
      clearError();
      const response = await sendMessage(transcribedText, '');
      setLastSentText(transcribedText);
      
      // Вызываем колбэк с ответом
      if (onResponse) {
        onResponse(response);
      }
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err);
    }
  }, [transcribedText, clearError, sendMessage, onResponse]);

  // Автоматически отправляем сообщение при изменении transcribedText
  React.useEffect(() => {
    if (transcribedText && transcribedText !== lastSentText) {
      handleSendMessage();
    }
  }, [transcribedText, lastSentText, handleSendMessage]);

  return (
    <div className={`relative ${className || ''}`}>
      <img 
        src={mouthSvg} 
        alt="Mouth" 
        className="w-24 h-9"
      />
      
      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
      )}
      
      {/* Индикатор ошибки */}
      {error && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {error}
        </div>
      )}
      
      {/* Индикатор успешного ответа */}
      {data && !isLoading && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          ✓ Ответ получен
        </div>
      )}
    </div>
  );
};

export default Mouth;
