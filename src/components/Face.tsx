import React, { useState, useEffect } from 'react';
import Eye from './Eye';
import Mouth from './Mouth';
import SleepZ from './SleepZ';
import useVoiceWake from './useVoiceWake';

const Face: React.FC = () => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSleeping, setIsSleeping] = useState(true);

  // Хук для голосового пробуждения и авто-засыпания
  useVoiceWake({
    onWake: () => setIsSleeping(false),
    onSleep: () => {setIsSleeping(true); console.log('sleep');},
    isSleeping,
    onRecordingComplete: (audioBlob: Blob) => {
      console.log('Получена аудио запись:', audioBlob.size, 'байт');
      // Здесь можно сохранить файл или отправить на сервер
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
