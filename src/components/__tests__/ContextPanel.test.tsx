import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextPanel } from '../ContextPanel';

describe('ContextPanel', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Textarea rendering and input', () => {
    it('should render textarea', () => {
      render(<ContextPanel {...defaultProps} />);

      const textarea = screen.getByLabelText('Context input');
      expect(textarea).toBeInTheDocument();
    });

    it('should display the current value in textarea', () => {
      render(<ContextPanel {...defaultProps} value="Formal business context" />);

      const textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Formal business context');
    });

    it('should call onChange when user types in textarea', () => {
      render(<ContextPanel {...defaultProps} />);

      const textarea = screen.getByLabelText('Context input');
      fireEvent.change(textarea, { target: { value: 'Casual conversation' } });

      expect(mockOnChange).toHaveBeenCalledWith('Casual conversation');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with empty string when textarea is cleared', () => {
      render(<ContextPanel {...defaultProps} value="Some context" />);

      const textarea = screen.getByLabelText('Context input');
      fireEvent.change(textarea, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should handle multiple typing events', () => {
      render(<ContextPanel {...defaultProps} />);

      const textarea = screen.getByLabelText('Context input');
      fireEvent.change(textarea, { target: { value: 'F' } });
      fireEvent.change(textarea, { target: { value: 'Fo' } });
      fireEvent.change(textarea, { target: { value: 'For' } });

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenLastCalledWith('For');
    });

    it('should have placeholder text', () => {
      render(<ContextPanel {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(
        'Optional: Add context (e.g., formal, casual, business, etc.)'
      );
      expect(textarea).toBeInTheDocument();
    });

    it('should render context label', () => {
      render(<ContextPanel {...defaultProps} />);

      expect(screen.getByText('Context (Optional)')).toBeInTheDocument();
    });
  });

  describe('Controlled component behavior', () => {
    it('should reflect prop changes in textarea', () => {
      const { rerender } = render(
        <ContextPanel {...defaultProps} value="Initial context" />
      );

      let textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial context');

      rerender(<ContextPanel {...defaultProps} value="Updated context" />);

      textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Updated context');
    });

    it('should handle empty to non-empty value changes', () => {
      const { rerender } = render(<ContextPanel {...defaultProps} value="" />);

      let textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');

      rerender(<ContextPanel {...defaultProps} value="New context" />);

      textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('New context');
    });

    it('should handle non-empty to empty value changes', () => {
      const { rerender } = render(
        <ContextPanel {...defaultProps} value="Some context" />
      );

      let textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Some context');

      rerender(<ContextPanel {...defaultProps} value="" />);

      textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should handle multiple value updates', () => {
      const { rerender } = render(<ContextPanel {...defaultProps} value="First" />);

      let textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('First');

      rerender(<ContextPanel {...defaultProps} value="Second" />);
      textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Second');

      rerender(<ContextPanel {...defaultProps} value="Third" />);
      textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Third');
    });
  });

  describe('Text content handling', () => {
    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      render(<ContextPanel {...defaultProps} value={multilineText} />);

      const textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe(multilineText);
    });

    it('should handle special characters', () => {
      const specialText = 'Context with special chars: @#$%^&*()';
      render(<ContextPanel {...defaultProps} value={specialText} />);

      const textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialText);
    });

    it('should handle unicode characters', () => {
      const unicodeText = 'Context: 日本語 中文 한국어 🌍';
      render(<ContextPanel {...defaultProps} value={unicodeText} />);

      const textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe(unicodeText);
    });

    it('should handle long text', () => {
      const longText = 'a'.repeat(500);
      render(<ContextPanel {...defaultProps} value={longText} />);

      const textarea = screen.getByLabelText('Context input') as HTMLTextAreaElement;
      expect(textarea.value).toBe(longText);
    });
  });
});
