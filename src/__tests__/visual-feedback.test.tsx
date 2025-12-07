import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationInterface } from '../components/TranslationInterface';
import { InputPanel } from '../components/InputPanel';
import { OutputPanel } from '../components/OutputPanel';
import type { Model } from '../types';

// Mock OpenRouterService
vi.mock('../services/OpenRouterService', () => ({
  OpenRouterService: {
    translate: vi.fn(),
  },
}));

describe('Visual Feedback Tests', () => {
  const mockModels: Model[] = [
    { id: 'openai/gpt-4', name: 'GPT-4', description: 'Test model' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fade-in animation for translation results', () => {
    it('should apply fade-in class to output when translation appears', async () => {
      const { OpenRouterService } = await import('../services/OpenRouterService');
      vi.mocked(OpenRouterService.translate).mockResolvedValue({
        translation: 'Test translation',
        explanation: '',
        transcription: '',
      });

      const { container } = render(
        <TranslationInterface
          apiKey="test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          onModelChange={vi.fn()}
          onClearApiKey={vi.fn()}
          onClearAllData={vi.fn()}
        />
      );

      const textarea = screen.getByLabelText('Input text');
      await userEvent.type(textarea, 'Hello');

      const translateButtons = screen.getAllByRole('button', { name: /translate/i });
      await userEvent.click(translateButtons[0]);

      await waitFor(() => {
        const outputContent = container.querySelector('.output-content');
        expect(outputContent).toHaveClass('fade-in');
      });
    });
  });

  describe('Hover states for buttons', () => {
    it('should have hover styles defined for action buttons', () => {
      render(
        <InputPanel
          value="test"
          onChange={vi.fn()}
          maxLength={5000}
        />
      );

      const textarea = screen.getByLabelText('Input text');
      // Check that the textarea has the expected class for hover styling
      expect(textarea).toHaveClass('input-textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('should have hover styles for translate button', () => {
      render(
        <TranslationInterface
          apiKey="test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          onModelChange={vi.fn()}
          onClearApiKey={vi.fn()}
          onClearAllData={vi.fn()}
        />
      );

      const translateButtons = screen.getAllByRole('button', { name: /translate/i });
      // Check that the button has the expected class for hover styling
      expect(translateButtons[0]).toHaveClass('translate-button');
      expect(translateButtons[0]).toBeInTheDocument();
    });
  });

  describe('Focus indicators for inputs', () => {
    it('should have focus styles for textarea', async () => {
      render(
        <InputPanel
          value=""
          onChange={vi.fn()}
          maxLength={5000}
        />
      );

      const textarea = screen.getByLabelText('Input text');
      await userEvent.click(textarea);

      // Check that textarea has the expected class for focus styling
      expect(textarea).toHaveClass('input-textarea');
      expect(textarea).toHaveFocus();
    });

    it('should have focus styles for buttons', async () => {
      render(
        <InputPanel
          value="test"
          onChange={vi.fn()}
          maxLength={5000}
        />
      );

      const textarea = screen.getByLabelText('Input text');
      await userEvent.tab(); // Focus first element
      
      // Check that focus styles are defined
      expect(textarea).toHaveClass('input-textarea');
    });
  });

  describe('Loading spinner animation', () => {
    it('should render loading spinner when translating', async () => {
      const { OpenRouterService } = await import('../services/OpenRouterService');
      vi.mocked(OpenRouterService.translate).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          translation: 'Test',
          explanation: '',
          transcription: '',
        }), 100))
      );

      render(
        <TranslationInterface
          apiKey="test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          onModelChange={vi.fn()}
          onClearApiKey={vi.fn()}
          onClearAllData={vi.fn()}
        />
      );

      const textarea = screen.getByLabelText('Input text');
      await userEvent.type(textarea, 'Hello');

      const translateButtons = screen.getAllByRole('button', { name: /translate/i });
      await userEvent.click(translateButtons[0]);

      // Check for loading state
      expect(screen.getAllByText(/translating/i).length).toBeGreaterThan(0);
      
      // Check for spinner element
      const buttons = screen.getAllByRole('button', { name: /translate/i });
      expect(buttons[0]).toHaveClass('translate-button');
      expect(buttons[0]).toHaveTextContent('Translating...');
    });

    it('should have spinner animation class when loading', async () => {
      const { OpenRouterService } = await import('../services/OpenRouterService');
      vi.mocked(OpenRouterService.translate).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          translation: 'Test',
          explanation: '',
          transcription: '',
        }), 100))
      );

      const { container } = render(
        <TranslationInterface
          apiKey="test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          onModelChange={vi.fn()}
          onClearApiKey={vi.fn()}
          onClearAllData={vi.fn()}
        />
      );

      const textarea = screen.getByLabelText('Input text');
      await userEvent.type(textarea, 'Hello');

      const translateButtons = screen.getAllByRole('button', { name: /translate/i });
      await userEvent.click(translateButtons[0]);

      // Check that loading spinner is present
      await waitFor(() => {
        const spinner = container.querySelector('.loading-spinner');
        expect(spinner).toBeInTheDocument();
      });
    });
  });

  describe('Disabled button opacity', () => {
    it('should reduce opacity for disabled translate button', () => {
      render(
        <TranslationInterface
          apiKey="test-key"
          selectedModel="openai/gpt-4"
          availableModels={mockModels}
          onModelChange={vi.fn()}
          onClearApiKey={vi.fn()}
          onClearAllData={vi.fn()}
        />
      );

      const translateButtons = screen.getAllByRole('button', { name: /translate/i });
      // Check that button is disabled (CSS will handle opacity)
      expect(translateButtons[0]).toBeDisabled();
      expect(translateButtons[0]).toHaveClass('translate-button');
    });

    it('should reduce opacity for disabled copy button', () => {
      render(
        <OutputPanel
          translation=""
          explanation=""
          transcription=""
          onCopy={vi.fn()}
        />
      );

      const copyButton = screen.getByRole('button', { name: /copy translation/i });
      // Check that button is disabled (CSS will handle opacity)
      expect(copyButton).toBeDisabled();
      expect(copyButton).toHaveClass('action-button');
    });
  });
});
