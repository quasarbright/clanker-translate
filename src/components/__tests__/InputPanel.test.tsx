import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InputPanel } from '../InputPanel';

describe('InputPanel', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    maxLength: 5000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Textarea rendering and input', () => {
    it('should render textarea', () => {
      render(<InputPanel {...defaultProps} />);

      const textarea = screen.getByLabelText('Input text');
      expect(textarea).toBeInTheDocument();
    });

    it('should display the current value in textarea', () => {
      render(<InputPanel {...defaultProps} value="Hello world" />);

      const textarea = screen.getByLabelText('Input text') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Hello world');
    });

    it('should call onChange when user types in textarea', () => {
      render(<InputPanel {...defaultProps} />);

      const textarea = screen.getByLabelText('Input text');
      fireEvent.change(textarea, { target: { value: 'New text' } });

      expect(mockOnChange).toHaveBeenCalledWith('New text');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with empty string when textarea is cleared', () => {
      render(<InputPanel {...defaultProps} value="Some text" />);

      const textarea = screen.getByLabelText('Input text');
      fireEvent.change(textarea, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should handle multiple typing events', () => {
      render(<InputPanel {...defaultProps} />);

      const textarea = screen.getByLabelText('Input text');
      fireEvent.change(textarea, { target: { value: 'H' } });
      fireEvent.change(textarea, { target: { value: 'He' } });
      fireEvent.change(textarea, { target: { value: 'Hel' } });

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenLastCalledWith('Hel');
    });

    it('should have placeholder text', () => {
      render(<InputPanel {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Enter text to translate...');
      expect(textarea).toBeInTheDocument();
    });

    it('should have maxLength attribute', () => {
      render(<InputPanel {...defaultProps} maxLength={1000} />);

      const textarea = screen.getByLabelText('Input text') as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(1000);
    });

    it('should render input label', () => {
      render(<InputPanel {...defaultProps} />);

      expect(screen.getByText('Input')).toBeInTheDocument();
    });
  });

  describe('Character counter accuracy', () => {
    it('should display character count of 0 for empty input', () => {
      render(<InputPanel {...defaultProps} value="" maxLength={5000} />);

      expect(screen.getByText('0 / 5000')).toBeInTheDocument();
    });

    it('should display correct character count for non-empty input', () => {
      render(<InputPanel {...defaultProps} value="Hello" maxLength={5000} />);

      expect(screen.getByText('5 / 5000')).toBeInTheDocument();
    });

    it('should display correct character count for longer text', () => {
      const longText = 'a'.repeat(250);
      render(<InputPanel {...defaultProps} value={longText} maxLength={5000} />);

      expect(screen.getByText('250 / 5000')).toBeInTheDocument();
    });

    it('should display correct character count with spaces', () => {
      render(<InputPanel {...defaultProps} value="Hello world" maxLength={5000} />);

      expect(screen.getByText('11 / 5000')).toBeInTheDocument();
    });

    it('should display correct character count with special characters', () => {
      const text = "Hello! 你好 🌍";
      render(<InputPanel {...defaultProps} value={text} maxLength={5000} />);

      expect(screen.getByText(`${text.length} / 5000`)).toBeInTheDocument();
    });

    it('should display correct character count with newlines', () => {
      const text = "Line 1\nLine 2\nLine 3";
      render(<InputPanel {...defaultProps} value={text} maxLength={5000} />);

      expect(screen.getByText(`${text.length} / 5000`)).toBeInTheDocument();
    });

    it('should update character count when value changes', async () => {
      const { rerender } = render(
        <InputPanel {...defaultProps} value="Hello" maxLength={5000} />
      );

      await waitFor(() => {
        expect(screen.getByText('5 / 5000')).toBeInTheDocument();
      });

      rerender(<InputPanel {...defaultProps} value="Hello world!" maxLength={5000} />);

      await waitFor(() => {
        expect(screen.getByText('12 / 5000')).toBeInTheDocument();
      });
    });

    it('should display correct max length', () => {
      render(<InputPanel {...defaultProps} value="Test" maxLength={1000} />);

      expect(screen.getByText('4 / 1000')).toBeInTheDocument();
    });
  });

  describe('Controlled component behavior', () => {
    it('should reflect prop changes in textarea', () => {
      const { rerender } = render(
        <InputPanel {...defaultProps} value="Initial" />
      );

      let textarea = screen.getByLabelText('Input text') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial');

      rerender(<InputPanel {...defaultProps} value="Updated" />);

      textarea = screen.getByLabelText('Input text') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Updated');
    });

    it('should update character count when value prop changes', async () => {
      const { rerender } = render(
        <InputPanel {...defaultProps} value="Short" maxLength={5000} />
      );

      await waitFor(() => {
        expect(screen.getByText('5 / 5000')).toBeInTheDocument();
      });

      rerender(
        <InputPanel {...defaultProps} value="Much longer text" maxLength={5000} />
      );

      await waitFor(() => {
        expect(screen.getByText('16 / 5000')).toBeInTheDocument();
      });
    });
  });

});
