import React, { useState, useEffect, useRef } from 'react';
import Eye from './Eye';
import Mouth from './Mouth';
import SleepZ from './SleepZ';
import useVoiceWake from './useVoiceWake';
import { apiService } from '../services/api';

const Face: React.FC = () => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSleeping, setIsSleeping] = useState(true);

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
      apiService
        .sendChatAudio(audioBlob, { scenario: 'dialog' })
        .then((resp) => {
          const base64 = resp.audio_base64;
          if (!base64) return;
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
          }
          const audio = new Audio(`data:audio/wav;base64,${base64}`);
          audioRef.current = audio;
          audio.play().catch((e) => console.warn('Не удалось воспроизвести ответ', e));
        })
        .catch((e) => console.error('Ошибка отправки /chat-audio', e));
    },
  });

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
    </div>
  );
};

export default Face;
