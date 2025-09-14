import React, { useState, useEffect, useRef, useCallback } from 'react';
import Eye from './Eye';
import Mouth from './Mouth';
import SleepZ from './SleepZ';
import useVoiceWake from './useVoiceWake';
import { apiService } from '../services/api';

const Face: React.FC = () => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSleeping, setIsSleeping] = useState(true);
  const [audioResponse, setAudioResponse] = useState<string | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Хук для голосового пробуждения и авто-засыпания
  useVoiceWake({
    onWake: () => setIsSleeping(false),
    onSleep: () => {
      setIsSleeping(true); console.log('sleep');
      apiService.clearHistory().catch((e) => console.warn('clear-history error', e));
    },
    isSleeping,
    onRecordingComplete: (audioBlob: Blob) => {
      console.log('Получена аудио запись:', audioBlob.size, 'байт');
      setAudioResponse(null);
      setShowPlayButton(false);
      
      apiService
        .sendChatAudio(audioBlob, { scenario: 'dialog' })
        .then((resp) => {
          const base64 = resp.audio_base64;
          if (!base64) return;
          
          setAudioResponse(base64);
          
          // Пытаемся воспроизвести автоматически
          const audio = new Audio(`data:audio/wav;base64,${base64}`);
          audioRef.current = audio;
          
          audio.play()
            .then(() => {
              console.log('Аудио ответ воспроизведен автоматически');
              setShowPlayButton(false);
            })
            .catch((error) => {
              console.warn('Автовоспроизведение заблокировано браузером:', error.name);
              setShowPlayButton(true);
            });
        })
        .catch((e) => console.error('Ошибка отправки /chat-audio', e));
    },
  });

  // Функция для ручного воспроизведения аудио
  const handlePlayAudio = useCallback(() => {
    if (!audioResponse || !audioRef.current) return;
    
    audioRef.current.play()
      .then(() => {
        console.log('Аудио воспроизведено вручную');
        setShowPlayButton(false);
      })
      .catch((error) => {
        console.error('Ошибка воспроизведения:', error);
      });
  }, [audioResponse]);

  useEffect(() => {
    // Таймер моргания
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 300);
    }, 3000);
    return () => {
      clearInterval(blinkInterval);
    };
  }, []);

  return (
    <div className="face flex flex-col items-center justify-center min-h-screen bg-black">
      {/* Глаза */}
      <div className="eyes flex justify-center gap-16 mb-8">
        <Eye className="left-eye" isBlinking={isBlinking || isSleeping} />
        <Eye className="right-eye" isBlinking={isBlinking || isSleeping} />
      </div>
      {/* Рот */}
      <div className="mouth-container">
        <Mouth className="mouth" />
      </div>
      {/* Z */}
      {isSleeping && (
        <div className="sleep-z-container absolute top-1/4 left-1/2 -translate-x-1/2 w-30 h-50">
          <SleepZ />
        </div>
      )}
      
      {/* Кнопка воспроизведения аудио ответа */}
      {showPlayButton && audioResponse && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handlePlayAudio}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg transition-colors flex items-center gap-2"
            aria-label="Воспроизвести аудио ответ"
          >
            <span className="text-xl">🔊</span>
            <span>Воспроизвести ответ</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Face;
