import { useState, type FormEvent, type ChangeEvent } from 'react';
import { OpenRouterService } from '../services/OpenRouterService';
import './ApiKeyGate.css';

interface ApiKeyGateProps {
  onSubmit: (key: string) => void;
}

export function ApiKeyGate({ onSubmit }: ApiKeyGateProps) {
  const [inputKey, setInputKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputKey(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Don't submit if input is empty
    if (!inputKey.trim()) {
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const isValid = await OpenRouterService.validateApiKey(inputKey);

      if (isValid) {
        onSubmit(inputKey);
      } else {
        setError('Invalid API key. Please check your key and try again.');
      }
    } catch (err) {
      setError('An error occurred while validating your API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="api-key-gate">
      <div className="api-key-gate-container">
        <h1 className="api-key-gate-title">Clanker Translate</h1>
        <p className="api-key-gate-description">
          Enter your OpenRouter API key to get started
        </p>

        <form onSubmit={handleSubmit} className="api-key-form">
          <div className="form-group">
            <label htmlFor="api-key-input" className="form-label">
              API Key
            </label>
            <input
              id="api-key-input"
              type="password"
              value={inputKey}
              onChange={handleInputChange}
              disabled={isValidating}
              placeholder="sk-or-v1-..."
              className="form-input"
              aria-describedby={error ? 'api-key-error' : undefined}
            />
          </div>

          {error && (
            <div id="api-key-error" className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating || !inputKey.trim()}
            className="submit-button"
          >
            {isValidating ? 'Validating...' : 'Submit Key'}
          </button>
        </form>

        <p className="api-key-gate-help">
          Don't have an API key?{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="help-link"
          >
            Get one from OpenRouter
          </a>
        </p>

        <div className="security-warning" role="note">
          <p className="warning-text">
            ⚠️ Your API key will be stored locally in your browser. 
            If you're using a shared device, remember to clear your API key 
            when you're done using the application.
          </p>
        </div>
      </div>
    </div>
  );
}
