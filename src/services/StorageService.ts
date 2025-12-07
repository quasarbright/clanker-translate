import type { LanguagePrefs } from '../types';

const STORAGE_KEYS = {
  API_KEY: 'clanker_translate_api_key',
  SELECTED_MODEL: 'clanker_translate_selected_model',
  LANGUAGE_PREFS: 'clanker_translate_language_prefs',
} as const;

export class StorageService {
  /**
   * Get the stored API key
   * @returns The API key or null if not found
   */
  static getApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  }

  /**
   * Store the API key
   * @param key The API key to store
   */
  static setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  }

  /**
   * Clear the stored API key
   */
  static clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }

  /**
   * Get the selected model
   * @returns The model ID or null if not found
   */
  static getSelectedModel(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
  }

  /**
   * Store the selected model
   * @param model The model ID to store
   */
  static setSelectedModel(model: string): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, model);
  }

  /**
   * Get the language preferences
   * @returns The language preferences or default values
   */
  static getLanguagePreferences(): LanguagePrefs {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFS);
    if (stored) {
      try {
        return JSON.parse(stored) as LanguagePrefs;
      } catch {
        // If parsing fails, return defaults
        return { fromLanguage: 'en', toLanguage: 'ja' };
      }
    }
    return { fromLanguage: 'en', toLanguage: 'ja' };
  }

  /**
   * Store the language preferences
   * @param prefs The language preferences to store
   */
  static setLanguagePreferences(prefs: LanguagePrefs): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE_PREFS, JSON.stringify(prefs));
  }
}
