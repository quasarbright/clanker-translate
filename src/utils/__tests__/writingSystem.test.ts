import { describe, it, expect } from 'vitest';
import { getWritingSystem, needsTranscription } from '../writingSystem';

describe('writingSystem', () => {
  describe('getWritingSystem', () => {
    it('should return latin for English', () => {
      expect(getWritingSystem('en')).toBe('latin');
    });

    it('should return latin for Spanish', () => {
      expect(getWritingSystem('es')).toBe('latin');
    });

    it('should return latin for French', () => {
      expect(getWritingSystem('fr')).toBe('latin');
    });

    it('should return latin for German', () => {
      expect(getWritingSystem('de')).toBe('latin');
    });

    it('should return latin for Portuguese', () => {
      expect(getWritingSystem('pt')).toBe('latin');
    });

    it('should return japanese for Japanese', () => {
      expect(getWritingSystem('ja')).toBe('japanese');
    });

    it('should return chinese for Chinese', () => {
      expect(getWritingSystem('zh')).toBe('chinese');
    });

    it('should return korean for Korean', () => {
      expect(getWritingSystem('ko')).toBe('korean');
    });

    it('should return arabic for Arabic', () => {
      expect(getWritingSystem('ar')).toBe('arabic');
    });

    it('should return cyrillic for Russian', () => {
      expect(getWritingSystem('ru')).toBe('cyrillic');
    });

    it('should return unknown for auto', () => {
      expect(getWritingSystem('auto')).toBe('unknown');
    });

    it('should return unknown for unsupported language codes', () => {
      expect(getWritingSystem('xyz')).toBe('unknown');
    });
  });

  describe('needsTranscription', () => {
    it('should return true when translating from English to Japanese', () => {
      expect(needsTranscription('en', 'ja')).toBe(true);
    });

    it('should return true when translating from English to Chinese', () => {
      expect(needsTranscription('en', 'zh')).toBe(true);
    });

    it('should return true when translating from English to Korean', () => {
      expect(needsTranscription('en', 'ko')).toBe(true);
    });

    it('should return true when translating from English to Arabic', () => {
      expect(needsTranscription('en', 'ar')).toBe(true);
    });

    it('should return true when translating from English to Russian', () => {
      expect(needsTranscription('en', 'ru')).toBe(true);
    });

    it('should return true when translating from Japanese to English', () => {
      expect(needsTranscription('ja', 'en')).toBe(true);
    });

    it('should return false when translating from English to Spanish', () => {
      expect(needsTranscription('en', 'es')).toBe(false);
    });

    it('should return false when translating from English to French', () => {
      expect(needsTranscription('en', 'fr')).toBe(false);
    });

    it('should return false when translating from Spanish to French', () => {
      expect(needsTranscription('es', 'fr')).toBe(false);
    });

    it('should return false when source language is auto', () => {
      expect(needsTranscription('auto', 'ja')).toBe(false);
    });

    it('should return false when source language is auto and target is English', () => {
      expect(needsTranscription('auto', 'en')).toBe(false);
    });

    it('should return false for same language', () => {
      expect(needsTranscription('en', 'en')).toBe(false);
    });

    it('should return false when either language is unknown', () => {
      expect(needsTranscription('xyz', 'en')).toBe(false);
      expect(needsTranscription('en', 'xyz')).toBe(false);
    });
  });
});
