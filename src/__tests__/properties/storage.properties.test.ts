import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { StorageService } from '../../services/StorageService';
import type { LanguagePrefs } from '../../types';

describe('Storage Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Property 1: API Key Persistence Round Trip', () => {
    /**
     * Feature: ai-translator, Property 1: API Key Persistence Round Trip
     * Validates: Requirements 6.2, 6.3
     */
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (apiKey) => {
          StorageService.setApiKey(apiKey);
          const retrieved = StorageService.getApiKey();
          expect(retrieved).toBe(apiKey);
          
          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Model Selection Persistence', () => {
    /**
     * Feature: ai-translator, Property 2: Model Selection Persistence
     * Validates: Requirements 5.4
     */
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (modelId) => {
          StorageService.setSelectedModel(modelId);
          const retrieved = StorageService.getSelectedModel();
          expect(retrieved).toBe(modelId);
          
          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Settings Persistence Completeness', () => {
    /**
     * Feature: ai-translator, Property 8: Settings Persistence Completeness
     * Validates: Requirements 13.4
     */
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('auto', 'en', 'ja', 'es', 'fr', 'de', 'zh', 'ko', 'ar', 'ru', 'pt'),
        fc.constantFrom('en', 'ja', 'es', 'fr', 'de', 'zh', 'ko', 'ar', 'ru', 'pt'),
        (apiKey, modelId, fromLanguage, toLanguage) => {
          const languagePrefs: LanguagePrefs = { fromLanguage, toLanguage };
          
          // Store all settings
          StorageService.setApiKey(apiKey);
          StorageService.setSelectedModel(modelId);
          StorageService.setLanguagePreferences(languagePrefs);
          
          // Retrieve all settings
          const retrievedApiKey = StorageService.getApiKey();
          const retrievedModel = StorageService.getSelectedModel();
          const retrievedPrefs = StorageService.getLanguagePreferences();
          
          // Verify all fields are preserved
          expect(retrievedApiKey).toBe(apiKey);
          expect(retrievedModel).toBe(modelId);
          expect(retrievedPrefs).toEqual(languagePrefs);
          
          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });
});
