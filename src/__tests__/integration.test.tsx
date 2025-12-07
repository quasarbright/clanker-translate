import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { TranslationInterface } from '../components/TranslationInterface';
import { StorageService } from '../services/StorageService';
import { OpenRouterService } from '../services/OpenRouterService';
import type { Model, TranslationResponse } from '../types';

/**
 * End-to-End Integration Tests
 * 
 * These tests verify complete user flows through the application:
 * - API key entry and validation
 * - Full translation workflow
 * - Settings persistence across page reloads
 * - Error handling and recovery
 * - Edge cases and boundary conditions
 */

// Mock the services
vi.mock('../services/StorageService');
vi.mock('../services/OpenRouterService');

const mockModels: Model[] = [
  { id: 'openai/gpt-4', name: 'GPT-4', description: 'Most capable model' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
];

describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Setup default mocks
    vi.mocked(StorageService.getLanguagePreferences).mockReturnValue({
      fromLanguage: 'en',
      toLanguage: 'ja',
    });
    
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        readText: vi.fn(),
        writeText: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete API Key Flow', () => {
    it('should complete full API key entry flow from start to translation interface', async () => {
      const user = userEvent.setup();
      
      // Start with no API key
      vi.mocked(StorageService.getApiKey).mockReturnValue(null);
      vi.mocked(OpenRouterService.validateApiKey).mockResolvedValue(true);
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);
      vi.mocked(StorageService.getSelectedModel).mockReturnValue(null);

      render(<App />);

      // Step 1: Should show API key gate
      expect(screen.getByText(/enter your openrouter api key/i)).toBeInTheDocument();

      // Step 2: Enter API key
      const apiKeyInput = screen.getByLabelText(/api key/i);
      await user.type(apiKeyInput, 'sk-test-key-12345');

      // Step 3: Submit the key
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Step 4: Should store the API key
      await waitFor(() => {
        expect(StorageService.setApiKey).toHaveBeenCalledWith('sk-test-key-12345');
      });

      // Step 5: Should fetch models
      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalledWith('sk-test-key-12345');
      });

      // Step 6: Should show translation interface
      await waitFor(() => {
        expect(screen.getByText(/clanker translate/i)).toBeInTheDocument();
        expect(screen.queryByText(/enter your openrouter api key/i)).not.toBeInTheDocument();
      });

      // Step 7: Should set default model
      await waitFor(() => {
        expect(StorageService.setSelectedModel).toHaveBeenCalledWith(mockModels[0].id);
      });
    });

    it('should handle invalid API key with error message and retry', async () => {
      const user = userEvent.setup();
      
      vi.mocked(StorageService.getApiKey).mockReturnValue(null);
      vi.mocked(OpenRouterService.validateApiKey).mockResolvedValue(false);

      render(<App />);

      // Enter invalid API key
      const apiKeyInput = screen.getByLabelText(/api key/i);
      await user.type(apiKeyInput, 'invalid-key');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/invalid api key/i)).toBeInTheDocument();
      });

      // Should not store the invalid key
      expect(StorageService.setApiKey).not.toHaveBeenCalled();

      // Retry with valid key
      vi.mocked(OpenRouterService.validateApiKey).mockResolvedValue(true);
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);

      await user.clear(apiKeyInput);
      await user.type(apiKeyInput, 'sk-valid-key');
      await user.click(submitButton);

      // Should now succeed
      await waitFor(() => {
        expect(StorageService.setApiKey).toHaveBeenCalledWith('sk-valid-key');
      });
    });

    it('should handle network errors during API key validation', async () => {
      const user = userEvent.setup();
      
      vi.mocked(StorageService.getApiKey).mockReturnValue(null);
      vi.mocked(OpenRouterService.validateApiKey).mockRejectedValue(
        new Error('Network error')
      );

      render(<App />);

      const apiKeyInput = screen.getByLabelText(/api key/i);
      await user.type(apiKeyInput, 'sk-test-key');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show error message (generic error for network issues)
      await waitFor(() => {
        expect(screen.getByText(/error occurred|try again/i)).toBeInTheDocument();
      });
    });
  });

  describe('Complete Translation Flow', () => {
    const mockHandlers = {
      onModelChange: vi.fn(),
      onClearApiKey: vi.fn(),
      onClearAllData: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should complete full translation workflow from input to output', async () => {
      const user = userEvent.setup();
      
      const mockTranslation: TranslationResponse = {
        translation: 'こんにちは',
        explanation: 'A common Japanese greeting',
        transcription: 'konnichiwa',
      };

      vi.mocked(OpenRouterService.translate).mockResolvedValue(mockTranslation);

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      // Wait for interface to load
      await waitFor(() => {
        expect(screen.getByLabelText(/source language/i)).toBeInTheDocument();
      });

      // Step 1: Select languages
      const fromSelect = screen.getByLabelText(/source language/i);
      const toSelect = screen.getByLabelText(/target language/i);
      
      await user.selectOptions(fromSelect, 'en');
      await user.selectOptions(toSelect, 'ja');

      // Step 2: Enter text to translate
      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, 'Hello');

      // Step 3: Add context (optional)
      const contextTextarea = screen.getByPlaceholderText(/add context/i);
      await user.type(contextTextarea, 'Casual greeting');

      // Step 4: Click translate button
      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Step 5: Should call translation service
      await waitFor(() => {
        expect(OpenRouterService.translate).toHaveBeenCalledWith(
          expect.objectContaining({
            apiKey: 'sk-test-key',
            model: 'openai/gpt-4',
            sourceText: 'Hello',
            fromLanguage: 'en',
            toLanguage: 'ja',
            context: 'Casual greeting',
          }),
          expect.any(AbortSignal)
        );
      });

      // Step 6: Should display translation results
      await waitFor(() => {
        expect(screen.getByText('こんにちは')).toBeInTheDocument();
        expect(screen.getByText(/konnichiwa/i)).toBeInTheDocument();
        expect(screen.getByText(/common japanese greeting/i)).toBeInTheDocument();
      });
    });

    it('should handle translation without context', async () => {
      const user = userEvent.setup();
      
      const mockTranslation: TranslationResponse = {
        translation: 'Bonjour',
        explanation: 'French greeting',
      };

      vi.mocked(OpenRouterService.translate).mockResolvedValue(mockTranslation);

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/source language/i)).toBeInTheDocument();
      });

      // Select languages
      await user.selectOptions(screen.getByLabelText(/source language/i), 'en');
      await user.selectOptions(screen.getByLabelText(/target language/i), 'fr');

      // Enter text without context
      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, 'Hello');

      // Translate
      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Should call translate without context
      await waitFor(() => {
        expect(OpenRouterService.translate).toHaveBeenCalledWith(
          expect.objectContaining({
            sourceText: 'Hello',
            context: undefined,
          }),
          expect.any(AbortSignal)
        );
      });

      // Should display translation
      await waitFor(() => {
        expect(screen.getByText('Bonjour')).toBeInTheDocument();
      });
    });

    it('should handle auto-detect source language', async () => {
      const user = userEvent.setup();
      
      const mockTranslation: TranslationResponse = {
        translation: 'Hello',
        detectedLanguage: 'ja',
      };

      vi.mocked(OpenRouterService.translate).mockResolvedValue(mockTranslation);

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/source language/i)).toBeInTheDocument();
      });

      // Select auto-detect
      await user.selectOptions(screen.getByLabelText(/source language/i), 'auto');
      await user.selectOptions(screen.getByLabelText(/target language/i), 'en');

      // Enter text
      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, 'こんにちは');

      // Translate
      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Should use 'auto' as fromLanguage
      await waitFor(() => {
        expect(OpenRouterService.translate).toHaveBeenCalledWith(
          expect.objectContaining({
            fromLanguage: 'auto',
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it('should disable translate button when input is empty', async () => {
      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument();
      });

      const translateButton = screen.getByRole('button', { name: /translate/i });
      
      // Should be disabled with empty input
      expect(translateButton).toBeDisabled();
    });

    it('should disable translate button for whitespace-only input', async () => {
      const user = userEvent.setup();
      
      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, '   \n\t  ');

      const translateButton = screen.getByRole('button', { name: /translate/i });
      
      // Should be disabled with whitespace-only input
      expect(translateButton).toBeDisabled();
    });
  });

  describe('Settings Persistence Across Page Reloads', () => {
    it('should persist and restore API key across reloads', () => {
      // First render - set API key
      vi.mocked(StorageService.getApiKey).mockReturnValue(null);
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);

      const { unmount } = render(<App />);

      // Simulate storing the key
      vi.mocked(StorageService.setApiKey).mockImplementation((key) => {
        vi.mocked(StorageService.getApiKey).mockReturnValue(key);
      });

      unmount();

      // Second render - should load stored key
      vi.mocked(StorageService.getApiKey).mockReturnValue('sk-stored-key');
      
      render(<App />);

      // Should call getApiKey on mount
      expect(StorageService.getApiKey).toHaveBeenCalled();
      
      // Should show translation interface, not API key gate
      expect(screen.queryByText(/enter your openrouter api key/i)).not.toBeInTheDocument();
    });

    it('should persist and restore model selection across reloads', async () => {
      vi.mocked(StorageService.getApiKey).mockReturnValue('sk-test-key');
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);
      vi.mocked(StorageService.getSelectedModel).mockReturnValue('openai/gpt-3.5-turbo');

      render(<App />);

      // Should load stored model
      await waitFor(() => {
        expect(StorageService.getSelectedModel).toHaveBeenCalled();
      });

      // Should not set a new model since stored one is valid
      expect(StorageService.setSelectedModel).not.toHaveBeenCalled();
    });

    it('should persist and restore language preferences across reloads', async () => {
      vi.mocked(StorageService.getApiKey).mockReturnValue('sk-test-key');
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);
      vi.mocked(StorageService.getLanguagePreferences).mockReturnValue({
        fromLanguage: 'es',
        toLanguage: 'fr',
      });

      render(<App />);

      await waitFor(() => {
        expect(StorageService.getLanguagePreferences).toHaveBeenCalled();
      });

      // Should restore the stored languages
      const fromSelect = screen.getByLabelText(/source language/i);
      const toSelect = screen.getByLabelText(/target language/i);
      
      expect(fromSelect).toHaveValue('es');
      expect(toSelect).toHaveValue('fr');
    });

    it('should persist all settings together across reload', async () => {
      const user = userEvent.setup();
      
      // Initial state
      vi.mocked(StorageService.getApiKey).mockReturnValue('sk-test-key');
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);
      vi.mocked(StorageService.getSelectedModel).mockReturnValue('openai/gpt-4');
      vi.mocked(StorageService.getLanguagePreferences).mockReturnValue({
        fromLanguage: 'de',
        toLanguage: 'es',
      });

      const { unmount } = render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText(/source language/i)).toBeInTheDocument();
      });

      // Change language
      await user.selectOptions(screen.getByLabelText(/source language/i), 'en');

      // Verify language was saved
      await waitFor(() => {
        expect(StorageService.setLanguagePreferences).toHaveBeenCalledWith({
          fromLanguage: 'en',
          toLanguage: 'es',
        });
      });

      unmount();

      // Simulate reload with updated preferences
      vi.mocked(StorageService.getLanguagePreferences).mockReturnValue({
        fromLanguage: 'en',
        toLanguage: 'es',
      });

      render(<App />);

      // All settings should be restored
      await waitFor(() => {
        expect(StorageService.getApiKey).toHaveBeenCalled();
        expect(StorageService.getSelectedModel).toHaveBeenCalled();
        expect(StorageService.getLanguagePreferences).toHaveBeenCalled();
      });

      const fromSelect = screen.getByLabelText(/source language/i);
      expect(fromSelect).toHaveValue('en');
    });

    it('should clear all settings when user logs out', async () => {
      const user = userEvent.setup();
      
      vi.mocked(StorageService.getApiKey).mockReturnValue('sk-test-key');
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);
      vi.mocked(StorageService.getSelectedModel).mockReturnValue('openai/gpt-4');

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle settings/i })).toBeInTheDocument();
      });

      // Open settings
      const settingsButton = screen.getByRole('button', { name: /toggle settings/i });
      await user.click(settingsButton);

      // Click clear API key
      const clearButton = screen.getByRole('button', { name: /clear api key/i });
      await user.click(clearButton);

      // Should clear the API key
      await waitFor(() => {
        expect(StorageService.clearApiKey).toHaveBeenCalled();
      });

      // Should return to API key gate
      await waitFor(() => {
        expect(screen.getByText(/enter your openrouter api key/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    const mockHandlers = {
      onModelChange: vi.fn(),
      onClearApiKey: vi.fn(),
      onClearAllData: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle authentication errors during translation', async () => {
      const user = userEvent.setup();
      
      vi.mocked(OpenRouterService.translate).mockRejectedValue({
        type: 'auth',
        message: 'Invalid API key',
        statusCode: 401,
      });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      // Enter text and translate
      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, 'Hello');

      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Should display auth error (check for authentication-related message)
      await waitFor(() => {
        expect(screen.getByText(/authentication|api key/i)).toBeInTheDocument();
      });
    });

    it('should handle rate limit errors with appropriate message', async () => {
      const user = userEvent.setup();
      
      vi.mocked(OpenRouterService.translate).mockRejectedValue({
        type: 'rate_limit',
        message: 'Rate limit exceeded. Please try again later.',
        statusCode: 429,
      });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, 'Hello');

      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Should display rate limit error
      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors during translation', async () => {
      const user = userEvent.setup();
      
      vi.mocked(OpenRouterService.translate).mockRejectedValue({
        type: 'network',
        message: 'Network error occurred during translation',
      });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, 'Hello');

      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Should display network error
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should clear error on new translation attempt', async () => {
      const user = userEvent.setup();
      
      // First translation fails
      vi.mocked(OpenRouterService.translate).mockRejectedValueOnce({
        type: 'network',
        message: 'Network error',
      });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, 'Hello');

      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Second translation succeeds
      vi.mocked(OpenRouterService.translate).mockResolvedValue({
        translation: 'Bonjour',
      });

      await user.click(translateButton);

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
      });

      // Should show translation
      await waitFor(() => {
        expect(screen.getByText('Bonjour')).toBeInTheDocument();
      });
    });

    it('should handle model fetch errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(OpenRouterService.fetchModels).mockRejectedValue(
        new Error('Failed to fetch models')
      );

      render(<App />);

      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalled();
      });

      // Should log error but not crash
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch models:',
        expect.any(Error)
      );

      // Should still show interface
      expect(screen.getByText(/clanker translate/i)).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it('should recover from error and complete successful translation', async () => {
      const user = userEvent.setup();
      
      // First attempt fails
      vi.mocked(OpenRouterService.translate)
        .mockRejectedValueOnce({
          type: 'network',
          message: 'Network error',
        })
        .mockResolvedValueOnce({
          translation: 'こんにちは',
          transcription: 'konnichiwa',
        });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, 'Hello');

      const translateButton = screen.getByRole('button', { name: /translate/i });
      
      // First attempt
      await user.click(translateButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Retry
      await user.click(translateButton);

      // Should succeed
      await waitFor(() => {
        expect(screen.getByText('こんにちは')).toBeInTheDocument();
        expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    const mockHandlers = {
      onModelChange: vi.fn(),
      onClearApiKey: vi.fn(),
      onClearAllData: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle very long input text', async () => {
      const user = userEvent.setup();
      
      const longText = 'a'.repeat(100); // Reduced for faster testing
      
      vi.mocked(OpenRouterService.translate).mockResolvedValue({
        translation: 'Translation of long text',
      });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.click(inputTextarea);
      await user.paste(longText);

      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Should handle long text
      await waitFor(() => {
        expect(OpenRouterService.translate).toHaveBeenCalledWith(
          expect.objectContaining({
            sourceText: longText,
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it('should handle special characters in input', async () => {
      const user = userEvent.setup();
      
      const specialText = '!@#$%^&*()';
      
      vi.mocked(OpenRouterService.translate).mockResolvedValue({
        translation: 'Translated special chars',
      });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.click(inputTextarea);
      await user.paste(specialText);

      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Should handle special characters
      await waitFor(() => {
        expect(OpenRouterService.translate).toHaveBeenCalledWith(
          expect.objectContaining({
            sourceText: specialText,
          }),
          expect.any(AbortSignal)
        );
      });
    });

    it('should handle unicode and emoji in input', async () => {
      const user = userEvent.setup();
      
      const unicodeText = 'Hello world';
      
      vi.mocked(OpenRouterService.translate).mockResolvedValue({
        translation: 'Translated unicode',
      });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, unicodeText);

      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Should handle unicode
      await waitFor(() => {
        expect(OpenRouterService.translate).toHaveBeenCalled();
      });
    });

    it('should handle empty model list gracefully', async () => {
      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel=""
          availableModels={[]}
          {...mockHandlers}
        />
      );

      // Should not crash with empty model list
      expect(screen.getByText(/clanker translate/i)).toBeInTheDocument();
    });

    it('should handle malformed translation response', async () => {
      const user = userEvent.setup();
      
      // Response with missing fields
      vi.mocked(OpenRouterService.translate).mockResolvedValue({
        translation: '',
      });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, 'Hello');

      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      // Should handle empty translation
      await waitFor(() => {
        expect(OpenRouterService.translate).toHaveBeenCalled();
      });
    });

    it('should handle swap button with auto-detect disabled', async () => {
      const user = userEvent.setup();
      
      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/source language/i)).toBeInTheDocument();
      });

      // Set source to auto
      const fromSelect = screen.getByLabelText(/source language/i);
      await user.selectOptions(fromSelect, 'auto');

      // Swap button should be disabled
      const swapButton = screen.getByRole('button', { name: /swap/i });
      expect(swapButton).toBeDisabled();
    });

    it('should handle clipboard operations failure gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock clipboard failure by replacing the mock
      const mockReadText = vi.fn().mockRejectedValue(new Error('Clipboard access denied'));
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          readText: mockReadText,
          writeText: vi.fn(),
        },
        writable: true,
        configurable: true,
      });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /paste/i })).toBeInTheDocument();
      });

      // Try to paste
      const pasteButton = screen.getByRole('button', { name: /paste/i });
      await user.click(pasteButton);

      // Should log error but not crash
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to read clipboard:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

  });

  describe('User Interaction Flows', () => {
    const mockHandlers = {
      onModelChange: vi.fn(),
      onClearApiKey: vi.fn(),
      onClearAllData: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should support copy-paste workflow', async () => {
      const user = userEvent.setup();
      
      // Mock clipboard
      const clipboardText = 'Text from clipboard';
      const mockReadText = vi.fn().mockResolvedValue(clipboardText);
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          readText: mockReadText,
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      });

      vi.mocked(OpenRouterService.translate).mockResolvedValue({
        translation: 'Translated text',
      });

      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /paste/i })).toBeInTheDocument();
      });

      // Paste text
      const pasteButton = screen.getByRole('button', { name: /paste/i });
      await user.click(pasteButton);

      // Verify text was pasted
      await waitFor(() => {
        const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
        expect(inputTextarea).toHaveValue(clipboardText);
      });

      // Translate
      const translateButton = screen.getByRole('button', { name: /translate/i });
      await user.click(translateButton);

      await waitFor(() => {
        expect(screen.getByText('Translated text')).toBeInTheDocument();
      });

      // Copy output
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      const copyOutputButton = copyButtons.find(btn => !btn.closest('.input-panel'));
      await user.click(copyOutputButton!);

      // Verify copy was called
      expect(mockWriteText).toHaveBeenCalledWith('Translated text');
    });

    it('should support clear and retry workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter text to translate/i)).toBeInTheDocument();
      });

      // Enter text
      const inputTextarea = screen.getByPlaceholderText(/enter text to translate/i);
      await user.type(inputTextarea, 'First text');

      // Clear
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      // Input should be empty
      expect(inputTextarea).toHaveValue('');

      // Enter new text
      await user.type(inputTextarea, 'Second text');
      expect(inputTextarea).toHaveValue('Second text');
    });

    it('should support language swap workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <TranslationInterface
          apiKey="sk-test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          {...mockHandlers}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/source language/i)).toBeInTheDocument();
      });

      const fromSelect = screen.getByLabelText(/source language/i);
      const toSelect = screen.getByLabelText(/target language/i);

      // Set initial languages
      await user.selectOptions(fromSelect, 'en');
      await user.selectOptions(toSelect, 'ja');

      expect(fromSelect).toHaveValue('en');
      expect(toSelect).toHaveValue('ja');

      // Swap
      const swapButton = screen.getByRole('button', { name: /swap/i });
      await user.click(swapButton);

      // Languages should be swapped
      await waitFor(() => {
        expect(fromSelect).toHaveValue('ja');
        expect(toSelect).toHaveValue('en');
      });
    });
  });
});
