/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

const TRIGGER_WORDS = [
  'салам', 'салям', 'салями', 'сәлем', 'селям', 'селам', 'саламчик', 'салем', 'саламка', 'салямка', 'салямчик', 'саламчик', 'саламалейкум', 'салямалейкум'
];

interface UseVoiceWakeProps {
  onWake: () => void;
  onSleep?: () => void;
  isSleeping: boolean;
  onRecordingComplete?: (audioBlob: Blob) => void;
}

export default function useVoiceWake({ onWake, onSleep, isSleeping, onRecordingComplete }: UseVoiceWakeProps) {
  const recognitionRef = useRef<any>(null);
  const isRecognizingRef = useRef(false);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const INACTIVITY_MS = 15000;
  const RECORDING_DURATION_MS = 10000; // 10 секунд записи после wakeword

  // Сбросить таймер авто-засыпания при отсутствии распознавания в активном режиме
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    if (onSleep && !isSleeping) {
      inactivityTimeoutRef.current = setTimeout(() => {
        onSleep();
      }, INACTIVITY_MS);
    }
  };

  // Начать запись аудио
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        console.log('Запись завершена, размер:', audioBlob.size, 'байт');
        
        // Конвертируем в WAV формат
        convertToWav(audioBlob).then((wavBlob) => {
          if (onRecordingComplete) {
            onRecordingComplete(wavBlob);
          }
        });
        
        // Останавливаем поток
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }
      };
      
      mediaRecorder.start();
      console.log('Начата запись аудио');
      
      // Автоматически останавливаем запись через заданное время
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, RECORDING_DURATION_MS);
      
    } catch (error) {
      console.error('Ошибка при начале записи:', error);
    }
  };

  // Остановить запись аудио
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('Остановка записи аудио');
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  // Конвертация WebM в WAV
  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();
      
      fileReader.onload = async () => {
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Конвертируем в WAV
          const wavBlob = audioBufferToWav(audioBuffer);
          resolve(wavBlob);
        } catch (error) {
          console.error('Ошибка конвертации в WAV:', error);
          resolve(webmBlob); // Возвращаем оригинал в случае ошибки
        }
      };
      
      fileReader.readAsArrayBuffer(webmBlob);
    });
  };

  // Конвертация AudioBuffer в WAV Blob
  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Web Speech API не поддерживается этим браузером');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'ru-RU';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
    };
    recognition.onend = () => {
      isRecognizingRef.current = false;
      // Перезапуск для постоянного прослушивания в любом режиме
      setTimeout(() => {
        if (!isRecognizingRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          try { recognition.start(); } catch (e) { /* empty */ }
        }
      }, 500);
    };
    recognition.onresult = (event: any) => {
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim().toLowerCase();
        console.log('Распознано:', transcript);
        if (isSleeping && isTrigger(transcript)) {
          onWake();
          // Начинаем запись после пробуждения
          startRecording();
        }
      }
      // В активном режиме любой результат сбрасывает таймер бездействия
      if (!isSleeping) {
        resetInactivityTimer();
      }
      // В режиме сна ничего не делаем, таймер сна не нужен
    };
    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error', event);
      if (event.error === 'not-allowed' || event.error === 'denied') {
        recognition.stop();
        return;
      }
      isRecognizingRef.current = false;
      setTimeout(() => {
        if (!isRecognizingRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          try { recognition.start(); } catch (e) { /* empty */ }
        }
      }, 1000);
    };

    // Всегда стараемся запустить распознавание
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    try { recognition.start(); } catch (e) { /* empty */ }
    // В активном режиме включаем таймер бездействия
    if (!isSleeping) {
      resetInactivityTimer();
    } else if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    return () => {
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onstart = null;
      if (isRecognizingRef.current) {
        recognition.stop();
      }
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSleeping]);
}

function isTrigger(text: string) {
  const norm = text.toLowerCase().replace(/[^а-яa-zё]/gi, '');
  return TRIGGER_WORDS.some(word => norm.includes(word));
}
