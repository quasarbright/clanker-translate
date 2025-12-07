import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenRouterService } from '../OpenRouterService';

describe('OpenRouterService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateApiKey', () => {
    it('should return true for valid API key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] })
      });

      const result = await OpenRouterService.validateApiKey('valid-key');
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-key'
          })
        })
      );
    });

    it('should return false for invalid API key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      });

      const result = await OpenRouterService.validateApiKey('invalid-key');
      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await OpenRouterService.validateApiKey('test-key');
      expect(result).toBe(false);
    });
  });

  describe('fetchModels', () => {
    it('should fetch and return models with valid API key', async () => {
      const mockModels = {
        data: [
          {
            id: 'openai/gpt-4',
            name: 'GPT-4',
            description: 'Most capable model',
            context_length: 8192
          },
          {
            id: 'openai/gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            context_length: 4096
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockModels
      });

      const result = await OpenRouterService.fetchModels('valid-key');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'openai/gpt-4',
        name: 'GPT-4',
        description: 'Most capable model',
        contextLength: 8192
      });
      expect(result[1]).toEqual({
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: undefined,
        contextLength: 4096
      });
    });

    it('should throw auth error for invalid API key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      });

      await expect(OpenRouterService.fetchModels('invalid-key')).rejects.toMatchObject({
        type: 'auth',
        message: 'Invalid API key',
        statusCode: 401
      });
    });

    it('should throw rate_limit error when rate limited', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429
      });

      await expect(OpenRouterService.fetchModels('valid-key')).rejects.toMatchObject({
        type: 'rate_limit',
        message: 'Rate limit exceeded',
        statusCode: 429
      });
    });

    it('should throw network error on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(OpenRouterService.fetchModels('valid-key')).rejects.toMatchObject({
        type: 'network',
        message: 'Network error occurred'
      });
    });

    it('should throw invalid_response error for malformed response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'format' })
      });

      await expect(OpenRouterService.fetchModels('valid-key')).rejects.toMatchObject({
        type: 'invalid_response',
        message: 'Invalid response format from API'
      });
    });
  });

  describe('generateSystemPrompt', () => {
    it('should generate system prompt with JSON format instructions', () => {
      const systemPrompt = OpenRouterService.generateSystemPrompt();
      
      expect(systemPrompt).toContain('expert translator');
      expect(systemPrompt).toContain('culturally appropriate');
      expect(systemPrompt).toContain('contextually accurate');
      expect(systemPrompt).toContain('JSON object');
      expect(systemPrompt).toContain('translation');
      expect(systemPrompt).toContain('explanation');
      expect(systemPrompt).toContain('transcription');
    });

    it('should request structured response format', () => {
      const systemPrompt = OpenRouterService.generateSystemPrompt();
      
      expect(systemPrompt).toContain('{');
      expect(systemPrompt).toContain('}');
      expect(systemPrompt).toContain('"translation"');
      expect(systemPrompt).toContain('"explanation"');
      expect(systemPrompt).toContain('"transcription"');
    });
  });

  describe('buildUserPrompt', () => {
    it('should format user prompt with all required fields', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello world',
        fromLanguage: 'en',
        toLanguage: 'es',
        context: 'Formal business setting'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).toContain('Translate the following text from en to es');
      expect(userPrompt).toContain('Hello world');
      expect(userPrompt).toContain('Context: Formal business setting');
    });

    it('should format user prompt without context', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Good morning',
        fromLanguage: 'en',
        toLanguage: 'ja'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).toContain('Translate the following text from en to ja');
      expect(userPrompt).toContain('Good morning');
      expect(userPrompt).not.toContain('Context:');
    });

    it('should include source text exactly as provided', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Text with\nnewlines\nand special chars: @#$%',
        fromLanguage: 'en',
        toLanguage: 'fr'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).toContain('Text with\nnewlines\nand special chars: @#$%');
    });

    it('should handle empty context gracefully', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Test',
        fromLanguage: 'en',
        toLanguage: 'de',
        context: ''
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).toContain('Test');
      expect(userPrompt).not.toContain('Context:');
    });

    it('should request transcription when languages use different writing systems', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'ja'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).toContain('transcription');
      expect(userPrompt).toContain('SOURCE text');
    });

    it('should not request transcription when languages use same writing system', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'es'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).not.toContain('transcription');
      expect(userPrompt).not.toContain('romaji');
    });

    it('should not request transcription when source is auto', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'auto',
        toLanguage: 'ja'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).not.toContain('transcription');
    });

    it('should request transcription for English to Chinese', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'zh'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).toContain('transcription');
    });

    it('should request transcription for English to Korean', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'ko'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).toContain('transcription');
    });

    it('should request transcription for English to Arabic', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'ar'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).toContain('transcription');
    });

    it('should request transcription for English to Russian', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'ru'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).toContain('transcription');
    });

    it('should request transcription for Japanese to English', () => {
      const request = {
        apiKey: 'test-key',
        model: 'openai/gpt-4',
        sourceText: 'こんにちは',
        fromLanguage: 'ja',
        toLanguage: 'en'
      };

      const userPrompt = OpenRouterService.buildUserPrompt(request);
      
      expect(userPrompt).toContain('transcription');
    });
  });

  describe('parseTranslationResponse', () => {
    it('should parse valid JSON response with all fields', () => {
      const jsonContent = JSON.stringify({
        translation: 'Hola mundo',
        explanation: 'Common greeting phrase',
        transcription: 'OH-lah MOON-doh',
        detectedLanguage: 'en'
      });

      const result = OpenRouterService.parseTranslationResponse(jsonContent);
      
      expect(result.translation).toBe('Hola mundo');
      expect(result.explanation).toBe('Common greeting phrase');
      expect(result.transcription).toBe('OH-lah MOON-doh');
      expect(result.detectedLanguage).toBe('en');
    });

    it('should parse JSON response with only translation field', () => {
      const jsonContent = JSON.stringify({
        translation: 'Bonjour'
      });

      const result = OpenRouterService.parseTranslationResponse(jsonContent);
      
      expect(result.translation).toBe('Bonjour');
      expect(result.explanation).toBeUndefined();
      expect(result.transcription).toBeUndefined();
    });

    it('should handle malformed JSON by treating as plain text', () => {
      const plainText = 'This is not valid JSON';

      const result = OpenRouterService.parseTranslationResponse(plainText);
      
      expect(result.translation).toBe('This is not valid JSON');
      expect(result.explanation).toBeUndefined();
      expect(result.transcription).toBeUndefined();
    });

    it('should handle empty JSON object', () => {
      const jsonContent = JSON.stringify({});

      const result = OpenRouterService.parseTranslationResponse(jsonContent);
      
      expect(result.translation).toBe('');
      expect(result.explanation).toBeUndefined();
      expect(result.transcription).toBeUndefined();
    });

    it('should handle JSON with null values', () => {
      const jsonContent = JSON.stringify({
        translation: 'Test',
        explanation: null,
        transcription: null
      });

      const result = OpenRouterService.parseTranslationResponse(jsonContent);
      
      expect(result.translation).toBe('Test');
      expect(result.explanation).toBeNull();
      expect(result.transcription).toBeNull();
    });

    it('should handle incomplete JSON gracefully', () => {
      const incompleteJson = '{"translation": "Test"';

      const result = OpenRouterService.parseTranslationResponse(incompleteJson);
      
      expect(result.translation).toBe('{"translation": "Test"');
      expect(result.explanation).toBeUndefined();
    });

    it('should preserve special characters in translation', () => {
      const jsonContent = JSON.stringify({
        translation: 'Text with émojis 😀 and spëcial çhars'
      });

      const result = OpenRouterService.parseTranslationResponse(jsonContent);
      
      expect(result.translation).toBe('Text with émojis 😀 and spëcial çhars');
    });

    it('should parse JSON wrapped in markdown code blocks with json tag', () => {
      const markdownContent = '```json\n' + JSON.stringify({
        translation: 'Hola mundo',
        explanation: 'Common greeting',
        transcription: 'OH-lah MOON-doh'
      }) + '\n```';

      const result = OpenRouterService.parseTranslationResponse(markdownContent);
      
      expect(result.translation).toBe('Hola mundo');
      expect(result.explanation).toBe('Common greeting');
      expect(result.transcription).toBe('OH-lah MOON-doh');
    });

    it('should parse JSON wrapped in markdown code blocks without json tag', () => {
      const markdownContent = '```\n' + JSON.stringify({
        translation: 'Bonjour le monde'
      }) + '\n```';

      const result = OpenRouterService.parseTranslationResponse(markdownContent);
      
      expect(result.translation).toBe('Bonjour le monde');
    });

    it('should handle markdown code blocks without newlines', () => {
      const markdownContent = '```json' + JSON.stringify({
        translation: 'Test'
      }) + '```';

      const result = OpenRouterService.parseTranslationResponse(markdownContent);
      
      expect(result.translation).toBe('Test');
    });

    it('should handle markdown with extra whitespace', () => {
      const markdownContent = '  ```json  \n  ' + JSON.stringify({
        translation: 'Test with spaces'
      }) + '  \n  ```  ';

      const result = OpenRouterService.parseTranslationResponse(markdownContent);
      
      expect(result.translation).toBe('Test with spaces');
    });
  });

  describe('translate', () => {
    it('should translate text successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                translation: 'Hola',
                explanation: 'Simple greeting',
                transcription: undefined
              })
            }
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const request = {
        apiKey: 'valid-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'es'
      };

      const result = await OpenRouterService.translate(request);
      
      expect(result.translation).toBe('Hola');
      expect(result.explanation).toBe('Simple greeting');
      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-key'
          }),
          body: expect.stringContaining('openai/gpt-4')
        })
      );
    });

    it('should include context in translation request', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                translation: 'Hola amigo',
                explanation: 'Informal greeting'
              })
            }
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const request = {
        apiKey: 'valid-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'es',
        context: 'Informal conversation with a friend'
      };

      await OpenRouterService.translate(request);
      
      const callBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(callBody.messages[1].content).toContain('Context: Informal conversation with a friend');
    });

    it('should handle non-JSON response gracefully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Plain text translation'
            }
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const request = {
        apiKey: 'valid-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'es'
      };

      const result = await OpenRouterService.translate(request);
      
      expect(result.translation).toBe('Plain text translation');
      expect(result.explanation).toBeUndefined();
    });

    it('should throw auth error for invalid API key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      });

      const request = {
        apiKey: 'invalid-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'es'
      };

      await expect(OpenRouterService.translate(request)).rejects.toMatchObject({
        type: 'auth',
        message: 'Invalid API key',
        statusCode: 401
      });
    });

    it('should throw network error on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const request = {
        apiKey: 'valid-key',
        model: 'openai/gpt-4',
        sourceText: 'Hello',
        fromLanguage: 'en',
        toLanguage: 'es'
      };

      await expect(OpenRouterService.translate(request)).rejects.toMatchObject({
        type: 'network',
        message: 'Network error occurred during translation'
      });
    });
  });
});
