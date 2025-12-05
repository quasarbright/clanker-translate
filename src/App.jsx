import { useState, useEffect } from 'react'

function App() {
  const [inputText, setInputText] = useState('where is the toilet?')
  const [translation, setTranslation] = useState('')
  const [explanation, setExplanation] = useState('')
  const [transcription, setTranscription] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState('gemini')
  const [fromLanguage, setFromLanguage] = useState('auto')
  const [toLanguage, setToLanguage] = useState('japanese')
  const [context, setContext] = useState('asking a restaurant employee, be polite')
  const [rememberKey, setRememberKey] = useState(true)
  const [storedKeys, setStoredKeys] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Load stored keys on component mount and when provider changes
  useEffect(() => {
    try {
      const keys = localStorage.getItem('clanker-translate-keys')
      if (keys) {
        const parsedKeys = JSON.parse(keys)
        setStoredKeys(parsedKeys)
        if (parsedKeys[provider]) {
          setApiKey(parsedKeys[provider])
        }
      }
    } catch (e) {
      console.error('Failed to parse stored keys:', e)
    }
  }, [provider])

  // Save keys to localStorage
  const saveKeysToStorage = (keys) => {
    try {
      localStorage.setItem('clanker-translate-keys', JSON.stringify(keys))
    } catch (e) {
      console.error('Failed to save keys to localStorage:', e)
    }
  }

  // Handle provider change
  const handleProviderChange = (newProvider) => {
    setProvider(newProvider)
    setApiKey('')
    if (storedKeys[newProvider]) {
      setApiKey(storedKeys[newProvider])
    }
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate')
      return
    }
    if (!apiKey.trim()) {
      setError('Please enter your API key')
      return
    }

    setIsLoading(true)
    setError('')
    setTranslation('')
    setExplanation('')
    setTranscription('')

    try {
      let result

      if (provider === 'gemini') {
        // Google Gemini API
        const targetLang =
          toLanguage === 'english'
            ? 'English'
            : toLanguage === 'japanese'
            ? 'Japanese'
            : toLanguage === 'spanish'
            ? 'Spanish'
            : 'English'

        const prompt = `Translate this text to ${targetLang}: "${inputText}"${
          context.trim() ? `\n\nContext: ${context.trim()}` : ''
        }

If the source and target languages use different writing systems (e.g., English to Japanese, Japanese to English, or any language with logographic/scripted writing systems), also provide a transcription field showing the translation in the source language's writing system (e.g., romaji for Japanese text, pinyin for Chinese, or phonetic transcriptions).

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{"translation": "translated text", "explanation": "brief explanation", "transcription": "transcription in source writing system (optional - only include if writing systems differ)"}`

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text:
                        `You are a translator. Respond ONLY with valid JSON. No markdown, no explanations outside the JSON.\n\n${prompt}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 500,
              },
            }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || `API Error: ${response.status}`)
        }

        const data = await response.json()
        let jsonText = data.candidates[0].content.parts[0].text.trim()

        // Clean up any markdown or extra text
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')

        try {
          const parsed = JSON.parse(jsonText)

          if (parsed.translation && parsed.explanation) {
            setTranslation(parsed.translation)
            setExplanation(parsed.explanation)
            setTranscription(parsed.transcription || '')
            if (rememberKey && apiKey.trim()) {
              const updatedKeys = { ...storedKeys, [provider]: apiKey.trim() }
              setStoredKeys(updatedKeys)
              saveKeysToStorage(updatedKeys)
            }
            return
          } else {
            throw new Error('Missing required fields in JSON response')
          }
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError)
          console.error('Raw response:', jsonText)
          result = jsonText
        }
      } else {
        // OpenAI API (fallback)
        const targetLang =
          toLanguage === 'english'
            ? 'English'
            : toLanguage === 'japanese'
            ? 'Japanese'
            : toLanguage === 'spanish'
            ? 'Spanish'
            : 'English'

        const prompt = `Translate this text to ${targetLang}: "${inputText}"${
          context.trim() ? `\n\nContext: ${context.trim()}` : ''
        }

If the source and target languages use different writing systems (e.g., English to Japanese, Japanese to English, or any language with logographic/scripted writing systems), also provide a transcription field showing the translation in the source language's writing system (e.g., romaji for Japanese text, pinyin for Chinese, or phonetic transcriptions).

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{"translation": "translated text", "explanation": "brief explanation", "transcription": "transcription in source writing system (optional - only include if writing systems differ)"}`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content:
                  'You are a translator. Respond ONLY with valid JSON. No markdown, no explanations outside the JSON.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || `API Error: ${response.status}`)
        }

        const data = await response.json()
        let jsonText = data.choices[0].message.content.trim()

        // Clean up any markdown or extra text
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')

        try {
          const parsed = JSON.parse(jsonText)

          if (parsed.translation && parsed.explanation) {
            setTranslation(parsed.translation)
            setExplanation(parsed.explanation)
            setTranscription(parsed.transcription || '')
            if (rememberKey && apiKey.trim()) {
              const updatedKeys = { ...storedKeys, [provider]: apiKey.trim() }
              setStoredKeys(updatedKeys)
              saveKeysToStorage(updatedKeys)
            }
            return
          } else {
            throw new Error('Missing required fields in JSON response')
          }
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError)
          console.error('Raw response:', jsonText)
          result = jsonText
        }
      }

      // Fallback: if JSON parsing failed, treat as plain text
      setTranslation(result || '')
      setExplanation('')
      setTranscription('')

      if (rememberKey && apiKey.trim()) {
        const updatedKeys = { ...storedKeys, [provider]: apiKey.trim() }
        setStoredKeys(updatedKeys)
        saveKeysToStorage(updatedKeys)
      }
    } catch (err) {
      console.error('Translation error:', err)
      setError(`Translation failed: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // UI helpers inspired by Google Translate
  const swapLanguages = () => {
    if (fromLanguage === 'auto' || fromLanguage === toLanguage) return
    const prevFrom = fromLanguage
    setFromLanguage(toLanguage)
    setToLanguage(prevFrom)
  }

  const langToBCP47 = (lang) => {
    switch (lang) {
      case 'english':
        return 'en'
      case 'japanese':
        return 'ja'
      case 'spanish':
        return 'es'
      default:
        return undefined
    }
  }

  const speakText = (text, langHint) => {
    try {
      if (!text?.trim()) return
      const utter = new SpeechSynthesisUtterance(text)
      const code = langToBCP47(langHint)
      if (code) utter.lang = code
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utter)
    } catch (e) {
      console.error('Speech synthesis failed:', e)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      if (!text?.trim()) return
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
    } catch (e) {
      console.error('Paste failed:', e)
    }
  }

  const clearInput = () => setInputText('')

  const charCount = inputText.length

  return (
    <div className="min-h-screen">
      {/* Google Translate style header */}
      <header className="gt-header">
        <div className="gt-container">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.01-4.65.75-6.78l-.46-.83c-.39-.74-1.2-1.16-2.05-1.16H4.16c-.83 0-1.54.5-1.84 1.28l-.81 2.04c-.31.78-.07 1.69.58 2.23l1.02.85c-.25.96-.25 1.96 0 2.92l-1.02.85c-.65.54-.89 1.45-.58 2.23l.81 2.04c.3.78 1.01 1.28 1.84 1.28h4.44c.85 0 1.66-.42 2.05-1.16l.46-.83c1.26-2.13.99-4.84-.75-6.78l-.03-.03 2.54-2.51c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-medium text-gray-900">Clanker Translate</h1>
                <p className="text-sm text-gray-600">Powered by AI</p>
              </div>
            </div>
            <a
              href="https://translate.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Inspired by Google Translate
            </a>
          </div>
        </div>
      </header>

      <main className="gt-container">
        {/* Error banner */}
        {error && (
          <div className="gt-error gt-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* API Settings */}
        <details className="gt-card gt-settings group">
          <summary className="gt-settings summary">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span>API Settings</span>
            </div>
            <div className="w-4 h-4 flex-shrink-0">
                <svg className="w-full h-full transition-transform group-open:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
          </summary>
          <div className="gt-settings-content">
            <div className="pt-6 space-y-6">
              <div className="gt-form-group">
                <label className="gt-form-label">API Provider</label>
                <select
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="gt-form-select"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              <div className="gt-form-group">
                <label className="gt-form-label">
                  {provider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'AIza...' : 'sk-...'}
                  className="gt-form-input"
                />
                <div className="gt-checkbox-group">
                  <input
                    type="checkbox"
                    id="rememberKey"
                    checked={rememberKey}
                    onChange={(e) => setRememberKey(e.target.checked)}
                    className="gt-checkbox"
                  />
                  <label htmlFor="rememberKey" className="text-sm">
                    Remember my API key on this device
                  </label>
                </div>
                <p className="gt-help-text">
                  Your API key is stored locally and never sent to our servers
                </p>
              </div>
            </div>
          </div>
        </details>

        {/* Main translation interface */}
        <div className="gt-card">
          {/* Language selection bar */}
          <div className="gt-language-bar">
            <div className="gt-language-select">
              <select
                value={fromLanguage}
                onChange={(e) => setFromLanguage(e.target.value)}
                className="gt-form-select"
              >
                <option value="auto">Detect language</option>
                <option value="english">English</option>
                <option value="japanese">Japanese</option>
                <option value="spanish">Spanish</option>
              </select>
            </div>

            <button
              type="button"
              onClick={swapLanguages}
              className="gt-swap-btn"
              disabled={fromLanguage === 'auto'}
              title="Swap languages"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25H14.25A.75.75 0 0115 10zM3.5 6a.75.75 0 01.75-.75h6.638L8.73 3.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08L10.888 6.75H4.25A.75.75 0 013.5 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="gt-language-select">
              <select
                value={toLanguage}
                onChange={(e) => setToLanguage(e.target.value)}
                className="gt-form-select"
              >
                <option value="english">English</option>
                <option value="japanese">Japanese</option>
                <option value="spanish">Spanish</option>
              </select>
            </div>
          </div>

          {/* Translation area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="flex flex-col gap-4">
              {/* Input panel */}
              <div className="gt-input-panel flex-grow flex flex-col">
                <div className="gt-panel-header">
                  <div className="gt-panel-title">
                    {fromLanguage === 'auto' ? 'Detect language' : fromLanguage}
                  </div>
                </div>
                <div className="flex-grow">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="gt-textarea h-full"
                  />
                </div>
                <div className="gt-panel-controls">
                  <button className="gt-control-btn" onClick={pasteFromClipboard} type="button">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586l-3-3a1 1 0 00-1.414 1.414L11.586 11H8a1 1 0 100 2h3.586l-1 1a1 1 0 101.414 1.414l3-3z" />
                    </svg>
                    Paste
                  </button>
                  <button
                    className="gt-control-btn"
                    onClick={() => copyToClipboard(inputText)}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copy
                  </button>
                  <button className="gt-control-btn" onClick={clearInput} type="button">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Clear
                  </button>
                  <button
                    className="gt-control-btn"
                    onClick={() => speakText(inputText, fromLanguage)}
                    type="button"
                    disabled={!inputText.trim()}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.168 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.168l4.215-3.824zm2.344 2.13a1 1 0 011.414 0A6.967 6.967 0 0116 9a6.967 6.967 0 01-2.859 3.794 1 1 0 01-1.414-1.414A4.967 4.967 0 0014 9a4.967 4.967 0 00-2.273-2.38 1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Speak
                  </button>
                  <div className="gt-char-count">{charCount} / 5000</div>
                </div>
              </div>
              {/* Context panel */}
              <div className="gt-input-panel">
                <div className="gt-panel-header">
                  <div className="gt-panel-title">Context (optional)</div>
                </div>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Add context to improve translation quality..."
                  className="gt-textarea"
                />
              </div>
            </div>

            {/* Right column (Output panel) */}
            <div className="gt-output-panel md:row-span-2 flex flex-col">
              <div className="gt-panel-header">
                <div className="gt-panel-title">{toLanguage}</div>
              </div>
              <div className="gt-output-content flex-grow">
                {transcription && (
                  <div className="gt-transcription gt-fade-in text-sm text-gray-500 pb-2 mb-2 border-b">
                    {transcription}
                  </div>
                )}
                {translation ? (
                  <div className="gt-fade-in">{translation}</div>
                ) : (
                  <div className="gt-output-placeholder">Translation will appear here</div>
                )}
              </div>
              <div className="gt-panel-controls">
                <button
                  className="gt-control-btn"
                  onClick={() => copyToClipboard(translation)}
                  type="button"
                  disabled={!translation}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy
                </button>
                <button
                  className="gt-control-btn"
                  onClick={() => speakText(translation, toLanguage)}
                  type="button"
                  disabled={!translation}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.168 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.168l4.215-3.824zm2.344 2.13a1 1 0 011.414 0A6.967 6.967 0 0116 9a6.967 6.967 0 01-2.859 3.794 1 1 0 01-1.414-1.414A4.967 4.967 0 0014 9a4.967 4.967 0 00-2.273-2.38 1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Speak
                </button>
              </div>
            </div>
          </div>

          {/* Explanation */}
          {explanation && (
            <div className="gt-explanation gt-fade-in">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-medium text-sm mb-1">Explanation</div>
                  <div>{explanation}</div>
                </div>
              </div>
            </div>
          )}

          {/* Translate button */}
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim() || !apiKey.trim()}
            className="gt-translate-btn"
          >
            {isLoading ? (
              <div className="gt-loading">
                <div className="gt-spinner"></div>
                Translating...
              </div>
            ) : (
              'Translate'
            )}
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
