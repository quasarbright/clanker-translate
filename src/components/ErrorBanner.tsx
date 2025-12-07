import React from 'react';
import type { OpenRouterError } from '../types';
import './ErrorBanner.css';

interface ErrorBannerProps {
  error: string | OpenRouterError | null;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss }) => {
  if (!error) {
    return null;
  }

  const getMessage = (): string => {
    if (typeof error === 'string') {
      return error;
    }

    // Handle OpenRouterError with user-friendly messages
    switch (error.type) {
      case 'auth':
        return 'Authentication failed. Please check your API key and try again.';
      case 'rate_limit':
        return 'Rate limit exceeded. Please wait a moment and try again.';
      case 'network':
        return 'Network error. Please check your internet connection and try again.';
      case 'invalid_response':
        return 'Received an unexpected response from the server. Please try again.';
      case 'unknown':
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="error-banner" role="alert" data-testid="error-banner">
      <div className="error-content">
        <span className="error-message">{getMessage()}</span>
        {onDismiss && (
          <button
            className="error-dismiss"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
