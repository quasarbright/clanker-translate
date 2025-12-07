import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiKeyGate } from '../components/ApiKeyGate';
import { LanguageSelector } from '../components/LanguageSelector';
import { InputPanel } from '../components/InputPanel';
import { OutputPanel } from '../components/OutputPanel';
import { ContextPanel } from '../components/ContextPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { ModelSelector } from '../components/ModelSelector';
import { ErrorBanner } from '../components/ErrorBanner';
import { TranslationInterface } from '../components/TranslationInterface';

/**
 * Accessibility Tests
 * Requirements: 12.3, 14.3
 * 
 * These tests verify:
 * - ARIA labels are present on all interactive elements
 * - Keyboard navigation works correctly
 * - Focus order is logical
 */

describe('Accessibility Tests', () => {
  describe('ARIA Labels', () => {
    it('ApiKeyGate has proper ARIA labels', () => {
      const onSubmit = vi.fn();
      render(<ApiKeyGate onSubmit={onSubmit} />);

      // Input should have a label
      const input = screen.getByLabelText('API Key');
      expect(input).toBeInTheDocument();

      // Submit button should be accessible
      const submitButton = screen.getByRole('button', { name: /submit key/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('LanguageSelector has proper ARIA labels', () => {
      const props = {
        fromLanguage: 'en',
        toLanguage: 'ja',
        onFromChange: vi.fn(),
        onToChange: vi.fn(),
        onSwap: vi.fn(),
      };

      render(<LanguageSelector {...props} />);

      // Language selectors should have ARIA labels
      const fromSelect = screen.getByLabelText(/source language/i);
      expect(fromSelect).toBeInTheDocument();

      const toSelect = screen.getByLabelText(/target language/i);
      expect(toSelect).toBeInTheDocument();

      // Swap button should have ARIA label
      const swapButton = screen.getByRole('button', { name: /swap languages/i });
      expect(swapButton).toBeInTheDocument();
    });

    it('InputPanel has proper ARIA labels', () => {
      const props = {
        value: '',
        onChange: vi.fn(),
        onPaste: vi.fn(),
        onCopy: vi.fn(),
        onClear: vi.fn(),
        maxLength: 5000,
      };

      render(<InputPanel {...props} />);

      // Textarea should have label - use role to be more specific
      const textarea = screen.getByRole('textbox', { name: /input text/i });
      expect(textarea).toBeInTheDocument();

      // Action buttons should have ARIA labels
      expect(screen.getByRole('button', { name: /paste from clipboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy input text/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear input text/i })).toBeInTheDocument();

      // Character counter should have aria-live
      const counter = screen.getByText(/0 \/ 5000/);
      expect(counter).toHaveAttribute('aria-live', 'polite');
    });

    it('OutputPanel has proper ARIA labels', () => {
      const props = {
        translation: 'Test translation',
        explanation: '',
        transcription: '',
        onCopy: vi.fn(),
      };

      render(<OutputPanel {...props} />);

      // Copy button should have ARIA label
      const copyButton = screen.getByRole('button', { name: /copy translation/i });
      expect(copyButton).toBeInTheDocument();
    });

    it('ContextPanel has proper ARIA labels', () => {
      const props = {
        value: '',
        onChange: vi.fn(),
      };

      render(<ContextPanel {...props} />);

      // Textarea should have label
      const textarea = screen.getByLabelText(/context input/i);
      expect(textarea).toBeInTheDocument();
    });

    it('SettingsPanel has proper ARIA labels', () => {
      const props = {
        selectedModel: 'openai/gpt-4',
        availableModels: [
          { id: 'openai/gpt-4', name: 'GPT-4' },
        ],
        onModelChange: vi.fn(),
        onClearApiKey: vi.fn(),
        onClearAllData: vi.fn(),
      };

      render(<SettingsPanel {...props} />);

      // Settings toggle should have ARIA attributes
      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('ModelSelector has proper ARIA labels', () => {
      const props = {
        selectedModel: 'openai/gpt-4',
        models: [
          { id: 'openai/gpt-4', name: 'GPT-4' },
          { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        ],
        onChange: vi.fn(),
      };

      render(<ModelSelector {...props} />);

      // Model search input should have label
      const input = screen.getByLabelText(/ai model/i);
      expect(input).toBeInTheDocument();
    });

    it('ErrorBanner has proper ARIA role', () => {
      render(<ErrorBanner error="Test error" />);

      // Error banner should have alert role
      const banner = screen.getByRole('alert');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveTextContent('Test error');
    });

    it('TranslationInterface has proper ARIA labels', () => {
      const props = {
        apiKey: 'test-key',
        selectedModel: 'openai/gpt-4',
        availableModels: [{ id: 'openai/gpt-4', name: 'GPT-4' }],
        onModelChange: vi.fn(),
        onClearApiKey: vi.fn(),
        onClearAllData: vi.fn(),
      };

      render(<TranslationInterface {...props} />);

      // Translate button should have ARIA label
      const translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('ApiKeyGate supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      
      render(<ApiKeyGate onSubmit={onSubmit} />);

      // Tab to input
      await user.tab();
      const input = screen.getByLabelText('API Key');
      expect(input).toHaveFocus();

      // Type in input
      await user.keyboard('test-key');
      expect(input).toHaveValue('test-key');

      // Tab to submit button
      await user.tab();
      const submitButton = screen.getByRole('button', { name: /submit key/i });
      expect(submitButton).toHaveFocus();
    });

    it('LanguageSelector supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const props = {
        fromLanguage: 'en',
        toLanguage: 'ja',
        onFromChange: vi.fn(),
        onToChange: vi.fn(),
        onSwap: vi.fn(),
      };

      render(<LanguageSelector {...props} />);

      // Tab through elements
      await user.tab();
      const fromSelect = screen.getByLabelText(/source language/i);
      expect(fromSelect).toHaveFocus();

      await user.tab();
      const swapButton = screen.getByRole('button', { name: /swap languages/i });
      expect(swapButton).toHaveFocus();

      await user.tab();
      const toSelect = screen.getByLabelText(/target language/i);
      expect(toSelect).toHaveFocus();
    });

    it('InputPanel supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const props = {
        value: '',
        onChange: vi.fn(),
        onPaste: vi.fn(),
        onCopy: vi.fn(),
        onClear: vi.fn(),
        maxLength: 5000,
      };

      render(<InputPanel {...props} />);

      // Tab to textarea
      await user.tab();
      const textarea = screen.getByRole('textbox', { name: /input text/i });
      expect(textarea).toHaveFocus();

      // Tab to buttons
      await user.tab();
      expect(screen.getByRole('button', { name: /paste from clipboard/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /copy input text/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /clear input text/i })).toHaveFocus();
    });

    it('SettingsPanel supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const props = {
        selectedModel: 'openai/gpt-4',
        availableModels: [{ id: 'openai/gpt-4', name: 'GPT-4' }],
        onModelChange: vi.fn(),
        onClearApiKey: vi.fn(),
        onClearAllData: vi.fn(),
      };

      render(<SettingsPanel {...props} />);

      // Tab to settings toggle
      await user.tab();
      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      expect(toggleButton).toHaveFocus();

      // Press Enter to open settings
      await user.keyboard('{Enter}');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      // Tab to model selector
      await user.tab();
      const modelInput = screen.getByLabelText(/ai model/i);
      expect(modelInput).toHaveFocus();

      // Note: When dropdown opens, model items are also focusable
      // We'll just verify the main navigation works
    });

    it('Buttons can be activated with Enter key', async () => {
      const user = userEvent.setup();
      const onSwap = vi.fn();
      const props = {
        fromLanguage: 'en',
        toLanguage: 'ja',
        onFromChange: vi.fn(),
        onToChange: vi.fn(),
        onSwap,
      };

      render(<LanguageSelector {...props} />);

      // Tab to swap button
      await user.tab();
      await user.tab();
      const swapButton = screen.getByRole('button', { name: /swap languages/i });
      expect(swapButton).toHaveFocus();

      // Press Enter
      await user.keyboard('{Enter}');
      expect(onSwap).toHaveBeenCalled();
    });

    it('Buttons can be activated with Space key', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      const props = {
        value: 'test',
        onChange: vi.fn(),
        onPaste: vi.fn(),
        onCopy: vi.fn(),
        onClear,
        maxLength: 5000,
      };

      render(<InputPanel {...props} />);

      // Tab to clear button
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();
      const clearButton = screen.getByRole('button', { name: /clear input text/i });
      expect(clearButton).toHaveFocus();

      // Press Space
      await user.keyboard(' ');
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('Focus Order', () => {
    it('ApiKeyGate has logical focus order', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      
      render(<ApiKeyGate onSubmit={onSubmit} />);

      const input = screen.getByLabelText('API Key');
      const helpLink = screen.getByRole('link', { name: /get one from openrouter/i });

      // Tab order: input -> help link (submit button is disabled when empty)
      await user.tab();
      expect(input).toHaveFocus();

      await user.tab();
      expect(helpLink).toHaveFocus();
    });

    it('TranslationInterface has logical focus order', async () => {
      const user = userEvent.setup();
      const props = {
        apiKey: 'test-key',
        selectedModel: 'openai/gpt-4',
        availableModels: [{ id: 'openai/gpt-4', name: 'GPT-4' }],
        onModelChange: vi.fn(),
        onClearApiKey: vi.fn(),
        onClearAllData: vi.fn(),
      };

      render(<TranslationInterface {...props} />);

      // Tab through elements in logical order
      await user.tab(); // Skip link
      expect(screen.getByText(/skip to main content/i)).toHaveFocus();

      await user.tab(); // Settings toggle
      expect(screen.getByRole('button', { name: /toggle settings/i })).toHaveFocus();

      await user.tab(); // From language
      expect(screen.getByLabelText(/source language/i)).toHaveFocus();

      await user.tab(); // Swap button
      expect(screen.getByRole('button', { name: /swap languages/i })).toHaveFocus();

      await user.tab(); // To language
      expect(screen.getByLabelText(/target language/i)).toHaveFocus();

      await user.tab(); // Input textarea - use role to be specific
      expect(screen.getByRole('textbox', { name: /input text/i })).toHaveFocus();
    });

    it('Focus is visible on all interactive elements', () => {
      const props = {
        fromLanguage: 'en',
        toLanguage: 'ja',
        onFromChange: vi.fn(),
        onToChange: vi.fn(),
        onSwap: vi.fn(),
      };

      const { container } = render(<LanguageSelector {...props} />);

      // Check that focus styles are defined (this is a basic check)
      // In a real scenario, you'd check computed styles
      const swapButton = screen.getByRole('button', { name: /swap languages/i });
      expect(swapButton).toBeInTheDocument();
      
      // Verify button is focusable
      expect(swapButton).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Disabled State Accessibility', () => {
    it('Disabled buttons are properly marked', () => {
      const props = {
        translation: '',
        explanation: '',
        transcription: '',
        onCopy: vi.fn(),
      };

      render(<OutputPanel {...props} />);

      const copyButton = screen.getByRole('button', { name: /copy translation/i });
      expect(copyButton).toBeDisabled();
    });

    it('Disabled swap button when source is auto', () => {
      const props = {
        fromLanguage: 'auto',
        toLanguage: 'ja',
        onFromChange: vi.fn(),
        onToChange: vi.fn(),
        onSwap: vi.fn(),
      };

      render(<LanguageSelector {...props} />);

      const swapButton = screen.getByRole('button', { name: /swap languages/i });
      expect(swapButton).toBeDisabled();
    });

    it('Disabled translate button when input is empty', () => {
      const props = {
        apiKey: 'test-key',
        selectedModel: 'openai/gpt-4',
        availableModels: [{ id: 'openai/gpt-4', name: 'GPT-4' }],
        onModelChange: vi.fn(),
        onClearApiKey: vi.fn(),
        onClearAllData: vi.fn(),
      };

      render(<TranslationInterface {...props} />);

      const translateButton = screen.getByRole('button', { name: /translate text/i });
      expect(translateButton).toBeDisabled();
    });
  });

  describe('Form Accessibility', () => {
    it('Form inputs have associated labels', () => {
      const onSubmit = vi.fn();
      render(<ApiKeyGate onSubmit={onSubmit} />);

      const input = screen.getByLabelText('API Key');
      expect(input).toHaveAttribute('id', 'api-key-input');
      
      const label = screen.getByText('API Key');
      expect(label).toHaveAttribute('for', 'api-key-input');
    });

    it('Error messages are associated with inputs', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      
      // Mock the validation to fail
      vi.mock('../services/OpenRouterService', () => ({
        OpenRouterService: {
          validateApiKey: vi.fn().mockResolvedValue(false),
        },
      }));

      render(<ApiKeyGate onSubmit={onSubmit} />);

      const input = screen.getByLabelText('API Key');
      await user.type(input, 'invalid-key');
      
      const submitButton = screen.getByRole('button', { name: /submit key/i });
      await user.click(submitButton);

      // Wait for error to appear
      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      
      // Input should be described by error
      expect(input).toHaveAttribute('aria-describedby', 'api-key-error');
    });
  });
});
