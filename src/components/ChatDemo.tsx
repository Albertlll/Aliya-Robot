import React, { useState } from 'react';
import Mouth from './Mouth';
import type { ChatOut } from '../types/api';

const ChatDemo: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [lastResponse, setLastResponse] = useState<ChatOut | null>(null);

  const handleResponse = (response: ChatOut) => {
    setLastResponse(response);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Триггерим отправку через изменение состояния
      setInputText(inputText);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">
        Демо интеграции с API
      </h1>
      
      {/* Компонент Mouth */}
      <div className="flex flex-col items-center space-y-4">
        <Mouth 
          transcribedText={inputText}
          onResponse={handleResponse}
        />
        <p className="text-sm text-gray-600">
          Компонент автоматически отправляет текст на API
        </p>
      </div>

      {/* Поле ввода */}
      <div className="w-full max-w-md">
        <label 
          htmlFor="tat-input" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Введите текст на татарском языке:
        </label>
        <input
          id="tat-input"
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Например: Сәлам! Ничек яшисез?"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Ввод текста на татарском языке"
        />
        <p className="text-xs text-gray-500 mt-1">
          Нажмите Enter для отправки или просто введите текст
        </p>
      </div>

      {/* Результат */}
      {lastResponse && (
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Ответ от API:
          </h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-700">Исходный текст:</h3>
              <p className="text-gray-600">{lastResponse.input_tat}</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-700">Перевод на русский:</h3>
              <p className="text-gray-600">{lastResponse.translated_to_ru}</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-700">Ответ модели:</h3>
              <p className="text-gray-600">{lastResponse.model_answer_ru}</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-gray-700">Перевод обратно на татарский:</h3>
              <p className="text-gray-600">{lastResponse.translated_back_to_tat}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDemo;
