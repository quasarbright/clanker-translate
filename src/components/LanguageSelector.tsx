import React from 'react';
import { LANGUAGES } from '../constants/languages';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  fromLanguage: string;
  toLanguage: string;
  onFromChange: (lang: string) => void;
  onToChange: (lang: string) => void;
  onSwap: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  fromLanguage,
  toLanguage,
  onFromChange,
  onToChange,
  onSwap,
}) => {
  const isSwapDisabled = fromLanguage === 'auto';

  return (
    <div className="language-selector">
      <select
        id="from-language"
        className="language-dropdown"
        value={fromLanguage}
        onChange={(e) => onFromChange(e.target.value)}
        aria-label="Source language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <button
        className="swap-button"
        onClick={onSwap}
        disabled={isSwapDisabled}
        aria-label="Swap languages"
        type="button"
      >
        ⇄
      </button>

      <select
        id="to-language"
        className="language-dropdown"
        value={toLanguage}
        onChange={(e) => onToChange(e.target.value)}
        aria-label="Target language"
      >
        {LANGUAGES.filter((lang) => lang.code !== 'auto').map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
