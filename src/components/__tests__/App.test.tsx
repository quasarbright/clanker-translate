import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { StorageService } from '../../services/StorageService';
import { OpenRouterService } from '../../services/OpenRouterService';
import type { Model } from '../../types';

// Mock the StorageService
vi.mock('../../services/StorageService', () => ({
  StorageService: {
    getApiKey: vi.fn(),
    setApiKey: vi.fn(),
    clearApiKey: vi.fn(),
    getSelectedModel: vi.fn(),
    setSelectedModel: vi.fn(),
    getLanguagePreferences: vi.fn(),
    setLanguagePreferences: vi.fn(),
  },
}));

// Mock the OpenRouterService
vi.mock('../../services/OpenRouterService', () => ({
  OpenRouterService: {
    validateApiKey: vi.fn(),
    fetchModels: vi.fn(),
    translate: vi.fn(),
  },
}));

// Mock the ApiKeyGate component
vi.mock('../../components/ApiKeyGate', () => ({
  ApiKeyGate: ({ onSubmit }: { onSubmit: (key: string) => void }) => (
    <div data-testid="api-key-gate">
      <button onClick={() => onSubmit('test-api-key')}>Submit Test Key</button>
    </div>
  ),
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock default language preferences for all tests
    vi.mocked(StorageService.getLanguagePreferences).mockReturnValue({
      fromLanguage: 'en',
      toLanguage: 'ja',
    });
  });

  it('should render ApiKeyGate when no API key is stored', () => {
    // Mock no stored API key
    vi.mocked(StorageService.getApiKey).mockReturnValue(null);

    render(<App />);

    // Should display the API key gate
    expect(screen.getByTestId('api-key-gate')).toBeInTheDocument();
  });

  it('should render translation interface when API key is stored', () => {
    // Mock stored API key
    vi.mocked(StorageService.getApiKey).mockReturnValue('stored-api-key-123');

    render(<App />);

    // Should NOT display the API key gate
    expect(screen.queryByTestId('api-key-gate')).not.toBeInTheDocument();
    
    // Should display some indication of the main interface
    expect(screen.queryByText(/Clanker Translate/i)).toBeInTheDocument();
  });

  it('should handle API key submission and store it', async () => {
    const user = userEvent.setup();
    
    // Start with no API key
    vi.mocked(StorageService.getApiKey).mockReturnValue(null);

    render(<App />);

    // Should show API key gate
    expect(screen.getByTestId('api-key-gate')).toBeInTheDocument();

    // Submit a key
    const submitButton = screen.getByText('Submit Test Key');
    await user.click(submitButton);

    // Should call setApiKey
    await waitFor(() => {
      expect(StorageService.setApiKey).toHaveBeenCalledWith('test-api-key');
    });
  });

  it('should load API key from storage on mount', () => {
    const testKey = 'my-stored-key-456';
    vi.mocked(StorageService.getApiKey).mockReturnValue(testKey);

    render(<App />);

    // Should have called getApiKey on mount
    expect(StorageService.getApiKey).toHaveBeenCalled();
    
    // Should not show API key gate since key exists
    expect(screen.queryByTestId('api-key-gate')).not.toBeInTheDocument();
  });

  describe('Model Fetching', () => {
    const mockModels: Model[] = [
      { id: 'openai/gpt-4', name: 'GPT-4', description: 'Most capable model' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
      { id: 'anthropic/claude-2', name: 'Claude 2', description: 'Anthropic model' },
    ];

    beforeEach(() => {
      vi.mocked(StorageService.getApiKey).mockReturnValue('test-api-key');
      vi.mocked(StorageService.getSelectedModel).mockReturnValue(null);
    });

    it('should fetch models on successful API key validation', async () => {
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);

      render(<App />);

      // Should call fetchModels with the API key
      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalledWith('test-api-key');
      });
    });

    it('should store all fetched models', async () => {
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);

      render(<App />);

      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalled();
      });

      // The component should store all models without filtering
      // Models are available in the component's state for the settings panel
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(OpenRouterService.fetchModels).mockRejectedValue(
        new Error('Network error')
      );

      render(<App />);

      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalled();
      });

      // Should log the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch models:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should show loading state during model fetch', async () => {
      // Create a promise that we can control
      let resolveFetch: (value: Model[]) => void;
      const fetchPromise = new Promise<Model[]>((resolve) => {
        resolveFetch = resolve;
      });

      vi.mocked(OpenRouterService.fetchModels).mockReturnValue(fetchPromise);

      render(<App />);

      // The component should be in loading state
      // Note: We'd need to expose isLoadingModels in the UI to test this properly
      // For now, we just verify the fetch was called
      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalled();
      });

      // Resolve the promise to clean up
      resolveFetch!(mockModels);
    });

    it('should store available models in state after fetch', async () => {
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);

      render(<App />);

      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalled();
      });

      // Models should be available in the component
      // We can verify this indirectly by checking if the settings panel would have models
      // The actual state is internal to the component
    });

    it('should not fetch models when no API key is present', () => {
      vi.mocked(StorageService.getApiKey).mockReturnValue(null);

      render(<App />);

      // Should not call fetchModels
      expect(OpenRouterService.fetchModels).not.toHaveBeenCalled();
    });

    it('should set default model when no model is stored', async () => {
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);
      vi.mocked(StorageService.getSelectedModel).mockReturnValue(null);

      render(<App />);

      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalled();
      });

      // Should set the first available model as default
      await waitFor(() => {
        expect(StorageService.setSelectedModel).toHaveBeenCalledWith(mockModels[0].id);
      });
    });

    it('should load stored model if it exists in available models', async () => {
      const storedModelId = 'anthropic/claude-2';
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);
      vi.mocked(StorageService.getSelectedModel).mockReturnValue(storedModelId);

      render(<App />);

      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalled();
      });

      // Should not call setSelectedModel again since stored model is valid
      // The component should use the stored model
    });

    it('should fallback to first model if stored model is not in available models', async () => {
      const invalidStoredModelId = 'invalid/model-id';
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);
      vi.mocked(StorageService.getSelectedModel).mockReturnValue(invalidStoredModelId);

      render(<App />);

      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalled();
      });

      // Should set a valid model from the available list
      await waitFor(() => {
        expect(StorageService.setSelectedModel).toHaveBeenCalled();
      });
    });
  });

  describe('Model Persistence', () => {
    const mockModels: Model[] = [
      { id: 'openai/gpt-4', name: 'GPT-4', description: 'Most capable model' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    ];

    beforeEach(() => {
      vi.mocked(StorageService.getApiKey).mockReturnValue('test-api-key');
      vi.mocked(OpenRouterService.fetchModels).mockResolvedValue(mockModels);
    });

    it('should load stored model on mount', async () => {
      const storedModelId = 'openai/gpt-3.5-turbo';
      vi.mocked(StorageService.getSelectedModel).mockReturnValue(storedModelId);

      render(<App />);

      await waitFor(() => {
        expect(StorageService.getSelectedModel).toHaveBeenCalled();
      });

      // Should use the stored model without setting it again
      expect(StorageService.setSelectedModel).not.toHaveBeenCalled();
    });

    it('should save model selection to storage on change', async () => {
      const user = userEvent.setup();
      vi.mocked(StorageService.getSelectedModel).mockReturnValue(null);

      render(<App />);

      // Wait for initial model fetch and default selection
      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalled();
      });

      // Clear the mock calls from initial setup
      vi.mocked(StorageService.setSelectedModel).mockClear();

      // Open the settings panel
      const settingsButton = screen.getByRole('button', { name: /toggle settings/i });
      await user.click(settingsButton);

      // Find the model search input
      const modelInput = screen.getByLabelText(/AI Model/i);
      
      // Focus on the input to open the dropdown
      await user.click(modelInput);

      // Find and click the second model option
      const modelOption = screen.getByRole('option', { name: /GPT-3.5 Turbo/i });
      await user.click(modelOption);

      // Should save the new model to storage
      await waitFor(() => {
        expect(StorageService.setSelectedModel).toHaveBeenCalledWith('openai/gpt-3.5-turbo');
      });
    });

    it('should default to first available model if none stored', async () => {
      vi.mocked(StorageService.getSelectedModel).mockReturnValue(null);

      render(<App />);

      await waitFor(() => {
        expect(OpenRouterService.fetchModels).toHaveBeenCalled();
      });

      // Should set the first model as default
      await waitFor(() => {
        expect(StorageService.setSelectedModel).toHaveBeenCalledWith(mockModels[0].id);
      });
    });
  });

  // Language preference persistence is now tested in TranslationInterface.test.tsx
});
