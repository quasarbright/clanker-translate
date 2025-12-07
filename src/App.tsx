import { useState, useEffect, useCallback } from 'react';
import { ApiKeyGate } from './components/ApiKeyGate';
import { TranslationInterface } from './components/TranslationInterface';
import { StorageService } from './services/StorageService';
import { OpenRouterService } from './services/OpenRouterService';
import type { Model } from './types';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [hasValidKey, setHasValidKey] = useState(false);
  
  // Model state
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Load API key from storage on mount
  useEffect(() => {
    const storedKey = StorageService.getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setHasValidKey(true);
    }
  }, []);

  // Fetch models when API key is set
  useEffect(() => {
    const fetchModels = async () => {
      if (!apiKey) return;

      try {
        const models = await OpenRouterService.fetchModels(apiKey);
        setAvailableModels(models);

        const storedModel = StorageService.getSelectedModel();
        
        // If stored model exists and is in the available list, use it
        if (storedModel && models.some(m => m.id === storedModel)) {
          setSelectedModel(storedModel);
        } else if (models.length > 0) {
          // Otherwise, default to first available model
          setSelectedModel(models[0].id);
          StorageService.setSelectedModel(models[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
        // On error, keep empty models list and don't set a model
      }
    };

    fetchModels();
  }, [apiKey]);

  // Memoized handlers for performance
  const handleApiKeySubmit = useCallback((key: string) => {
    StorageService.setApiKey(key);
    setApiKey(key);
    setHasValidKey(true);
  }, []);

  const handleClearApiKey = useCallback(() => {
    StorageService.clearApiKey();
    setApiKey(null);
    setHasValidKey(false);
    setAvailableModels([]);
    setSelectedModel('');
  }, []);

  const handleClearAllData = useCallback(() => {
    // Clear all localStorage
    localStorage.clear();
    // Reset all state
    setApiKey(null);
    setHasValidKey(false);
    setAvailableModels([]);
    setSelectedModel('');
  }, []);

  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    StorageService.setSelectedModel(modelId);
  }, []);

  // If no valid API key, show the gate
  if (!hasValidKey) {
    return <ApiKeyGate onSubmit={handleApiKeySubmit} />;
  }

  // Main translation interface
  return (
    <TranslationInterface
      apiKey={apiKey || ''}
      selectedModel={selectedModel}
      availableModels={availableModels}
      onModelChange={handleModelChange}
      onClearApiKey={handleClearApiKey}
      onClearAllData={handleClearAllData}
    />
  );
}

export default App;
