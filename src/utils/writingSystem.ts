/**
 * Utility functions for detecting writing systems and determining transcription needs
 */

/**
 * Determine the writing system for a given language code
 * @param languageCode The language code (e.g., 'en', 'ja', 'zh')
 * @returns The writing system identifier
 */
export function getWritingSystem(languageCode: string): string {
  const writingSystems: Record<string, string> = {
    'en': 'latin',
    'es': 'latin',
    'fr': 'latin',
    'de': 'latin',
    'pt': 'latin',
    'ja': 'japanese',
    'zh': 'chinese',
    'ko': 'korean',
    'ar': 'arabic',
    'ru': 'cyrillic',
    'auto': 'unknown'
  };

  return writingSystems[languageCode] || 'unknown';
}

/**
 * Check if two languages use different writing systems
 * @param fromLanguage Source language code
 * @param toLanguage Target language code
 * @returns True if the languages use different writing systems
 */
export function needsTranscription(fromLanguage: string, toLanguage: string): boolean {
  // If source is 'auto', we can't determine if transcription is needed
  if (fromLanguage === 'auto') {
    return false;
  }

  const fromSystem = getWritingSystem(fromLanguage);
  const toSystem = getWritingSystem(toLanguage);

  // If either system is unknown, don't request transcription
  if (fromSystem === 'unknown' || toSystem === 'unknown') {
    return false;
  }

  return fromSystem !== toSystem;
}
