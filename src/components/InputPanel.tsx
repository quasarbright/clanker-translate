import React, { useState, useEffect, useCallback } from 'react';
import './InputPanel.css';

interface InputPanelProps {
  value: string;
  onChange: (text: string) => void;
  maxLength: number;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  value,
  onChange,
  maxLength,
}) => {
  // Debounced character count for performance
  const [debouncedCount, setDebouncedCount] = useState(value.length);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCount(value.length);
    }, 100); // 100ms debounce

    return () => clearTimeout(timer);
  }, [value]);

  const characterCount = debouncedCount;

  return (
    <div className="input-panel">
      <div className="input-panel-header">
        <label htmlFor="input-textarea" className="input-label">
          Input
        </label>
        <span className="character-counter" aria-live="polite">
          {characterCount} / {maxLength}
        </span>
      </div>
      <textarea
        id="input-textarea"
        className="input-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter text to translate..."
        maxLength={maxLength}
        aria-label="Input text"
      />
    </div>
  );
};
