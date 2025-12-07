import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Model } from '../types';
import './ModelSelector.css';

interface ModelSelectorProps {
  selectedModel: string;
  models: Model[];
  onChange: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  models,
  onChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(models, {
      keys: [
        { name: 'name', weight: 2 },  // Prioritize name matches
        { name: 'id', weight: 1 }     // Secondary priority for ID
      ],
      threshold: 0.4,  // More lenient matching (0 = exact, 1 = match anything)
      ignoreLocation: true,  // Don't care where in the string the match is
      minMatchCharLength: 2,  // Minimum characters to match
      includeScore: true,
    });
  }, [models]);

  // Filter models based on search query using Fuse.js
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) {
      return models;
    }
    
    const results = fuse.search(searchQuery);
    return results.map(result => result.item);
  }, [fuse, models, searchQuery]);

  // Get the selected model object
  const selectedModelObj = models.find((m) => m.id === selectedModel);

  const handleModelSelect = (modelId: string) => {
    onChange(modelId);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="model-selector">
      <label htmlFor="model-search" className="model-label">
        Model
      </label>
      <div className="model-selector-container">
        <input
          id="model-search"
          type="text"
          className="model-search-input"
          placeholder={selectedModelObj?.name || 'Search models...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={() => {
            // Delay to allow click on dropdown items
            setTimeout(() => setIsDropdownOpen(false), 200);
          }}
          aria-label="AI Model"
          autoComplete="off"
        />
        {isDropdownOpen && filteredModels.length > 0 && (
          <div className="model-dropdown-list" role="listbox" aria-label="Available models">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className={`model-dropdown-item ${
                  model.id === selectedModel ? 'selected' : ''
                }`}
                onClick={() => handleModelSelect(model.id)}
                role="option"
                aria-selected={model.id === selectedModel}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleModelSelect(model.id);
                  }
                }}
              >
                <div className="model-name">{model.name}</div>
                {model.description && (
                  <div className="model-description">{model.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
        {isDropdownOpen && searchQuery && filteredModels.length === 0 && (
          <div className="model-dropdown-list">
            <div className="model-dropdown-item no-results">
              No models found matching "{searchQuery}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
