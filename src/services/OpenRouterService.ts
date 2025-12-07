import type { Model, TranslationRequest, TranslationResponse, OpenRouterError } from '../types';
import { needsTranscription } from '../utils/writingSystem';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MAX_RETRIES = 3;

export class OpenRouterService {
  /**
   * Validate an API key by making a test request to OpenRouter
   * @param key The API key to validate
   * @returns Promise that resolves to true if valid, false otherwise
   */
  static async validateApiKey(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Clanker Translate'
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch available models from OpenRouter
   * @param key The API key for authentication
   * @returns Promise that resolves to array of models
   * @throws OpenRouterError if the request fails
   */
  static async fetchModels(key: string): Promise<Model[]> {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Clanker Translate'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw this.createError('auth', 'Invalid API key', response.status);
        }
        if (response.status === 429) {
          throw this.createError('rate_limit', 'Rate limit exceeded', response.status);
        }
        throw this.createError('unknown', `Request failed with status ${response.status}`, response.status);
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw this.createError('invalid_response', 'Invalid response format from API');
      }

      return data.data.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description,
        contextLength: model.context_length
      }));
    } catch (error) {
      if ((error as OpenRouterError).type) {
        throw error;
      }
      throw this.createError('network', 'Network error occurred');
    }
  }

  /**
   * Generate the system prompt for translation
   * @returns The system prompt string
   */
  static generateSystemPrompt(): string {
    return `You are an expert translator. Provide translations that are culturally appropriate and contextually accurate. 
Return ONLY a valid JSON object with the following structure (no markdown, no extra text):
{
  "translation": "the translated text in the target language",
  "explanation": "explanation of translation choices, ambiguities, and cultural notes (ALWAYS in English)",
  "transcription": "romanized transcription of the TRANSLATED text if source and target language use different writing systems (omit if not applicable)"
}

IMPORTANT:
- The "explanation" field must ALWAYS be written in English, regardless of source or target language
- The "transcription" field should be a ROMANIZATION of the TRANSLATED (destination) text, NOT IPA phonetic symbols. Ex: "こんにちは" should be transcribed as "konnichiwa"
- Use standard romanization systems: romaji for Japanese, pinyin for Chinese, etc.
- Do NOT use IPA symbols like ə, ʊ, ˈ - use simple Latin letters only
- Ensure the JSON is complete and properly formatted
- Keep explanations concise but informative. Do not mention transcription in the explanation, explanation should just be an explanation of the translation itself.`;
  }

  /**
   * Translate text using OpenRouter with retry logic
   * @param request The translation request
   * @param signal Optional AbortSignal for request cancellation
   * @returns Promise that resolves to translation response
   * @throws OpenRouterError if the request fails after all retries
   */
  static async translate(request: TranslationRequest, signal?: AbortSignal): Promise<TranslationResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[OpenRouterService] Translation attempt ${attempt}/${MAX_RETRIES}`);
        const result = await this.translateAttempt(request, signal);
        
        // Validate the response schema
        if (this.isValidTranslationResponse(result)) {
          if (attempt > 1) {
            console.log(`[OpenRouterService] Translation succeeded on attempt ${attempt}`);
          }
          return result;
        }
        
        // Invalid schema - log and retry
        console.warn(`[OpenRouterService] Invalid response schema on attempt ${attempt}:`, result);
        lastError = new Error('Invalid response schema');
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on auth, rate limit, or abort errors
        if ((error as OpenRouterError).type === 'auth' || 
            (error as OpenRouterError).type === 'rate_limit' ||
            (error as Error).name === 'AbortError') {
          throw error;
        }
        
        console.warn(`[OpenRouterService] Translation attempt ${attempt} failed:`, error);
        
        // Don't retry if this was the last attempt
        if (attempt === MAX_RETRIES) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }

    console.error(`[OpenRouterService] All ${MAX_RETRIES} translation attempts failed`);
    throw lastError || this.createError('unknown', 'Translation failed after multiple attempts');
  }

  /**
   * Single translation attempt
   * @param request The translation request
   * @param signal Optional AbortSignal for request cancellation
   * @returns Promise that resolves to translation response
   * @throws OpenRouterError if the request fails
   */
  private static async translateAttempt(request: TranslationRequest, signal?: AbortSignal): Promise<TranslationResponse> {
    const systemPrompt = this.generateSystemPrompt();
    const userPrompt = this.buildUserPrompt(request);

    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${request.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Clanker Translate'
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4000
        }),
        signal
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw this.createError('auth', 'Invalid API key', response.status);
        }
        if (response.status === 429) {
          throw this.createError('rate_limit', 'Rate limit exceeded. Please try again later.', response.status);
        }
        throw this.createError('unknown', `Translation request failed with status ${response.status}`, response.status);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw this.createError('invalid_response', 'Invalid response format from API');
      }

      const content = data.choices[0].message.content;
      return this.parseTranslationResponse(content);
    } catch (error) {
      if ((error as OpenRouterError).type) {
        throw error;
      }
      throw this.createError('network', 'Network error occurred during translation');
    }
  }

  /**
   * Validate that a translation response conforms to the expected schema
   * @param response The response to validate
   * @returns true if valid, false otherwise
   */
  private static isValidTranslationResponse(response: TranslationResponse): boolean {
    // Must have a translation field that is a non-empty string
    if (!response.translation || typeof response.translation !== 'string' || response.translation.trim() === '') {
      console.warn('[OpenRouterService] Invalid translation: missing or empty translation field');
      return false;
    }

    // If explanation exists, it must be a string
    if (response.explanation !== undefined && typeof response.explanation !== 'string') {
      console.warn('[OpenRouterService] Invalid translation: explanation is not a string');
      return false;
    }

    // If transcription exists, it must be a string
    if (response.transcription !== undefined && typeof response.transcription !== 'string') {
      console.warn('[OpenRouterService] Invalid translation: transcription is not a string');
      return false;
    }

    // If detectedLanguage exists, it must be a string
    if (response.detectedLanguage !== undefined && typeof response.detectedLanguage !== 'string') {
      console.warn('[OpenRouterService] Invalid translation: detectedLanguage is not a string');
      return false;
    }

    return true;
  }

  /**
   * Build the user prompt for translation
   * @param request The translation request
   * @returns The formatted user prompt
   */
  static buildUserPrompt(request: TranslationRequest): string {
    let prompt = `Translate the following text from ${request.fromLanguage} to ${request.toLanguage}:\n\n${request.sourceText}`;
    
    if (request.context) {
      prompt += `\n\nContext: ${request.context}`;
    }

    // Request transcription if languages use different writing systems
    if (needsTranscription(request.fromLanguage, request.toLanguage)) {
      prompt += `\n\nPlease include a ROMANIZATION of the TRANSLATED text (the translated ${request.toLanguage} text)`;
      
      // Add specific transcription format based on source language
      if (request.fromLanguage === 'ja') {
        prompt += ' using romaji (e.g., "konnichiwa" not "kõ̞nːit͡ɕiɰᵝa̠")';
      } else if (request.fromLanguage === 'zh' || request.fromLanguage === 'zh-CN' || request.fromLanguage === 'zh-TW') {
        prompt += ' using pinyin with tone marks (e.g., "nǐ hǎo")';
      } else if (request.fromLanguage === 'ko') {
        prompt += ' using revised romanization (e.g., "annyeonghaseyo")';
      } else if (request.fromLanguage === 'ar') {
        prompt += ' using simple Latin letters (e.g., "marhaban")';
      } else if (request.fromLanguage === 'ru') {
        prompt += ' using simple Latin letters (e.g., "privet")';
      }
      
      prompt += '. Use ONLY Latin letters (a-z), NO IPA symbols.';
    }

    prompt += '\n\nRemember: Write the explanation in English.';

    return prompt;
  }

  /**
   * Parse the JSON response from the AI model
   * @param content The content string from the API response
   * @returns Parsed TranslationResponse
   */
  static parseTranslationResponse(content: string): TranslationResponse {
    try {
      // Remove markdown code blocks if present (```json ... ```)
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```')) {
        // Remove opening ```json or ```
        cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, '');
        // Remove closing ```
        cleanContent = cleanContent.replace(/\n?```\s*$/, '');
      }
      
      const parsed = JSON.parse(cleanContent);
      
      // Log if JSON was successfully parsed but might be incomplete
      if (!parsed.translation) {
        console.warn('[OpenRouterService] Parsed JSON missing translation field:', cleanContent.substring(0, 200));
      }
      
      return {
        translation: parsed.translation || '',
        explanation: parsed.explanation,
        transcription: parsed.transcription,
        detectedLanguage: parsed.detectedLanguage
      };
    } catch (error) {
      // Log JSON parsing failures
      console.error('[OpenRouterService] Failed to parse JSON response:', error);
      console.error('[OpenRouterService] Raw content:', content.substring(0, 500));
      
      // If JSON parsing fails, treat the entire content as translation
      return {
        translation: content,
        explanation: undefined,
        transcription: undefined
      };
    }
  }

  /**
   * Create a typed error object
   * @param type The error type
   * @param message The error message
   * @param statusCode Optional HTTP status code
   * @returns OpenRouterError object
   */
  private static createError(
    type: OpenRouterError['type'],
    message: string,
    statusCode?: number
  ): OpenRouterError {
    return { type, message, statusCode };
  }
}
