import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from '../SettingsPanel';
import type { Model } from '../../types';

describe('SettingsPanel', () => {
  const mockOnModelChange = vi.fn();
  const mockOnClearApiKey = vi.fn();

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
  ];

  const mockOnClearAllData = vi.fn();

  const defaultProps = {
    selectedModel: 'openai/gpt-4',
    availableModels: mockModels,
    onModelChange: mockOnModelChange,
    onClearApiKey: mockOnClearApiKey,
    onClearAllData: mockOnClearAllData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Panel open/close toggle', () => {
    it('should render settings toggle button', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('Settings');
    });

    it('should not show settings content initially', () => {
      render(<SettingsPanel {...defaultProps} />);

      expect(screen.queryByLabelText('Clear API key')).not.toBeInTheDocument();
    });

    it('should show settings content when toggle button is clicked', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      fireEvent.click(toggleButton);

      expect(screen.getByLabelText('Clear API key')).toBeInTheDocument();
    });

    it('should hide settings content when toggle button is clicked again', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      
      // Open
      fireEvent.click(toggleButton);
      expect(screen.getByLabelText('Clear API key')).toBeInTheDocument();

      // Close
      fireEvent.click(toggleButton);
      expect(screen.queryByLabelText('Clear API key')).not.toBeInTheDocument();
    });

    it('should set aria-expanded to false initially', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should set aria-expanded to true when opened', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      fireEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Model selector integration', () => {
    it('should render ModelSelector when panel is open', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      fireEvent.click(toggleButton);

      expect(screen.getByLabelText('AI Model')).toBeInTheDocument();
    });

    it('should pass selectedModel to ModelSelector', () => {
      render(<SettingsPanel {...defaultProps} selectedModel="openai/gpt-4" />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      fireEvent.click(toggleButton);

      const modelInput = screen.getByPlaceholderText('GPT-4');
      expect(modelInput).toBeInTheDocument();
    });

    it('should pass availableModels to ModelSelector', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      fireEvent.click(toggleButton);

      const modelInput = screen.getByLabelText('AI Model');
      fireEvent.focus(modelInput);

      mockModels.forEach((model) => {
        expect(screen.getByText(model.name)).toBeInTheDocument();
      });
    });

    it('should call onModelChange when model is selected', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      fireEvent.click(toggleButton);

      const modelInput = screen.getByLabelText('AI Model');
      fireEvent.focus(modelInput);

      const modelOption = screen.getByText('GPT-3.5 Turbo');
      fireEvent.click(modelOption);

      expect(mockOnModelChange).toHaveBeenCalledWith('openai/gpt-3.5-turbo');
    });
  });

  describe('Clear API key button functionality', () => {
    it('should render clear API key button when panel is open', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      fireEvent.click(toggleButton);

      const clearButton = screen.getByRole('button', { name: /clear api key/i });
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveTextContent('Clear API Key');
    });

    it('should call onClearApiKey when clear button is clicked', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      fireEvent.click(toggleButton);

      const clearButton = screen.getByRole('button', { name: /clear api key/i });
      fireEvent.click(clearButton);

      expect(mockOnClearApiKey).toHaveBeenCalledTimes(1);
    });

    it('should not call onClearApiKey when panel is closed', () => {
      render(<SettingsPanel {...defaultProps} />);

      // Panel is closed, clear button should not be visible
      expect(screen.queryByLabelText('Clear API key')).not.toBeInTheDocument();
      expect(mockOnClearApiKey).not.toHaveBeenCalled();
    });
  });

  describe('Clear all data button functionality', () => {
    it('should render clear all data button when panel is open', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      fireEvent.click(toggleButton);

      const clearAllButton = screen.getByRole('button', { name: /clear all data/i });
      expect(clearAllButton).toBeInTheDocument();
      expect(clearAllButton).toHaveTextContent('Clear All Data');
    });

    it('should call onClearAllData when clear all data button is clicked', () => {
      render(<SettingsPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /toggle settings/i });
      fireEvent.click(toggleButton);

      const clearAllButton = screen.getByRole('button', { name: /clear all data/i });
      fireEvent.click(clearAllButton);

      expect(mockOnClearAllData).toHaveBeenCalledTimes(1);
    });

    it('should not call onClearAllData when panel is closed', () => {
      render(<SettingsPanel {...defaultProps} />);

      // Panel is closed, clear all button should not be visible
      expect(screen.queryByLabelText('Clear all data')).not.toBeInTheDocument();
      expect(mockOnClearAllData).not.toHaveBeenCalled();
    });
  });
});
