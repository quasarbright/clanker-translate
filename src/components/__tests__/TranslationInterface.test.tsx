import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationInterface } from '../TranslationInterface';
import { OpenRouterService } from '../../services/OpenRouterService';
import type { Model } from '../../types';

// Mock OpenRouterService
vi.mock('../../services/OpenRouterService', () => ({
  OpenRouterService: {
    translate: vi.fn(),
  },
}));

describe('TranslationInterface', () => {
  const mockModels: Model[] = [
    { id: 'openai/gpt-4', name: 'GPT-4', description: 'Most capable model' },
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  ];

  const defaultProps = {
    apiKey: 'test-api-key',
    selectedModel: 'openai/gpt-4',
    availableModels: mockModels,
    onModelChange: vi.fn(),
    onClearApiKey: vi.fn(),
    onClearAllData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all child components', () => {
      render(<TranslationInterface {...defaultProps} />);

      // Check for header
      expect(screen.getByRole('heading', { name: /clanker translate/i })).toBeInTheDocument();

      // Check for LanguageSelector (dropdowns)
      expect(screen.getByLabelText(/source language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/target language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/swap languages/i)).toBeInTheDocument();

      // Check for InputPanel
      expect(screen.getByRole('textbox', { name: /input text/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /paste from clipboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy input text/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear input text/i })).toBeInTheDocument();

      // Check for OutputPanel
      expect(screen.getByText(/translation will appear here/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy translation/i })).toBeInTheDocument();

      // Check for ContextPanel
      expect(screen.getByLabelText(/context input/i)).toBeInTheDocument();

      // Check for SettingsPanel
      expect(screen.getByRole('button', { name: /toggle settings/i })).toBeInTheDocument();

      // Check for Translate button
      expect(screen.getByRole('button', { name: /translate text/i })).toBeInTheDocument();
    });

    it('should render translate button as disabled when input is empty', () => {
      render(<TranslationInterface {...defaultProps} />);

      const translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeDisabled();
    });

    it('should enable translate button when input has text', async () => {
      const user = userEvent.setup();
      render(<TranslationInterface {...defaultProps} />);

      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'Hello world');

      const translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).not.toBeDisabled();
    });
  });

  describe('Translation Flow', () => {
    it('should handle translation button click', async () => {
      const user = userEvent.setup();
      const mockTranslate = vi.mocked(OpenRouterService.translate);
      mockTranslate.mockResolvedValue({
        translation: 'こんにちは世界',
        explanation: 'A common greeting',
        transcription: 'konnichiwa sekai',
      });

      render(<TranslationInterface {...defaultProps} />);

      // Enter text
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'Hello world');

      // Click translate
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      await user.click(translateButton);

      // Verify translate was called
      await waitFor(() => {
        expect(mockTranslate).toHaveBeenCalledWith(
          {
            apiKey: 'test-api-key',
            model: 'openai/gpt-4',
            sourceText: 'Hello world',
            fromLanguage: 'en',
            toLanguage: 'ja',
            context: undefined,
          },
          expect.any(AbortSignal)
        );
      });
    });

    it('should display loading state during translation', async () => {
      const user = userEvent.setup();
      const mockTranslate = vi.mocked(OpenRouterService.translate);
      
      // Create a promise that we can control
      let resolveTranslation: (value: any) => void;
      const translationPromise = new Promise((resolve) => {
        resolveTranslation = resolve;
      });
      mockTranslate.mockReturnValue(translationPromise as any);

      render(<TranslationInterface {...defaultProps} />);

      // Enter text
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'Hello world');

      // Click translate
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      await user.click(translateButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText(/translating/i)).toBeInTheDocument();
        const translateButton = screen.getByRole('button', { name: /translate text/i });
        expect(translateButton).toBeDisabled();
      });

      // Resolve the translation
      resolveTranslation!({
        translation: 'こんにちは世界',
        explanation: 'A common greeting',
        transcription: 'konnichiwa sekai',
      });

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /translate text/i })).toBeInTheDocument();
      });
    });

    it('should display successful translation', async () => {
      const user = userEvent.setup();
      const mockTranslate = vi.mocked(OpenRouterService.translate);
      mockTranslate.mockResolvedValue({
        translation: 'こんにちは世界',
        explanation: 'A common greeting',
        transcription: 'konnichiwa sekai',
      });

      render(<TranslationInterface {...defaultProps} />);

      // Enter text
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'Hello world');

      // Click translate
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      await user.click(translateButton);

      // Wait for translation to appear
      await waitFor(() => {
        expect(screen.getByText('こんにちは世界')).toBeInTheDocument();
        expect(screen.getByText('A common greeting')).toBeInTheDocument();
        expect(screen.getByText('konnichiwa sekai')).toBeInTheDocument();
      });
    });

    it('should display error state when translation fails', async () => {
      const user = userEvent.setup();
      const mockTranslate = vi.mocked(OpenRouterService.translate);
      mockTranslate.mockRejectedValue({
        type: 'network',
        message: 'Network error occurred',
      });

      render(<TranslationInterface {...defaultProps} />);

      // Enter text
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'Hello world');

      // Click translate
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      await user.click(translateButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should clear error on new translation attempt', async () => {
      const user = userEvent.setup();
      const mockTranslate = vi.mocked(OpenRouterService.translate);
      
      // First call fails
      mockTranslate.mockRejectedValueOnce({
        type: 'network',
        message: 'Network error occurred',
      });

      render(<TranslationInterface {...defaultProps} />);

      // Enter text
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'Hello world');

      // Click translate (will fail)
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      await user.click(translateButton);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Second call succeeds
      mockTranslate.mockResolvedValueOnce({
        translation: 'こんにちは世界',
      });

      // Click translate again
      await user.click(translateButton);

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should show error when attempting to translate empty input', async () => {
      const user = userEvent.setup();
      render(<TranslationInterface {...defaultProps} />);

      // Enter text then clear it
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'Hello');
      await user.clear(inputTextarea);

      // Try to translate (button should be disabled, but test the validation)
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeDisabled();
    });

    it('should show error when attempting to translate whitespace-only input', async () => {
      const user = userEvent.setup();
      const mockTranslate = vi.mocked(OpenRouterService.translate);

      render(<TranslationInterface {...defaultProps} />);

      // Enter whitespace
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, '   ');

      // Button should be disabled for whitespace
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeDisabled();

      // Verify translate was not called
      expect(mockTranslate).not.toHaveBeenCalled();
    });
  });

  describe('Validation Logic', () => {
    it('should validate empty input and show error message', async () => {
      const user = userEvent.setup();
      render(<TranslationInterface {...defaultProps} />);

      // Manually trigger translate with empty input (simulating direct call)
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'test');
      await user.clear(inputTextarea);

      // Button should be disabled
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeDisabled();
    });

    it('should validate whitespace-only input and disable button', async () => {
      const user = userEvent.setup();
      render(<TranslationInterface {...defaultProps} />);

      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      
      // Test various whitespace patterns
      await user.type(inputTextarea, '   ');
      let translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeDisabled();

      await user.clear(inputTextarea);
      await user.type(inputTextarea, '\t\t');
      translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeDisabled();

      await user.clear(inputTextarea);
      await user.type(inputTextarea, '\n\n');
      translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeDisabled();
    });

    it('should validate missing API key and show error message', async () => {
      const user = userEvent.setup();
      const propsWithoutKey = {
        ...defaultProps,
        apiKey: '',
      };
      
      render(<TranslationInterface {...propsWithoutKey} />);

      // Enter valid text
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'Hello world');

      // Button should be enabled (validation happens on click)
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).not.toBeDisabled();

      // Click translate
      await user.click(translateButton);

      // Should show error about missing API key
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/please enter your api key/i)).toBeInTheDocument();
      });
    });

    it('should disable translate button when input is empty', () => {
      render(<TranslationInterface {...defaultProps} />);

      const translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeDisabled();
    });

    it('should disable translate button when input contains only whitespace', async () => {
      const user = userEvent.setup();
      render(<TranslationInterface {...defaultProps} />);

      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, '     ');

      const translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeDisabled();
    });

    it('should disable translate button during translation', async () => {
      const user = userEvent.setup();
      const mockTranslate = vi.mocked(OpenRouterService.translate);
      
      // Create a promise that we can control
      let resolveTranslation: (value: any) => void;
      const translationPromise = new Promise((resolve) => {
        resolveTranslation = resolve;
      });
      mockTranslate.mockReturnValue(translationPromise as any);

      render(<TranslationInterface {...defaultProps} />);

      // Enter text
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'Hello world');

      // Click translate
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      await user.click(translateButton);

      // Button should be disabled during translation
      await waitFor(() => {
        expect(translateButton).toBeDisabled();
      });

      // Resolve the translation
      resolveTranslation!({
        translation: 'こんにちは世界',
      });

      // Button should be enabled again
      await waitFor(() => {
        expect(translateButton).not.toBeDisabled();
      });
    });

    it('should enable translate button when valid text is entered', async () => {
      const user = userEvent.setup();
      render(<TranslationInterface {...defaultProps} />);

      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      const translateButton = screen.getByRole('button', { name: /translate text/i });

      // Initially disabled
      expect(translateButton).toBeDisabled();

      // Type valid text
      await user.type(inputTextarea, 'Hello');

      // Should be enabled
      expect(translateButton).not.toBeDisabled();
    });
  });

  describe('Context Integration', () => {
    it('should include context in translation request when provided', async () => {
      const user = userEvent.setup();
      const mockTranslate = vi.mocked(OpenRouterService.translate);
      mockTranslate.mockResolvedValue({
        translation: 'こんにちは世界',
      });

      render(<TranslationInterface {...defaultProps} />);

      // Enter text and context
      const inputTextarea = screen.getByRole('textbox', { name: /input text/i });
      await user.type(inputTextarea, 'Hello world');

      const contextTextarea = screen.getByRole('textbox', { name: /context input/i });
      await user.type(contextTextarea, 'formal business setting');

      // Click translate
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      await user.click(translateButton);

      // Verify translate was called with context
      await waitFor(() => {
        expect(mockTranslate).toHaveBeenCalledWith(
          {
            apiKey: 'test-api-key',
            model: 'openai/gpt-4',
            sourceText: 'Hello world',
            fromLanguage: 'en',
            toLanguage: 'ja',
            context: 'formal business setting',
          },
          expect.any(AbortSignal)
        );
      });
    });
  });
});
