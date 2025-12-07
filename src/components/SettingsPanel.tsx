import React, { useState } from 'react';
import { ModelSelector } from './ModelSelector';
import type { Model } from '../types';
import './SettingsPanel.css';

interface SettingsPanelProps {
  selectedModel: string;
  availableModels: Model[];
  onModelChange: (modelId: string) => void;
  onClearApiKey: () => void;
  onClearAllData: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  selectedModel,
  availableModels,
  onModelChange,
  onClearApiKey,
  onClearAllData,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="settings-panel">
      <button
        className="settings-toggle"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-label="Toggle settings"
        aria-controls="settings-content"
      >
        <span className="settings-icon" aria-hidden="true">⚙️</span>
        <span className="settings-text">Settings</span>
      </button>

      {isOpen && (
        <div id="settings-content" className="settings-content" role="region" aria-label="Settings">
          <div className="settings-section">
            <ModelSelector
              selectedModel={selectedModel}
              models={availableModels}
              onChange={onModelChange}
            />
          </div>

          <div className="settings-section">
            <button
              className="clear-api-key-button"
              onClick={onClearApiKey}
              aria-label="Clear API key"
            >
              Clear API Key
            </button>
          </div>

          <div className="settings-section">
            <button
              className="clear-all-data-button"
              onClick={onClearAllData}
              aria-label="Clear all data"
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
