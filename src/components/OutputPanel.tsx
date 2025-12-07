import React from 'react';
import './OutputPanel.css';

interface OutputPanelProps {
  translation: string;
  explanation: string;
  transcription: string;
  onCopy: () => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  translation,
  explanation,
  transcription,
  onCopy,
}) => {
  const hasTranslation = translation.length > 0;
  const [showFadeIn, setShowFadeIn] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (hasTranslation) {
      setShowFadeIn(true);
      const timer = setTimeout(() => setShowFadeIn(false), 300);
      return () => clearTimeout(timer);
    }
  }, [hasTranslation, translation]);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="output-panel">
      <div className="output-panel-header">
        <label className="output-label">Output</label>
      </div>
      <div 
        className={`output-content ${showFadeIn ? 'fade-in' : ''}`}
        role="region"
        aria-live="polite"
        aria-label="Translation output"
      >
        {hasTranslation ? (
          <p className="translation-text">{translation}</p>
        ) : (
          <p className="translation-placeholder">Translation will appear here...</p>
        )}
        {transcription && (
          <div className="transcription-section" role="complementary" aria-label="Transcription">
            <span className="transcription-label">Transcription:</span>
            <p className="transcription-text">{transcription}</p>
          </div>
        )}
        {explanation && (
          <div className="explanation-section" role="complementary" aria-label="Explanation">
            <span className="explanation-label">Explanation:</span>
            <p className="explanation-text">{explanation}</p>
          </div>
        )}
      </div>
      <div className="output-panel-actions">
        <button
          type="button"
          className={`action-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          disabled={!hasTranslation}
          aria-label={copied ? 'Copied!' : 'Copy translation'}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
