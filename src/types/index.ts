export interface Model {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
}

export interface TranslationRequest {
  apiKey: string;
  model: string;
  sourceText: string;
  fromLanguage: string;
  toLanguage: string;
  context?: string;
}

export interface TranslationResponse {
  translation: string;
  explanation?: string;
  transcription?: string;
  detectedLanguage?: string;
}

export interface LanguagePrefs {
  fromLanguage: string;
  toLanguage: string;
}

export interface StoredSettings {
  apiKey: string;
  selectedModel: string;
  languagePrefs: LanguagePrefs;
}

export interface OpenRouterError {
  type: 'auth' | 'rate_limit' | 'network' | 'invalid_response' | 'unknown';
  message: string;
  statusCode?: number;
}
