import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OutputPanel } from '../OutputPanel';

describe('OutputPanel', () => {
  const mockOnCopy = vi.fn();

  const defaultProps = {
    translation: '',
    explanation: '',
    transcription: '',
    onCopy: mockOnCopy,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering with translation', () => {
    it('should render translation text when provided', () => {
      render(
        <OutputPanel {...defaultProps} translation="Hello world" />
      );

      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('should render long translation text', () => {
      const longTranslation = 'This is a very long translation that spans multiple lines and contains a lot of text to test the rendering capabilities of the output panel.';
      render(
        <OutputPanel {...defaultProps} translation={longTranslation} />
      );

      expect(screen.getByText(longTranslation)).toBeInTheDocument();
    });

    it('should render translation with special characters', () => {
      const translation = 'こんにちは世界 🌍';
      render(
        <OutputPanel {...defaultProps} translation={translation} />
      );

      expect(screen.getByText(translation)).toBeInTheDocument();
    });

    it('should render translation with newlines', () => {
      const translation = 'Line 1\nLine 2\nLine 3';
      render(
        <OutputPanel {...defaultProps} translation={translation} />
      );

      const translationElement = screen.getByText((_content, element) => {
        return element?.tagName === 'P' && element?.textContent === translation;
      });
      expect(translationElement).toBeInTheDocument();
    });

    it('should render output label', () => {
      render(<OutputPanel {...defaultProps} />);

      expect(screen.getByText('Output')).toBeInTheDocument();
    });
  });

  describe('Rendering without translation', () => {
    it('should render placeholder when translation is empty', () => {
      render(<OutputPanel {...defaultProps} translation="" />);

      expect(screen.getByText('Translation will appear here...')).toBeInTheDocument();
    });

    it('should not render translation text when empty', () => {
      render(<OutputPanel {...defaultProps} translation="" />);

      expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    });

    it('should render placeholder initially', () => {
      render(<OutputPanel {...defaultProps} />);

      const placeholder = screen.getByText('Translation will appear here...');
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('Copy button enabled/disabled states', () => {
    it('should disable copy button when translation is empty', () => {
      render(<OutputPanel {...defaultProps} translation="" />);

      const copyButton = screen.getByLabelText('Copy translation');
      expect(copyButton).toBeDisabled();
    });

    it('should enable copy button when translation is present', () => {
      render(
        <OutputPanel {...defaultProps} translation="Some translation" />
      );

      const copyButton = screen.getByLabelText('Copy translation');
      expect(copyButton).not.toBeDisabled();
    });

    it('should enable copy button for single character translation', () => {
      render(<OutputPanel {...defaultProps} translation="A" />);

      const copyButton = screen.getByLabelText('Copy translation');
      expect(copyButton).not.toBeDisabled();
    });

    it('should call onCopy when copy button is clicked and enabled', () => {
      render(
        <OutputPanel {...defaultProps} translation="Test translation" />
      );

      const copyButton = screen.getByLabelText('Copy translation');
      fireEvent.click(copyButton);

      expect(mockOnCopy).toHaveBeenCalledTimes(1);
    });

    it('should not call onCopy when copy button is disabled', () => {
      render(<OutputPanel {...defaultProps} translation="" />);

      const copyButton = screen.getByLabelText('Copy translation');
      fireEvent.click(copyButton);

      expect(mockOnCopy).not.toHaveBeenCalled();
    });

    it('should call onCopy multiple times when clicked multiple times', () => {
      render(
        <OutputPanel {...defaultProps} translation="Test translation" />
      );

      const copyButton = screen.getByLabelText('Copy translation');
      fireEvent.click(copyButton);
      fireEvent.click(copyButton);
      fireEvent.click(copyButton);

      expect(mockOnCopy).toHaveBeenCalledTimes(3);
    });

    it('should render copy button with correct text', () => {
      render(<OutputPanel {...defaultProps} />);

      const copyButton = screen.getByLabelText('Copy translation');
      expect(copyButton).toHaveTextContent('Copy');
    });
  });

  describe('Explanation display when present', () => {
    it('should render explanation when provided', () => {
      const explanation = 'This is an explanation of the translation choices.';
      render(
        <OutputPanel
          {...defaultProps}
          translation="Hello"
          explanation={explanation}
        />
      );

      expect(screen.getByText(explanation)).toBeInTheDocument();
    });

    it('should render explanation label when explanation is present', () => {
      render(
        <OutputPanel
          {...defaultProps}
          translation="Hello"
          explanation="Some explanation"
        />
      );

      expect(screen.getByText('Explanation:')).toBeInTheDocument();
    });

    it('should not render explanation when empty', () => {
      render(
        <OutputPanel {...defaultProps} translation="Hello" explanation="" />
      );

      expect(screen.queryByText('Explanation:')).not.toBeInTheDocument();
    });

    it('should render long explanation text', () => {
      const longExplanation = 'This is a very long explanation that provides detailed information about the translation choices, cultural nuances, and contextual considerations that were taken into account.';
      render(
        <OutputPanel
          {...defaultProps}
          translation="Hello"
          explanation={longExplanation}
        />
      );

      expect(screen.getByText(longExplanation)).toBeInTheDocument();
    });

    it('should render explanation with special characters', () => {
      const explanation = 'The word "こんにちは" is a polite greeting.';
      render(
        <OutputPanel
          {...defaultProps}
          translation="Hello"
          explanation={explanation}
        />
      );

      expect(screen.getByText(explanation)).toBeInTheDocument();
    });

    it('should render both translation and explanation', () => {
      const translation = 'Bonjour';
      const explanation = 'This is a formal greeting in French.';
      render(
        <OutputPanel
          {...defaultProps}
          translation={translation}
          explanation={explanation}
        />
      );

      expect(screen.getByText(translation)).toBeInTheDocument();
      expect(screen.getByText(explanation)).toBeInTheDocument();
    });
  });

  describe('Transcription display when present', () => {
    it('should render transcription when provided', () => {
      const transcription = 'konnichiwa';
      render(
        <OutputPanel
          {...defaultProps}
          translation="こんにちは"
          transcription={transcription}
        />
      );

      expect(screen.getByText(transcription)).toBeInTheDocument();
    });

    it('should render transcription label when transcription is present', () => {
      render(
        <OutputPanel
          {...defaultProps}
          translation="こんにちは"
          transcription="konnichiwa"
        />
      );

      expect(screen.getByText('Transcription:')).toBeInTheDocument();
    });

    it('should not render transcription when empty', () => {
      render(
        <OutputPanel
          {...defaultProps}
          translation="Hello"
          transcription=""
        />
      );

      expect(screen.queryByText('Transcription:')).not.toBeInTheDocument();
    });

    it('should render transcription with special characters', () => {
      const transcription = 'arigatō gozaimasu';
      render(
        <OutputPanel
          {...defaultProps}
          translation="ありがとうございます"
          transcription={transcription}
        />
      );

      expect(screen.getByText(transcription)).toBeInTheDocument();
    });

    it('should render both translation and transcription', () => {
      const translation = 'こんにちは';
      const transcription = 'konnichiwa';
      render(
        <OutputPanel
          {...defaultProps}
          translation={translation}
          transcription={transcription}
        />
      );

      expect(screen.getByText(translation)).toBeInTheDocument();
      expect(screen.getByText(transcription)).toBeInTheDocument();
    });

    it('should render transcription, translation, and explanation together', () => {
      const translation = 'こんにちは';
      const transcription = 'konnichiwa';
      const explanation = 'A common Japanese greeting.';
      render(
        <OutputPanel
          {...defaultProps}
          translation={translation}
          transcription={transcription}
          explanation={explanation}
        />
      );

      expect(screen.getByText(translation)).toBeInTheDocument();
      expect(screen.getByText(transcription)).toBeInTheDocument();
      expect(screen.getByText(explanation)).toBeInTheDocument();
    });
  });

  describe('Controlled component behavior', () => {
    it('should update translation when prop changes', () => {
      const { rerender } = render(
        <OutputPanel {...defaultProps} translation="Initial" />
      );

      expect(screen.getByText('Initial')).toBeInTheDocument();

      rerender(<OutputPanel {...defaultProps} translation="Updated" />);

      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(screen.queryByText('Initial')).not.toBeInTheDocument();
    });

    it('should update copy button state when translation changes', () => {
      const { rerender } = render(
        <OutputPanel {...defaultProps} translation="" />
      );

      let copyButton = screen.getByLabelText('Copy translation');
      expect(copyButton).toBeDisabled();

      rerender(<OutputPanel {...defaultProps} translation="Now has text" />);

      copyButton = screen.getByLabelText('Copy translation');
      expect(copyButton).not.toBeDisabled();
    });

    it('should show placeholder when translation is removed', () => {
      const { rerender } = render(
        <OutputPanel {...defaultProps} translation="Some text" />
      );

      expect(screen.queryByText('Translation will appear here...')).not.toBeInTheDocument();

      rerender(<OutputPanel {...defaultProps} translation="" />);

      expect(screen.getByText('Translation will appear here...')).toBeInTheDocument();
    });

    it('should add explanation when prop changes from empty to filled', () => {
      const { rerender } = render(
        <OutputPanel {...defaultProps} translation="Hello" explanation="" />
      );

      expect(screen.queryByText('Explanation:')).not.toBeInTheDocument();

      rerender(
        <OutputPanel
          {...defaultProps}
          translation="Hello"
          explanation="New explanation"
        />
      );

      expect(screen.getByText('Explanation:')).toBeInTheDocument();
      expect(screen.getByText('New explanation')).toBeInTheDocument();
    });

    it('should add transcription when prop changes from empty to filled', () => {
      const { rerender } = render(
        <OutputPanel {...defaultProps} translation="こんにちは" transcription="" />
      );

      expect(screen.queryByText('Transcription:')).not.toBeInTheDocument();

      rerender(
        <OutputPanel
          {...defaultProps}
          translation="こんにちは"
          transcription="konnichiwa"
        />
      );

      expect(screen.getByText('Transcription:')).toBeInTheDocument();
      expect(screen.getByText('konnichiwa')).toBeInTheDocument();
    });
  });
});
