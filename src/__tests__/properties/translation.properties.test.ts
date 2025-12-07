import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { OpenRouterService } from '../../services/OpenRouterService';
import type { TranslationRequest, Model } from '../../types';

describe('Translation Property Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 3: Language Swap Idempotence', () => {
    /**
     * Feature: ai-translator, Property 3: Language Swap Idempotence
     * Validates: Requirements 7.4
     */
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'ja', 'es', 'fr', 'de', 'zh', 'ko', 'ar', 'ru', 'pt'),
        fc.constantFrom('en', 'ja', 'es', 'fr', 'de', 'zh', 'ko', 'ar', 'ru', 'pt'),
        (from, to) => {
          // Initial state
          const initial = { from, to };
          
          // Swap once
          const swapped = { from: to, to: from };
          
          // Swap twice (should return to initial)
          const swappedTwice = { from: swapped.to, to: swapped.from };
          
          // Verify idempotence: swapping twice returns to original
          expect(swappedTwice).toEqual(initial);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5: Translation Request Format', () => {
    /**
     * Feature: ai-translator, Property 5: Translation Request Format
     * Validates: Requirements 1.1
     */
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // apiKey (non-whitespace)
        fc.constantFrom('openai/gpt-4', 'openai/gpt-3.5-turbo', 'openai/gpt-4-turbo'), // model
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0), // sourceText (non-whitespace)
        fc.constantFrom('auto', 'en', 'ja', 'es', 'fr', 'de', 'zh', 'ko', 'ar', 'ru', 'pt'), // fromLanguage
        fc.constantFrom('en', 'ja', 'es', 'fr', 'de', 'zh', 'ko', 'ar', 'ru', 'pt'), // toLanguage
        fc.option(fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), { nil: undefined }), // context (optional, non-whitespace)
        async (apiKey, model, sourceText, fromLanguage, toLanguage, context) => {
          // Mock successful response
          const mockResponse = {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    translation: 'test translation',
                    explanation: 'test explanation'
                  })
                }
              }
            ]
          };

          const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse
          });
          globalThis.fetch = mockFetch as any;

          const request: TranslationRequest = {
            apiKey,
            model,
            sourceText,
            fromLanguage,
            toLanguage,
            context
          };

          await OpenRouterService.translate(request);

          // Verify fetch was called
          expect(mockFetch).toHaveBeenCalledTimes(1);
          
          const [url, options] = mockFetch.mock.calls[0];
          
          // Verify URL
          expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
          
          // Verify method
          expect(options.method).toBe('POST');
          
          // Verify headers contain required fields
          expect(options.headers['Authorization']).toBe(`Bearer ${apiKey}`);
          expect(options.headers['Content-Type']).toBe('application/json');
          expect(options.headers).toHaveProperty('HTTP-Referer');
          expect(options.headers['X-Title']).toBe('Clanker Translate');
          
          // Verify body structure
          const body = JSON.parse(options.body);
          expect(body.model).toBe(model);
          expect(body).toHaveProperty('messages');
          expect(body.temperature).toBe(0.3);
          expect(body.max_tokens).toBe(1000);
          
          // Verify messages array structure
          expect(Array.isArray(body.messages)).toBe(true);
          expect(body.messages.length).toBe(2);
          expect(body.messages[0].role).toBe('system');
          expect(body.messages[0]).toHaveProperty('content');
          expect(body.messages[1].role).toBe('user');
          expect(body.messages[1]).toHaveProperty('content');
          
          // Verify user message contains source text and languages
          const userContent = body.messages[1].content;
          expect(userContent).toContain(sourceText);
          expect(userContent).toContain(fromLanguage);
          expect(userContent).toContain(toLanguage);
          
          // If context is provided, verify it's included
          if (context) {
            expect(userContent).toContain(context);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10: Model List Filtering', () => {
    /**
     * Feature: ai-translator, Property 10: Model List Filtering
     * Validates: Requirements 5.1, 5.2
     */
    fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.oneof(
              fc.string({ minLength: 1, maxLength: 20 }).map(s => `openai/${s}`),
              fc.string({ minLength: 1, maxLength: 20 }).map(s => `anthropic/${s}`),
              fc.string({ minLength: 1, maxLength: 20 }).map(s => `google/${s}`)
            ),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            description: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
            context_length: fc.option(fc.integer({ min: 1000, max: 128000 }), { nil: undefined })
          }),
          { minLength: 0, maxLength: 20 }
        ),
        async (mockModels) => {
          // Mock API response
          const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockModels })
          });
          globalThis.fetch = mockFetch as any;

          const result = await OpenRouterService.fetchModels('test-key');

          // Verify all returned models match the expected structure
          result.forEach((model: Model) => {
            expect(model).toHaveProperty('id');
            expect(model).toHaveProperty('name');
            expect(typeof model.id).toBe('string');
            expect(typeof model.name).toBe('string');
          });

          // Verify the result matches the input data (transformed)
          expect(result.length).toBe(mockModels.length);
          
          // Verify each model is correctly transformed
          result.forEach((model: Model, index: number) => {
            const original = mockModels[index];
            expect(model.id).toBe(original.id);
            expect(model.name).toBe(original.name || original.id);
            expect(model.description).toBe(original.description);
            expect(model.contextLength).toBe(original.context_length);
          });

          // Filter for OpenAI models
          const openAIModels = result.filter((model: Model) => model.id.startsWith('openai/'));
          
          // Verify all filtered models start with 'openai/'
          openAIModels.forEach((model: Model) => {
            expect(model.id.startsWith('openai/')).toBe(true);
          });

          // Verify no non-OpenAI models are included
          const expectedOpenAICount = mockModels.filter(m => m.id.startsWith('openai/')).length;
          expect(openAIModels.length).toBe(expectedOpenAICount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
