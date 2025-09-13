// Типы для API запросов и ответов

export interface ChatIn {
  message_tat: string;
  system_prompt_ru?: string;
}

export interface ChatOut {
  input_tat: string;
  translated_to_ru: string;
  model_answer_ru: string;
  translated_back_to_tat: string;
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
