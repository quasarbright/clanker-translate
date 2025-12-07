import React, { useState, useRef, useEffect } from 'react';
import { LanguageSelector } from './LanguageSelector';
import { InputPanel } from './InputPanel';
import { OutputPanel } from './OutputPanel';
import { ContextPanel } from './ContextPanel';
import { SettingsPanel } from './SettingsPanel';
import { ErrorBanner } from './ErrorBanner';
import { OpenRouterService } from '../services/OpenRouterService';
import { StorageService } from '../services/StorageService';
import type { Model, OpenRouterError } from '../types';
import './TranslationInterface.css';

interface TranslationInterfaceProps {
  apiKey: string;
  selectedModel: string;
  availableModels: Model[];
  onModelChange: (modelId: string) => void;
  onClearApiKey: () => void;
  onClearAllData: () => void;
}

export const TranslationInterface: React.FC<TranslationInterfaceProps> = ({
  apiKey,
  selectedModel,
  availableModels,
  onModelChange,
  onClearApiKey,
  onClearAllData,
}) => {
  // Translation state
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [transcription, setTranscription] = useState('');
  const [context, setContext] = useState('');
  
  // Load language preferences from storage
  const languagePrefs = StorageService.getLanguagePreferences();
  const [fromLanguage, setFromLanguage] = useState(languagePrefs.fromLanguage);
  const [toLanguage, setToLanguage] = useState(languagePrefs.toLanguage);
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | OpenRouterError | null>(null);

  // AbortController for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Save language preferences when they change
  useEffect(() => {
    StorageService.setLanguagePreferences({
      fromLanguage,
      toLanguage,
    });
  }, [fromLanguage, toLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle language swap
  const handleSwapLanguages = () => {
    if (fromLanguage !== 'auto') {
      setFromLanguage(toLanguage);
      setToLanguage(fromLanguage);
    }
  };

  // Handle copy output
  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle translate
  const handleTranslate = async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Clear any existing errors
    setError(null);

    // Validate input
    if (!sourceText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    if (!apiKey) {
      setError('Please enter your API key');
      return;
    }

    setIsTranslating(true);

    try {
      const response = await OpenRouterService.translate(
        {
          apiKey,
          model: selectedModel,
          sourceText,
          fromLanguage,
          toLanguage,
          context: context || undefined,
        },
        abortControllerRef.current.signal
      );

      setTranslatedText(response.translation);
      setExplanation(response.explanation || '');
      setTranscription(response.transcription || '');
    } catch (err) {
      // Don't show error if request was aborted
      if ((err as Error).name === 'AbortError') {
        return;
      }
      const openRouterError = err as OpenRouterError;
      setError(openRouterError);
    } finally {
      setIsTranslating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="translation-interface">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="translation-header" role="banner">
        <div className="header-content">
          <h1>Clanker Translate</h1>
          <SettingsPanel
            selectedModel={selectedModel}
            availableModels={availableModels}
            onModelChange={onModelChange}
            onClearApiKey={onClearApiKey}
            onClearAllData={onClearAllData}
          />
        </div>
      </header>

      <main id="main-content" className="translation-main" role="main">
        <div className="translation-content">
          <ErrorBanner error={error} />
          {/* Language Selector */}
          <div className="language-selector-container">
            <LanguageSelector
              fromLanguage={fromLanguage}
              toLanguage={toLanguage}
              onFromChange={setFromLanguage}
              onToChange={setToLanguage}
              onSwap={handleSwapLanguages}
            />
          </div>

          {/* Input/Context and Output Panels */}
          <div className="panels-container">
            {/* Left Column: Input and Context */}
            <div className="left-column">
              <InputPanel
                value={sourceText}
                onChange={setSourceText}
                maxLength={5000}
              />

              <ContextPanel value={context} onChange={setContext} />

              {/* Translate Button - Desktop */}
              <div className="translate-button-container desktop-only">
                <button
                  className="translate-button"
                  onClick={handleTranslate}
                  disabled={isTranslating || !sourceText.trim()}
                  aria-label="Translate text"
                >
                  <span className="translate-button-content">
                    {isTranslating && <span className="loading-spinner" />}
                    {isTranslating ? 'Translating...' : 'Translate'}
                  </span>
                </button>
              </div>
            </div>

            {/* Translate Button - Mobile (between columns) */}
            <div className="translate-button-container mobile-only">
              <button
                className="translate-button"
                onClick={handleTranslate}
                disabled={isTranslating || !sourceText.trim()}
                aria-label="Translate text"
              >
                <span className="translate-button-content">
                  {isTranslating && <span className="loading-spinner" />}
                  {isTranslating ? 'Translating...' : 'Translate'}
                </span>
              </button>
            </div>

            {/* Right Column: Output */}
            <div className="right-column">
              <OutputPanel
                translation={translatedText}
                explanation={explanation}
                transcription={transcription}
                onCopy={handleCopyOutput}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
