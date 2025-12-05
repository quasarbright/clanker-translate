# Implementation Plan

- [ ] 1. Project setup and configuration
  - Initialize Vite + React + TypeScript project
  - Configure Vitest and fast-check for testing
  - Set up basic file structure
  - Create type definitions file
  - _Requirements: 15.4_

- [ ] 1.1 Write tests for project setup
  - Verify TypeScript configuration
  - Test that Vitest runs successfully
  - Test that fast-check is properly configured
  - _Requirements: 15.4_

- [ ] 2. Implement StorageService with tests
  - Create StorageService class with get/set methods for API key, model, and language preferences
  - Mock localStorage for testing
  - _Requirements: 6.2, 6.3, 5.4, 13.4_

- [ ] 2.1 Write unit tests for StorageService
  - Test getApiKey/setApiKey/clearApiKey
  - Test getSelectedModel/setSelectedModel
  - Test getLanguagePreferences/setLanguagePreferences
  - Test behavior with empty/null values
  - _Requirements: 6.2, 6.3, 5.4_

- [ ] 2.2 Write property test for API key persistence
  - **Property 1: API Key Persistence Round Trip**
  - **Validates: Requirements 6.2, 6.3**

- [ ] 2.3 Write property test for model selection persistence
  - **Property 2: Model Selection Persistence**
  - **Validates: Requirements 5.4**

- [ ] 2.4 Write property test for settings persistence completeness
  - **Property 8: Settings Persistence Completeness**
  - **Validates: Requirements 13.4**

- [ ] 3. Implement OpenRouterService with tests
  - Create OpenRouterService class with validateApiKey, fetchModels, and translate methods
  - Implement proper error handling and typed errors
  - Mock fetch for testing
  - _Requirements: 1.1, 5.1, 5.2, 5.5, 6.1_

- [ ] 3.1 Write unit tests for OpenRouterService
  - Test validateApiKey with valid/invalid keys
  - Test fetchModels with mocked API response
  - Test translate with mocked API response
  - Test error handling for network failures
  - Test error handling for auth failures
  - _Requirements: 1.1, 5.1, 11.3_

- [ ] 3.2 Write property test for translation request format
  - **Property 5: Translation Request Format**
  - **Validates: Requirements 1.1**

- [ ] 3.3 Write property test for model list filtering
  - **Property 10: Model List Filtering**
  - **Validates: Requirements 5.1, 5.2**

- [ ] 4. Create ApiKeyGate component with tests
  - Build form for API key entry
  - Add validation and loading states
  - Style with dark theme
  - _Requirements: 6.1, 11.2_

- [ ] 4.1 Write unit tests for ApiKeyGate
  - Test rendering of form elements
  - Test input handling
  - Test form submission
  - Test validation error display
  - Test loading state display
  - _Requirements: 6.1, 11.2_

- [ ] 5. Create basic App component with API key gating
  - Implement conditional rendering based on API key presence
  - Load API key from storage on mount
  - Handle API key submission
  - Display ApiKeyGate when no key present
  - _Requirements: 6.1, 6.3_

- [ ] 5.1 Write unit tests for App component
  - Test initial render with no API key
  - Test initial render with stored API key
  - Test API key submission flow
  - Test logout flow
  - _Requirements: 6.1, 6.3_

- [ ] 6. Checkpoint - Verify API key flow works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Create LanguageSelector component with tests
  - Build dropdowns for source and target languages
  - Add swap button
  - Implement swap logic
  - Style with dark theme
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7.1 Write unit tests for LanguageSelector
  - Test rendering of dropdowns
  - Test language selection changes
  - Test swap button click
  - Test swap button disabled when source is "auto"
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7.2 Write property test for language swap idempotence
  - **Property 3: Language Swap Idempotence**
  - **Validates: Requirements 7.4**

- [ ] 8. Create InputPanel component with tests
  - Build textarea with character counter
  - Add Paste, Copy, Clear buttons
  - Implement clipboard operations
  - Style with dark theme
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 8.1 Write unit tests for InputPanel
  - Test textarea rendering and input
  - Test character counter accuracy
  - Test paste button functionality
  - Test copy button functionality
  - Test clear button functionality
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 8.2 Write property test for character count accuracy
  - **Property 7: Character Count Accuracy**
  - **Validates: Requirements 8.4**

- [ ] 9. Create OutputPanel component with tests
  - Build display area for translation
  - Add copy button
  - Add conditional rendering for explanation and transcription
  - Style with dark theme
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 3.1, 3.2, 4.1, 4.2_

- [ ] 9.1 Write unit tests for OutputPanel
  - Test rendering with translation
  - Test rendering without translation
  - Test copy button enabled/disabled states
  - Test explanation display when present
  - Test transcription display when present
  - _Requirements: 9.1, 9.2, 9.3, 3.1, 4.1_

- [ ] 9.2 Write property test for copy operation fidelity
  - **Property 9: Copy Operation Fidelity**
  - **Validates: Requirements 9.1**

- [ ] 10. Create ContextPanel component with tests
  - Build textarea for context input
  - Style with dark theme
  - _Requirements: 2.1, 2.3_

- [ ] 10.1 Write unit tests for ContextPanel
  - Test textarea rendering and input
  - Test controlled component behavior
  - _Requirements: 2.1, 2.3_

- [ ] 11. Create ModelSelector component with tests
  - Build dropdown for model selection
  - Display model names and descriptions
  - Handle model change events
  - Style with dark theme
  - _Requirements: 5.2, 5.3, 5.4_

- [ ] 11.1 Write unit tests for ModelSelector
  - Test rendering with model list
  - Test model selection change
  - Test selected model display
  - _Requirements: 5.2, 5.3, 5.4_

- [ ] 12. Create SettingsPanel component with tests
  - Build collapsible panel
  - Include ModelSelector
  - Add logout button
  - Style with dark theme
  - _Requirements: 13.1, 13.2, 13.3, 13.5_

- [ ] 12.1 Write unit tests for SettingsPanel
  - Test panel open/close toggle
  - Test model selector integration
  - Test logout button functionality
  - _Requirements: 13.1, 13.2, 13.5_

- [ ] 13. Create TranslationInterface component with tests
  - Integrate all child components (LanguageSelector, InputPanel, OutputPanel, ContextPanel, SettingsPanel)
  - Implement translation flow
  - Handle loading and error states
  - Style with dark theme
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.1, 2.2, 2.3_

- [ ] 13.1 Write unit tests for TranslationInterface
  - Test rendering of all child components
  - Test translation button click
  - Test loading state during translation
  - Test error state display
  - Test successful translation display
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 11.3, 11.4_

- [ ] 14. Checkpoint - Verify translation interface renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement translation validation logic with tests
  - Add validation for empty input
  - Add validation for missing API key
  - Disable translate button when invalid
  - _Requirements: 8.5, 11.1, 11.2_

- [ ] 15.1 Write unit tests for validation logic
  - Test empty input validation
  - Test whitespace-only input validation
  - Test missing API key validation
  - Test translate button disabled states
  - _Requirements: 8.5, 11.1, 11.2_

- [ ] 15.2 Write property test for empty input validation
  - **Property 4: Empty Input Validation**
  - **Validates: Requirements 8.5, 11.1**

- [ ] 16. Implement error handling and display with tests
  - Create error banner component
  - Handle different error types (auth, network, rate limit, validation)
  - Display user-friendly error messages
  - Clear errors on new translation
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 16.1 Write unit tests for error handling
  - Test error banner rendering
  - Test different error type displays
  - Test error clearing on new translation
  - _Requirements: 11.3, 11.4, 11.5_

- [ ] 16.2 Write property test for error message display
  - **Property 6: Error Message Display**
  - **Validates: Requirements 11.3, 11.4**

- [ ] 17. Integrate model fetching in App component with tests
  - Fetch models on successful API key validation
  - Store available models in state
  - Filter for OpenAI models
  - Handle fetch errors
  - _Requirements: 5.1, 5.2_

- [ ] 17.1 Write unit tests for model fetching
  - Test model fetch on key validation
  - Test OpenAI model filtering
  - Test error handling for fetch failures
  - Test loading state during fetch
  - _Requirements: 5.1, 5.2_

- [ ] 18. Implement model persistence with tests
  - Load selected model from storage on mount
  - Save model selection to storage on change
  - Default to first available model if none stored
  - _Requirements: 5.4_

- [ ] 18.1 Write unit tests for model persistence
  - Test loading stored model on mount
  - Test saving model on selection change
  - Test default model selection
  - _Requirements: 5.4_

- [ ] 19. Implement language preference persistence with tests
  - Load language preferences from storage on mount
  - Save language selections to storage on change
  - Default to English → Japanese if none stored
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 19.1 Write unit tests for language persistence
  - Test loading stored languages on mount
  - Test saving languages on selection change
  - Test default language selection
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 20. Implement responsive design with tests
  - Add mobile breakpoint styles
  - Test layout on different screen sizes
  - Ensure touch-friendly button sizes
  - Rotate swap button on mobile
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 20.1 Write unit tests for responsive behavior
  - Test mobile layout rendering
  - Test desktop layout rendering
  - Test swap button rotation on mobile
  - _Requirements: 12.1, 12.2, 12.5_

- [ ] 21. Implement visual feedback animations with tests
  - Add fade-in animation for translation results
  - Add hover states for buttons
  - Add focus indicators for inputs
  - Add loading spinner animation
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 21.1 Write unit tests for visual feedback
  - Test fade-in animation class application
  - Test hover state styles
  - Test focus indicator styles
  - Test loading spinner rendering
  - _Requirements: 14.1, 14.2, 14.3, 14.5_

- [ ] 22. Implement translation prompt engineering with tests
  - Create system prompt for translation
  - Format user prompt with source/target languages, text, and context
  - Request JSON response format with translation, explanation, and transcription
  - Handle response parsing
  - _Requirements: 1.1, 2.2, 3.1, 3.3, 4.1_

- [ ] 22.1 Write unit tests for prompt engineering
  - Test system prompt generation
  - Test user prompt formatting with all fields
  - Test user prompt formatting without context
  - Test JSON response parsing
  - Test handling of malformed responses
  - _Requirements: 1.1, 2.2, 3.1, 4.1_

- [ ] 23. Implement transcription logic with tests
  - Detect when source and target use different writing systems
  - Request transcription in prompt when needed
  - Display transcription when provided
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 23.1 Write unit tests for transcription logic
  - Test writing system detection
  - Test transcription request inclusion
  - Test transcription display
  - Test no transcription for same writing systems
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 24. Checkpoint - Verify complete translation flow works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Add dark theme styling
  - Apply dark color scheme to all components
  - Ensure proper contrast ratios
  - Test readability
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 25.1 Write visual regression tests for dark theme
  - Test color contrast meets WCAG standards
  - Test all components render correctly with dark theme
  - _Requirements: 14.1, 14.2, 14.3_

- [ ] 26. Implement accessibility features with tests
  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works
  - Add focus management
  - Test with screen reader
  - _Requirements: 12.3, 14.3_

- [ ] 26.1 Write unit tests for accessibility
  - Test ARIA labels presence
  - Test keyboard navigation
  - Test focus order
  - _Requirements: 12.3, 14.3_

- [ ] 27. Add security headers and CSP
  - Configure Content Security Policy
  - Ensure API key never logged
  - Add warning about shared devices
  - _Requirements: 15.1, 15.2, 15.3, 15.5_

- [ ] 27.1 Write tests for security measures
  - Test CSP configuration
  - Test API key not in console logs
  - Test warning display
  - _Requirements: 15.1, 15.2, 15.5_

- [ ] 28. Optimize bundle size and performance
  - Implement code splitting for settings panel
  - Add memoization for expensive computations
  - Debounce character counter updates
  - Add request cancellation for in-flight translations
  - _Requirements: 1.4_

- [ ] 28.1 Write performance tests
  - Test bundle size is under 200KB gzipped
  - Test debouncing works correctly
  - Test request cancellation
  - _Requirements: 1.4_

- [ ] 29. Final integration testing
  - Test complete user flow from API key entry to translation
  - Test error recovery flows
  - Test settings persistence across page reloads
  - Test all edge cases
  - _Requirements: All_

- [ ] 29.1 Write end-to-end integration tests
  - Test full API key flow
  - Test full translation flow
  - Test settings flow
  - Test error handling flow
  - _Requirements: All_

- [ ] 30. Final checkpoint - Complete application verification
  - Ensure all tests pass, ask the user if questions arise.
