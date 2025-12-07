import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApiKeyGate } from '../ApiKeyGate.tsx';
import { OpenRouterService } from '../../services/OpenRouterService';

// Mock the OpenRouterService
vi.mock('../../services/OpenRouterService', () => ({
  OpenRouterService: {
    validateApiKey: vi.fn(),
  },
}));

describe('ApiKeyGate', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form elements', () => {
      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/Clanker Translate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
    });

    it('should render input field with correct attributes', () => {
      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i);
      expect(input).toHaveAttribute('type', 'password');
      expect(input).toHaveAttribute('placeholder');
    });

    it('should render submit button', () => {
      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const button = screen.getByRole('button', { name: /Submit/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Input Handling', () => {
    it('should update input value when user types', () => {
      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test-key-123' } });

      expect(input.value).toBe('test-key-123');
    });

    it('should handle empty input', () => {
      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '' } });

      expect(input.value).toBe('');
    });

    it('should handle special characters in input', () => {
      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i) as HTMLInputElement;
      const specialKey = 'sk-test_!@#$%^&*()';
      fireEvent.change(input, { target: { value: specialKey } });

      expect(input.value).toBe(specialKey);
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with API key when validation succeeds', async () => {
      vi.mocked(OpenRouterService.validateApiKey).mockResolvedValue(true);

      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i);
      const button = screen.getByRole('button', { name: /Submit/i });

      fireEvent.change(input, { target: { value: 'valid-key' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(OpenRouterService.validateApiKey).toHaveBeenCalledWith('valid-key');
        expect(mockOnSubmit).toHaveBeenCalledWith('valid-key');
      });
    });

    it('should not submit when input is empty', async () => {
      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const button = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(OpenRouterService.validateApiKey).not.toHaveBeenCalled();
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should handle form submission via Enter key', async () => {
      vi.mocked(OpenRouterService.validateApiKey).mockResolvedValue(true);

      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i);
      fireEvent.change(input, { target: { value: 'valid-key' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(OpenRouterService.validateApiKey).toHaveBeenCalledWith('valid-key');
        expect(mockOnSubmit).toHaveBeenCalledWith('valid-key');
      });
    });
  });

  describe('Validation Error Display', () => {
    it('should display error when API key validation fails', async () => {
      vi.mocked(OpenRouterService.validateApiKey).mockResolvedValue(false);

      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i);
      const button = screen.getByRole('button', { name: /Submit/i });

      fireEvent.change(input, { target: { value: 'invalid-key' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Invalid API key/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should display error when network error occurs', async () => {
      vi.mocked(OpenRouterService.validateApiKey).mockRejectedValue(
        new Error('Network error')
      );

      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i);
      const button = screen.getByRole('button', { name: /Submit/i });

      fireEvent.change(input, { target: { value: 'test-key' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should clear error when user starts typing again', async () => {
      vi.mocked(OpenRouterService.validateApiKey).mockResolvedValue(false);

      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i);
      const button = screen.getByRole('button', { name: /Submit/i });

      // Trigger error
      fireEvent.change(input, { target: { value: 'invalid-key' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Invalid API key/i)).toBeInTheDocument();
      });

      // Start typing again
      fireEvent.change(input, { target: { value: 'new-key' } });

      expect(screen.queryByText(/Invalid API key/i)).not.toBeInTheDocument();
    });
  });

  describe('Loading State Display', () => {
    it('should display loading state during validation', async () => {
      vi.mocked(OpenRouterService.validateApiKey).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      );

      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i);
      const button = screen.getByRole('button', { name: /Submit/i });

      fireEvent.change(input, { target: { value: 'test-key' } });
      fireEvent.click(button);

      // Check loading state
      expect(screen.getByText(/Validating/i)).toBeInTheDocument();
      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should disable submit button during validation', async () => {
      vi.mocked(OpenRouterService.validateApiKey).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      );

      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i);
      const button = screen.getByRole('button', { name: /Submit/i });

      fireEvent.change(input, { target: { value: 'test-key' } });
      fireEvent.click(button);

      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should disable input field during validation', async () => {
      vi.mocked(OpenRouterService.validateApiKey).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      );

      render(<ApiKeyGate onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/API Key/i);
      const button = screen.getByRole('button', { name: /Submit/i });

      fireEvent.change(input, { target: { value: 'test-key' } });
      fireEvent.click(button);

      expect(input).toBeDisabled();

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });
});
