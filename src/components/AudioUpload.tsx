import React, { useState, useRef, useCallback } from 'react';
import { useAudioApi } from '../hooks/useAudioApi';
import type { AudioOut } from '../types/api';
import './AudioUpload.scss';

interface AudioUploadProps {
  onAudioProcessed?: (result: AudioOut) => void;
  className?: string;
}

/**
 * Компонент для загрузки и отправки аудио файлов
 * Поддерживает только WAV файлы
 */
const AudioUpload: React.FC<AudioUploadProps> = ({ 
  onAudioProcessed, 
  className = '' 
}) => {
  const { isLoading, error, data, sendAudioFile, clearError } = useAudioApi();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Обработка выбора файла
   */
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Проверяем тип файла
    if (!file.type.includes('wav') && !file.name.toLowerCase().endsWith('.wav')) {
      alert('Пожалуйста, выберите WAV файл');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    clearError();
  }, [clearError]);

  /**
   * Обработка отправки файла
   */
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      alert('Пожалуйста, выберите аудио файл');
      return;
    }

    try {
      await sendAudioFile(selectedFile, systemPrompt);
    } catch (error) {
      console.error('Ошибка при отправке аудио:', error);
    }
  }, [selectedFile, systemPrompt, sendAudioFile]);

  /**
   * Обработка успешной обработки аудио
   */
  React.useEffect(() => {
    if (data && onAudioProcessed) {
      onAudioProcessed(data);
    }
  }, [data, onAudioProcessed]);

  /**
   * Очистка формы
   */
  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setSystemPrompt('');
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearError]);

  /**
   * Обработка клика по области загрузки
   */
  const handleDropAreaClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Обработка перетаскивания файлов
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.includes('wav') || file.name.toLowerCase().endsWith('.wav')) {
        setSelectedFile(file);
        clearError();
      } else {
        alert('Пожалуйста, перетащите WAV файл');
      }
    }
  }, [clearError]);

  return (
    <div className={`audio-upload ${className}`}>
      <h3 className="audio-upload__title">Загрузка аудио файла</h3>
      
      <form onSubmit={handleSubmit} className="audio-upload__form">
        {/* Область для загрузки файла */}
        <div 
          className="audio-upload__drop-area"
          onClick={handleDropAreaClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          tabIndex={0}
          role="button"
          aria-label="Нажмите или перетащите WAV файл для загрузки"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,audio/wav"
            onChange={handleFileSelect}
            className="audio-upload__file-input"
            aria-label="Выберите WAV файл"
          />
          
          <div className="audio-upload__drop-content">
            <div className="audio-upload__icon">🎵</div>
            <p className="audio-upload__text">
              {selectedFile 
                ? `Выбран файл: ${selectedFile.name}` 
                : 'Нажмите или перетащите WAV файл'
              }
            </p>
            <p className="audio-upload__hint">
              Поддерживаются только WAV файлы
            </p>
          </div>
        </div>

        {/* Системный промпт */}
        <div className="audio-upload__prompt-section">
          <label htmlFor="system-prompt" className="audio-upload__label">
            Системный промпт (необязательно):
          </label>
          <textarea
            id="system-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="audio-upload__prompt-input"
            placeholder="Введите системный промпт на русском языке..."
            rows={3}
          />
        </div>

        {/* Кнопки управления */}
        <div className="audio-upload__controls">
          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className="audio-upload__submit-btn"
          >
            {isLoading ? 'Обработка...' : 'Отправить аудио'}
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="audio-upload__clear-btn"
          >
            Очистить
          </button>
        </div>

        {/* Отображение ошибки */}
        {error && (
          <div className="audio-upload__error" role="alert">
            <strong>Ошибка:</strong> {error}
          </div>
        )}

        {/* Отображение результата */}
        {data && (
          <div className="audio-upload__result">
            <h4>Результат обработки:</h4>
            <div className="audio-upload__result-content">
              <div className="audio-upload__result-item">
                <strong>Транскрипция:</strong> {data.transcription}
              </div>
              <div className="audio-upload__result-item">
                <strong>Перевод на русский:</strong> {data.translated_to_ru}
              </div>
              <div className="audio-upload__result-item">
                <strong>Ответ модели:</strong> {data.model_answer_ru}
              </div>
              <div className="audio-upload__result-item">
                <strong>Перевод обратно на татарский:</strong> {data.translated_back_to_tat}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AudioUpload;
