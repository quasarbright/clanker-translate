import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBanner } from '../ErrorBanner';
import type { OpenRouterError } from '../../types';

describe('ErrorBanner', () => {
  it('should not render when error is null', () => {
    const { container } = render(<ErrorBanner error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render string error message', () => {
    render(<ErrorBanner error="Test error message" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render auth error with user-friendly message', () => {
    const error: OpenRouterError = {
      type: 'auth',
      message: 'Invalid credentials',
      statusCode: 401
    };
    render(<ErrorBanner error={error} />);
    expect(screen.getByText('Authentication failed. Please check your API key and try again.')).toBeInTheDocument();
  });

  it('should render rate limit error with user-friendly message', () => {
    const error: OpenRouterError = {
      type: 'rate_limit',
      message: 'Too many requests',
      statusCode: 429
    };
    render(<ErrorBanner error={error} />);
    expect(screen.getByText('Rate limit exceeded. Please wait a moment and try again.')).toBeInTheDocument();
  });

  it('should render network error with user-friendly message', () => {
    const error: OpenRouterError = {
      type: 'network',
      message: 'Connection failed'
    };
    render(<ErrorBanner error={error} />);
    expect(screen.getByText('Network error. Please check your internet connection and try again.')).toBeInTheDocument();
  });

  it('should render invalid_response error with user-friendly message', () => {
    const error: OpenRouterError = {
      type: 'invalid_response',
      message: 'Malformed JSON'
    };
    render(<ErrorBanner error={error} />);
    expect(screen.getByText('Received an unexpected response from the server. Please try again.')).toBeInTheDocument();
  });

  it('should render unknown error with fallback message', () => {
    const error: OpenRouterError = {
      type: 'unknown',
      message: 'Something went wrong'
    };
    render(<ErrorBanner error={error} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render unknown error without message with default fallback', () => {
    const error: OpenRouterError = {
      type: 'unknown',
      message: ''
    };
    render(<ErrorBanner error={error} />);
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
  });

  it('should render dismiss button when onDismiss is provided', () => {
    const onDismiss = vi.fn();
    render(<ErrorBanner error="Test error" onDismiss={onDismiss} />);
    expect(screen.getByRole('button', { name: 'Dismiss error' })).toBeInTheDocument();
  });

  it('should not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorBanner error="Test error" />);
    expect(screen.queryByRole('button', { name: 'Dismiss error' })).not.toBeInTheDocument();
  });

  it('should call onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<ErrorBanner error="Test error" onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByRole('button', { name: 'Dismiss error' });
    await user.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA role for accessibility', () => {
    render(<ErrorBanner error="Test error" />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('role', 'alert');
  });
});
