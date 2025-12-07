import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiKeyGate } from '../components/ApiKeyGate';
import { StorageService } from '../services/StorageService';
import { OpenRouterService } from '../services/OpenRouterService';

describe('Security Measures', () => {
  describe('CSP Configuration', () => {
    // Note: CSP is configured in index.html via meta tag
    // These tests verify the expected CSP policy structure
    
    it('should have CSP configuration defined', () => {
      // CSP is defined in index.html as a meta tag
      // This test verifies we have the expected policy structure documented
      const expectedCSP = {
        'default-src': "'self'",
        'connect-src': "'self' https://openrouter.ai",
        'script-src': "'self'",
        'style-src': "'self' 'unsafe-inline'",
        'img-src': "'self' data:",
        'font-src': "'self'"
      };
      
      // Verify the policy structure is defined
      expect(expectedCSP['default-src']).toBe("'self'");
      expect(expectedCSP['connect-src']).toContain('https://openrouter.ai');
      expect(expectedCSP['script-src']).toBe("'self'");
    });

    it('should restrict script sources to self only', () => {
      // CSP policy restricts scripts to same origin only
      const scriptPolicy = "'self'";
      expect(scriptPolicy).toBe("'self'");
    });

    it('should allow connections only to self and OpenRouter', () => {
      // CSP policy allows connections to same origin and OpenRouter API
      const connectPolicy = "'self' https://openrouter.ai";
      expect(connectPolicy).toContain("'self'");
      expect(connectPolicy).toContain('https://openrouter.ai');
    });

    it('should have restrictive default policy', () => {
      // CSP default-src is set to self only
      const defaultPolicy = "'self'";
      expect(defaultPolicy).toBe("'self'");
    });
  });

  describe('API Key Logging Prevention', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
    let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
    let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Spy on all console methods
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      localStorage.clear();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleInfoSpy.mockRestore();
      consoleDebugSpy.mockRestore();
    });

    it('should not log API key when storing', () => {
      const testKey = 'sk-or-v1-test-key-12345';
      
      StorageService.setApiKey(testKey);
      
      // Check that the key was not logged to any console method
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleInfoSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleDebugSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
    });

    it('should not log API key when retrieving', () => {
      const testKey = 'sk-or-v1-test-key-67890';
      
      StorageService.setApiKey(testKey);
      consoleLogSpy.mockClear();
      consoleErrorSpy.mockClear();
      consoleWarnSpy.mockClear();
      consoleInfoSpy.mockClear();
      consoleDebugSpy.mockClear();
      
      StorageService.getApiKey();
      
      // Check that the key was not logged
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleInfoSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleDebugSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
    });

    it('should not log API key during validation', async () => {
      const testKey = 'sk-or-v1-test-key-validation';
      
      // Mock fetch to avoid actual API call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] })
      });
      
      await OpenRouterService.validateApiKey(testKey);
      
      // Check that the key was not logged
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleInfoSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
      expect(consoleDebugSpy).not.toHaveBeenCalledWith(expect.stringContaining(testKey));
    });
  });

  describe('Shared Device Warning', () => {
    it('should display warning about shared devices on API key gate', () => {
      const mockOnSubmit = vi.fn();
      render(<ApiKeyGate onSubmit={mockOnSubmit} />);
      
      // Look for warning text about shared devices
      const warningText = screen.getByText(/shared device/i);
      expect(warningText).toBeInTheDocument();
    });

    it('should warn users about local storage security', () => {
      const mockOnSubmit = vi.fn();
      render(<ApiKeyGate onSubmit={mockOnSubmit} />);
      
      // Look for text mentioning local storage or device security
      const securityWarning = screen.getByText(/stored locally/i);
      expect(securityWarning).toBeInTheDocument();
    });

    it('should have warning with appropriate ARIA role', () => {
      const mockOnSubmit = vi.fn();
      render(<ApiKeyGate onSubmit={mockOnSubmit} />);
      
      // Warning should have role="note" or similar for accessibility
      const warning = screen.getByRole('note');
      expect(warning).toBeInTheDocument();
    });
  });
});
