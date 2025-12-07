import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { ErrorBanner } from '../../components/ErrorBanner';
import type { OpenRouterError } from '../../types';

/**
 * Feature: ai-translator, Property 6: Error Message Display
 * Validates: Requirements 11.3, 11.4
 * 
 * For any API error response, the system should extract and display 
 * a user-friendly error message without exposing sensitive information.
 */
describe('Property 6: Error Message Display', () => {
  it('should display user-friendly messages for all error types without exposing sensitive information', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary error types and messages
        fc.constantFrom('auth', 'rate_limit', 'network', 'invalid_response', 'unknown'),
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.option(fc.integer({ min: 100, max: 599 }), { nil: undefined }),
        (errorType, originalMessage, statusCode) => {
          const error: OpenRouterError = {
            type: errorType as OpenRouterError['type'],
            message: originalMessage,
            statusCode,
          };

          const { container } = render(<ErrorBanner error={error} />);
          const errorBanner = container.querySelector('.error-banner');

          // Error banner should be displayed
          expect(errorBanner).not.toBeNull();

          const displayedMessage = errorBanner?.textContent || '';

          // The displayed message should not contain the original technical message
          // (unless it's an unknown error type where we show the message)
          if (errorType !== 'unknown') {
            expect(displayedMessage).not.toBe(originalMessage);
          }

          // The displayed message should be user-friendly and not expose sensitive info
          // Check that it doesn't contain common sensitive patterns
          expect(displayedMessage).not.toMatch(/Bearer\s+[A-Za-z0-9_-]+/); // API keys
          expect(displayedMessage).not.toMatch(/password/i);
          expect(displayedMessage).not.toMatch(/secret/i);
          expect(displayedMessage).not.toMatch(/token/i);
          expect(displayedMessage).not.toMatch(/credential/i);

          // The message should be non-empty
          expect(displayedMessage.trim().length).toBeGreaterThan(0);

          // The message should be reasonably short (user-friendly)
          expect(displayedMessage.length).toBeLessThan(200);

          // Verify specific error types have appropriate messages
          switch (errorType) {
            case 'auth':
              expect(displayedMessage).toMatch(/authentication|api key/i);
              break;
            case 'rate_limit':
              expect(displayedMessage).toMatch(/rate limit|wait/i);
              break;
            case 'network':
              expect(displayedMessage).toMatch(/network|connection/i);
              break;
            case 'invalid_response':
              expect(displayedMessage).toMatch(/unexpected|response|server/i);
              break;
            case 'unknown':
              // Unknown errors should show the message or a fallback
              expect(displayedMessage.length).toBeGreaterThan(0);
              break;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle string errors without exposing sensitive information', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        (errorMessage) => {
          const { container } = render(<ErrorBanner error={errorMessage} />);
          const errorBanner = container.querySelector('.error-banner');

          // Error banner should be displayed
          expect(errorBanner).not.toBeNull();

          const displayedMessage = errorBanner?.textContent || '';

          // The displayed message should match the input for string errors
          expect(displayedMessage).toBe(errorMessage);

          // The message should be non-empty
          expect(displayedMessage.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not display anything when error is null', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        (error) => {
          const { container } = render(<ErrorBanner error={error} />);
          const errorBanner = container.querySelector('.error-banner');

          // Error banner should not be displayed
          expect(errorBanner).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always provide a fallback message for unknown errors with empty messages', () => {
    fc.assert(
      fc.property(
        fc.option(fc.integer({ min: 100, max: 599 }), { nil: undefined }),
        (statusCode) => {
          const error: OpenRouterError = {
            type: 'unknown',
            message: '',
            statusCode,
          };

          const { container } = render(<ErrorBanner error={error} />);
          const errorBanner = container.querySelector('.error-banner');

          // Error banner should be displayed
          expect(errorBanner).not.toBeNull();

          const displayedMessage = errorBanner?.textContent || '';

          // Should have a fallback message
          expect(displayedMessage.trim().length).toBeGreaterThan(0);
          expect(displayedMessage).toMatch(/error|try again/i);
        }
      ),
      { numRuns: 100 }
    );
  });
});
