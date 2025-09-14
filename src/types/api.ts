// Типы для API запросов и ответов

export type ScenarioType = 'studying' | 'dialog';

export interface ChatIn {
  message_tat: string;
  scenario?: ScenarioType | null; // default: 'dialog'
  system_prompt_ru?: string | null;
}

export interface ChatOut {
  input_tat?: string | null;
  translated_to_ru: string;
  model_answer_ru: string;
  audio_base64: string; // base64 WAV
  recognized_tat?: string | null;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface HealthResponse {
  status: string;
  message: string;
  version: string;
}

// Типы для состояний API
export interface ApiState {
  isLoading: boolean;
  error: string | null;
  data: ChatOut | null;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}
