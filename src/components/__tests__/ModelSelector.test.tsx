import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelSelector } from '../ModelSelector';
import type { Model } from '../../types';

describe('ModelSelector', () => {
  const mockOnChange = vi.fn();

  const mockModels: Model[] = [
    {
      id: 'openai/gpt-4',
      name: 'GPT-4',
      description: 'Most capable model',
      contextLength: 8192,
    },
    {
      id: 'openai/gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient',
      contextLength: 4096,
    },
    {
      id: 'anthropic/claude-3-opus',
      name: 'Claude 3 Opus',
      description: 'Anthropic most capable model',
      contextLength: 200000,
    },
  ];

  const defaultProps = {
    selectedModel: 'openai/gpt-4',
    models: mockModels,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering with model list', () => {
    it('should render search input', () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model');
      expect(input).toBeInTheDocument();
    });

    it('should show selected model name as placeholder', () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByPlaceholderText('GPT-4');
      expect(input).toBeInTheDocument();
    });

    it('should render label for input', () => {
      render(<ModelSelector {...defaultProps} />);

      expect(screen.getByText('Model')).toBeInTheDocument();
    });

    it('should show dropdown when input is focused', () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model');
      fireEvent.focus(input);

      mockModels.forEach((model) => {
        expect(screen.getByText(model.name)).toBeInTheDocument();
      });
    });

    it('should render model descriptions in dropdown', () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model');
      fireEvent.focus(input);

      mockModels.forEach((model) => {
        if (model.description) {
          expect(screen.getByText(model.description)).toBeInTheDocument();
        }
      });
    });
  });

  describe('Search functionality', () => {
    it('should filter models by name', () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'GPT-4' } });

      expect(screen.getByText('GPT-4')).toBeInTheDocument();
      expect(screen.queryByText('Claude 3 Opus')).not.toBeInTheDocument();
    });

    it('should filter models by id', () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'anthropic' } });

      expect(screen.getByText('Claude 3 Opus')).toBeInTheDocument();
      expect(screen.queryByText('GPT-4')).not.toBeInTheDocument();
    });

    it('should filter models by description', () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'efficient' } });

      expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
      expect(screen.queryByText('GPT-4')).not.toBeInTheDocument();
    });

    it('should show no results message when no models match', () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'nonexistent' } });

      expect(screen.getByText(/No models found matching "nonexistent"/)).toBeInTheDocument();
    });

    it('should be case insensitive', () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'gpt-4' } });

      expect(screen.getByText('GPT-4')).toBeInTheDocument();
    });
  });

  describe('Model selection', () => {
    it('should call onChange when model is clicked', async () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model');
      fireEvent.focus(input);

      const modelOption = screen.getByText('GPT-3.5 Turbo');
      fireEvent.click(modelOption);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('openai/gpt-3.5-turbo');
      });
    });

    it('should close dropdown after selection', async () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model');
      fireEvent.focus(input);

      const modelOption = screen.getByText('Claude 3 Opus');
      fireEvent.click(modelOption);

      await waitFor(() => {
        expect(screen.queryByText('Most capable model')).not.toBeInTheDocument();
      });
    });

    it('should clear search query after selection', async () => {
      render(<ModelSelector {...defaultProps} />);

      const input = screen.getByLabelText('AI Model') as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'claude' } });

      const modelOption = screen.getByText('Claude 3 Opus');
      fireEvent.click(modelOption);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Selected model display', () => {
    it('should highlight selected model in dropdown', () => {
      render(<ModelSelector {...defaultProps} selectedModel="openai/gpt-4" />);

      const input = screen.getByLabelText('AI Model');
      fireEvent.focus(input);

      const selectedItem = screen.getByText('GPT-4').closest('.model-dropdown-item');
      expect(selectedItem).toHaveClass('selected');
    });

    it('should update placeholder when selectedModel changes', () => {
      const { rerender } = render(
        <ModelSelector {...defaultProps} selectedModel="openai/gpt-4" />
      );

      expect(screen.getByPlaceholderText('GPT-4')).toBeInTheDocument();

      rerender(
        <ModelSelector {...defaultProps} selectedModel="anthropic/claude-3-opus" />
      );

      expect(screen.getByPlaceholderText('Claude 3 Opus')).toBeInTheDocument();
    });
  });
});
