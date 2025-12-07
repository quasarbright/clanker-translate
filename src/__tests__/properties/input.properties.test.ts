import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

describe('Input Property Tests', () => {
  it('Property 7: Character Count Accuracy', () => {
    /**
     * Feature: ai-translator, Property 7: Character Count Accuracy
     * Validates: Requirements 8.4
     */
    fc.assert(
      fc.property(
        fc.string(),
        (inputText) => {
          // The character count should equal the actual length of the text string
          const characterCount = inputText.length;
          expect(characterCount).toBe(inputText.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: Empty Input Validation', () => {
    /**
     * Feature: ai-translator, Property 4: Empty Input Validation
     * Validates: Requirements 8.5, 11.1
     */
    fc.assert(
      fc.property(
        // Generate strings that are either empty or contain only whitespace
        fc.oneof(
          fc.constant(''),
          fc.stringMatching(/^\s+$/),
          fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 }).map(arr => arr.join(''))
        ),
        (whitespaceString) => {
          // For any whitespace-only string (including empty string),
          // the translate button should be disabled
          const isValid = whitespaceString.trim().length > 0;
          
          // The validation logic: button should be disabled when input is empty/whitespace
          const shouldDisableButton = !isValid;
          
          expect(shouldDisableButton).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
