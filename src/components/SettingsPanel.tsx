import React, { useState, useEffect, useRef } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const closeSettings = () => {
    setIsOpen(false);
  };

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        // Check if click is not on the toggle button
        const target = event.target as HTMLElement;
        if (!target.closest('.settings-toggle')) {
          closeSettings();
        }
      }
    };

    // Add a small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSettings();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

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
        <>
          <div className="settings-backdrop" onClick={closeSettings} aria-hidden="true" />
          <div 
            id="settings-content" 
            className="settings-content" 
            role="dialog" 
            aria-label="Settings"
            ref={contentRef}
          >
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
        </>
      )}
    </div>
  );
};
