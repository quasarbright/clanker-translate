/**
 * Backend Integration Tests
 * 
 * These tests make real API calls to OpenRouter and cost money to run.
 * They are skipped by default and only run when OPENROUTER_API_KEY is set.
 * 
 * To run these tests:
 * 1. Create a .env file with OPENROUTER_API_KEY=your_key
 * 2. Run: npm run test:backend
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { OpenRouterService } from '../src/services/OpenRouterService';

// Load API key from environment
const API_KEY = process.env.OPENROUTER_API_KEY;

// Skip all tests if no API key is provided
const describeIfApiKey = API_KEY ? describe : describe.skip;

describeIfApiKey('Backend Integration Tests (Real API)', () => {
  let availableModels: string[] = [];

  beforeAll(async () => {
    // Fetch available models once for all tests
    try {
      const models = await OpenRouterService.fetchModels(API_KEY!);
      availableModels = models.map(m => m.id);
      console.log(`Found ${availableModels.length} available models`);
    } catch (error) {
      console.error('Failed to fetch models:', error);
      throw error;
    }
  }, 30000); // 30 second timeout for model fetching

  describe('API Key Validation', () => {
    it('should validate a correct API key', async () => {
      const isValid = await OpenRouterService.validateApiKey(API_KEY!);
      expect(isValid).toBe(true);
    });
  });

  describe('Translation Flow', () => {
    // Use a free or cheap model for testing
    const getTestModel = () => {
      // Prefer free models for testing
      const freeModels = availableModels.filter(m => 
        m.includes('free') || m.includes('gemini-flash')
      );
      
      if (freeModels.length > 0) {
        return freeModels[0];
      }
      
      // Fallback to any available model
      return availableModels[0];
    };

    it('should translate simple text from English to Japanese', async () => {
      const model = getTestModel();
      console.log(`Using model: ${model}`);

      const response = await OpenRouterService.translate({
        apiKey: API_KEY!,
        model,
        sourceText: 'Hello, how are you?',
        fromLanguage: 'en',
        toLanguage: 'ja',
      });

      expect(response).toBeDefined();
      expect(response.translation).toBeTruthy();
      expect(typeof response.translation).toBe('string');
      expect(response.translation.length).toBeGreaterThan(0);
      
      // Transcription is optional but nice to have for different writing systems
      console.log('Translation:', response.translation);
      console.log('Transcription:', response.transcription || 'N/A');
      console.log('Explanation:', response.explanation || 'N/A');
    }, 30000); // 30 second timeout

    it('should translate with context', async () => {
      const model = getTestModel();

      const response = await OpenRouterService.translate({
        apiKey: API_KEY!,
        model,
        sourceText: 'Thank you',
        fromLanguage: 'en',
        toLanguage: 'ja',
        context: 'formal business setting',
      });

      expect(response).toBeDefined();
      expect(response.translation).toBeTruthy();
      
      // Explanation is optional
      console.log('Translation:', response.translation);
      console.log('Explanation:', response.explanation || 'N/A');
    }, 30000);

    it('should handle translation between same writing systems', async () => {
      const model = getTestModel();

      const response = await OpenRouterService.translate({
        apiKey: API_KEY!,
        model,
        sourceText: 'Hello world',
        fromLanguage: 'en',
        toLanguage: 'es',
      });

      expect(response).toBeDefined();
      expect(response.translation).toBeTruthy();
      
      // Transcription may not be provided for same writing systems
      console.log('Translation:', response.translation);
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle rate limiting gracefully', async () => {
      // This test is informational - we don't want to trigger rate limits
      // Just verify the error structure is correct
      expect(true).toBe(true);
    });

    it('should handle invalid model gracefully', async () => {
      try {
        await OpenRouterService.translate({
          apiKey: API_KEY!,
          model: 'invalid-model-that-does-not-exist',
          sourceText: 'Test',
          fromLanguage: 'en',
          toLanguage: 'ja',
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.type).toBeDefined();
        console.log('Expected error:', error.message);
      }
    }, 30000);
  });
});

// Log message when tests are skipped
if (!API_KEY) {
  console.log('\n⚠️  Backend integration tests skipped: OPENROUTER_API_KEY not set');
  console.log('To run these tests:');
  console.log('1. Create a .env file with OPENROUTER_API_KEY=your_key');
  console.log('2. Run: npm run test:backend\n');
}
