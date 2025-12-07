import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../StorageService';
import type { LanguagePrefs } from '../../types';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('API Key Management', () => {
    it('should store and retrieve API key', () => {
      const key = 'test-api-key-123';
      StorageService.setApiKey(key);
      expect(StorageService.getApiKey()).toBe(key);
    });

    it('should return null when no API key is stored', () => {
      expect(StorageService.getApiKey()).toBeNull();
    });

    it('should clear API key', () => {
      StorageService.setApiKey('test-key');
      StorageService.clearApiKey();
      expect(StorageService.getApiKey()).toBeNull();
    });

    it('should handle empty string API key', () => {
      StorageService.setApiKey('');
      expect(StorageService.getApiKey()).toBe('');
    });
  });

  describe('Model Selection', () => {
    it('should store and retrieve selected model', () => {
      const model = 'openai/gpt-4';
      StorageService.setSelectedModel(model);
      expect(StorageService.getSelectedModel()).toBe(model);
    });

    it('should return null when no model is stored', () => {
      expect(StorageService.getSelectedModel()).toBeNull();
    });

    it('should handle empty string model', () => {
      StorageService.setSelectedModel('');
      expect(StorageService.getSelectedModel()).toBe('');
    });
  });

  describe('Language Preferences', () => {
    it('should store and retrieve language preferences', () => {
      const prefs: LanguagePrefs = {
        fromLanguage: 'es',
        toLanguage: 'fr',
      };
      StorageService.setLanguagePreferences(prefs);
      expect(StorageService.getLanguagePreferences()).toEqual(prefs);
    });

    it('should return default preferences when none are stored', () => {
      const defaults = StorageService.getLanguagePreferences();
      expect(defaults).toEqual({
        fromLanguage: 'en',
        toLanguage: 'ja',
      });
    });

    it('should return defaults when stored data is invalid JSON', () => {
      localStorage.setItem('clanker_translate_language_prefs', 'invalid-json');
      const prefs = StorageService.getLanguagePreferences();
      expect(prefs).toEqual({
        fromLanguage: 'en',
        toLanguage: 'ja',
      });
    });

    it('should handle various language combinations', () => {
      const testCases: LanguagePrefs[] = [
        { fromLanguage: 'auto', toLanguage: 'en' },
        { fromLanguage: 'zh', toLanguage: 'ko' },
        { fromLanguage: 'ar', toLanguage: 'ru' },
      ];

      testCases.forEach((prefs) => {
        StorageService.setLanguagePreferences(prefs);
        expect(StorageService.getLanguagePreferences()).toEqual(prefs);
      });
    });
  });
});
