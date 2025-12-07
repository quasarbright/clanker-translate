import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelector } from '../LanguageSelector';
import { LANGUAGES } from '../../constants/languages';

describe('LanguageSelector', () => {
  const mockOnFromChange = vi.fn();
  const mockOnToChange = vi.fn();
  const mockOnSwap = vi.fn();

  const defaultProps = {
    fromLanguage: 'en',
    toLanguage: 'ja',
    onFromChange: mockOnFromChange,
    onToChange: mockOnToChange,
    onSwap: mockOnSwap,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering of dropdowns', () => {
    it('should render source language dropdown', () => {
      render(<LanguageSelector {...defaultProps} />);

      const fromDropdown = screen.getByLabelText('Source language');
      expect(fromDropdown).toBeInTheDocument();
      expect(fromDropdown).toHaveValue('en');
    });

    it('should render target language dropdown', () => {
      render(<LanguageSelector {...defaultProps} />);

      const toDropdown = screen.getByLabelText('Target language');
      expect(toDropdown).toBeInTheDocument();
      expect(toDropdown).toHaveValue('ja');
    });

    it('should render all languages in source dropdown', () => {
      render(<LanguageSelector {...defaultProps} />);

      const fromDropdown = screen.getByLabelText('Source language');
      const options = Array.from(fromDropdown.querySelectorAll('option'));

      expect(options).toHaveLength(LANGUAGES.length);
      LANGUAGES.forEach((lang, index) => {
        expect(options[index]).toHaveValue(lang.code);
        expect(options[index]).toHaveTextContent(lang.name);
      });
    });

    it('should render all languages except "auto" in target dropdown', () => {
      render(<LanguageSelector {...defaultProps} />);

      const toDropdown = screen.getByLabelText('Target language');
      const options = Array.from(toDropdown.querySelectorAll('option'));

      const expectedLanguages = LANGUAGES.filter((lang) => lang.code !== 'auto');
      expect(options).toHaveLength(expectedLanguages.length);
      expectedLanguages.forEach((lang, index) => {
        expect(options[index]).toHaveValue(lang.code);
        expect(options[index]).toHaveTextContent(lang.name);
      });
    });

    it('should render swap button', () => {
      render(<LanguageSelector {...defaultProps} />);

      const swapButton = screen.getByLabelText('Swap languages');
      expect(swapButton).toBeInTheDocument();
      expect(swapButton).toHaveTextContent('⇄');
    });

    it('should render dropdowns without labels', () => {
      render(<LanguageSelector {...defaultProps} />);

      // Labels should not be present in the new design
      expect(screen.queryByText('From')).not.toBeInTheDocument();
      expect(screen.queryByText('To')).not.toBeInTheDocument();
    });
  });

  describe('Language selection changes', () => {
    it('should call onFromChange when source language is changed', () => {
      render(<LanguageSelector {...defaultProps} />);

      const fromDropdown = screen.getByLabelText('Source language');
      fireEvent.change(fromDropdown, { target: { value: 'es' } });

      expect(mockOnFromChange).toHaveBeenCalledWith('es');
      expect(mockOnFromChange).toHaveBeenCalledTimes(1);
    });

    it('should call onToChange when target language is changed', () => {
      render(<LanguageSelector {...defaultProps} />);

      const toDropdown = screen.getByLabelText('Target language');
      fireEvent.change(toDropdown, { target: { value: 'fr' } });

      expect(mockOnToChange).toHaveBeenCalledWith('fr');
      expect(mockOnToChange).toHaveBeenCalledTimes(1);
    });

    it('should handle changing source language to "auto"', () => {
      render(<LanguageSelector {...defaultProps} />);

      const fromDropdown = screen.getByLabelText('Source language');
      fireEvent.change(fromDropdown, { target: { value: 'auto' } });

      expect(mockOnFromChange).toHaveBeenCalledWith('auto');
    });

    it('should handle multiple language changes', () => {
      render(<LanguageSelector {...defaultProps} />);

      const fromDropdown = screen.getByLabelText('Source language');
      const toDropdown = screen.getByLabelText('Target language');

      fireEvent.change(fromDropdown, { target: { value: 'es' } });
      fireEvent.change(toDropdown, { target: { value: 'de' } });
      fireEvent.change(fromDropdown, { target: { value: 'fr' } });

      expect(mockOnFromChange).toHaveBeenCalledTimes(2);
      expect(mockOnToChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Swap button click', () => {
    it('should call onSwap when swap button is clicked', () => {
      render(<LanguageSelector {...defaultProps} />);

      const swapButton = screen.getByLabelText('Swap languages');
      fireEvent.click(swapButton);

      expect(mockOnSwap).toHaveBeenCalledTimes(1);
    });

    it('should call onSwap multiple times when clicked multiple times', () => {
      render(<LanguageSelector {...defaultProps} />);

      const swapButton = screen.getByLabelText('Swap languages');
      fireEvent.click(swapButton);
      fireEvent.click(swapButton);
      fireEvent.click(swapButton);

      expect(mockOnSwap).toHaveBeenCalledTimes(3);
    });

    it('should not call other handlers when swap is clicked', () => {
      render(<LanguageSelector {...defaultProps} />);

      const swapButton = screen.getByLabelText('Swap languages');
      fireEvent.click(swapButton);

      expect(mockOnSwap).toHaveBeenCalledTimes(1);
      expect(mockOnFromChange).not.toHaveBeenCalled();
      expect(mockOnToChange).not.toHaveBeenCalled();
    });
  });

  describe('Swap button disabled when source is "auto"', () => {
    it('should disable swap button when fromLanguage is "auto"', () => {
      render(<LanguageSelector {...defaultProps} fromLanguage="auto" />);

      const swapButton = screen.getByLabelText('Swap languages');
      expect(swapButton).toBeDisabled();
    });

    it('should enable swap button when fromLanguage is not "auto"', () => {
      render(<LanguageSelector {...defaultProps} fromLanguage="en" />);

      const swapButton = screen.getByLabelText('Swap languages');
      expect(swapButton).not.toBeDisabled();
    });

    it('should not call onSwap when disabled button is clicked', () => {
      render(<LanguageSelector {...defaultProps} fromLanguage="auto" />);

      const swapButton = screen.getByLabelText('Swap languages');
      fireEvent.click(swapButton);

      expect(mockOnSwap).not.toHaveBeenCalled();
    });

    it('should enable swap button after changing from "auto" to another language', () => {
      const { rerender } = render(
        <LanguageSelector {...defaultProps} fromLanguage="auto" />
      );

      let swapButton = screen.getByLabelText('Swap languages');
      expect(swapButton).toBeDisabled();

      rerender(<LanguageSelector {...defaultProps} fromLanguage="en" />);

      swapButton = screen.getByLabelText('Swap languages');
      expect(swapButton).not.toBeDisabled();
    });

    it('should disable swap button after changing to "auto"', () => {
      const { rerender } = render(
        <LanguageSelector {...defaultProps} fromLanguage="en" />
      );

      let swapButton = screen.getByLabelText('Swap languages');
      expect(swapButton).not.toBeDisabled();

      rerender(<LanguageSelector {...defaultProps} fromLanguage="auto" />);

      swapButton = screen.getByLabelText('Swap languages');
      expect(swapButton).toBeDisabled();
    });
  });

  describe('Controlled component behavior', () => {
    it('should reflect prop changes in source dropdown', () => {
      const { rerender } = render(
        <LanguageSelector {...defaultProps} fromLanguage="en" />
      );

      let fromDropdown = screen.getByLabelText(
        'Source language'
      ) as HTMLSelectElement;
      expect(fromDropdown.value).toBe('en');

      rerender(<LanguageSelector {...defaultProps} fromLanguage="es" />);

      fromDropdown = screen.getByLabelText('Source language') as HTMLSelectElement;
      expect(fromDropdown.value).toBe('es');
    });

    it('should reflect prop changes in target dropdown', () => {
      const { rerender } = render(
        <LanguageSelector {...defaultProps} toLanguage="ja" />
      );

      let toDropdown = screen.getByLabelText(
        'Target language'
      ) as HTMLSelectElement;
      expect(toDropdown.value).toBe('ja');

      rerender(<LanguageSelector {...defaultProps} toLanguage="fr" />);

      toDropdown = screen.getByLabelText('Target language') as HTMLSelectElement;
      expect(toDropdown.value).toBe('fr');
    });
  });
});
