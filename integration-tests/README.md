# Backend Integration Tests

These tests make real API calls to OpenRouter and **cost money** to run. They are designed to verify that the translation functionality works end-to-end with the actual API.

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your OpenRouter API key to `.env`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   ```

3. Get an API key from [OpenRouter](https://openrouter.ai/keys)

## Running the Tests

```bash
# Run only backend integration tests
npm run test:integration

# Run regular unit tests (does NOT include integration tests)
npm test
```

## What Gets Tested

The backend integration tests cover:

1. **API Key Validation** - Verifying valid and invalid keys
2. **Basic Translation** - English to Japanese with transcription
3. **Context-Aware Translation** - Translation with additional context
4. **Same Writing System** - Translation between similar scripts (English to Spanish)
5. **Error Handling** - Invalid model names and error responses

## Cost Considerations

- Tests use free or cheap models when available (e.g., `gemini-flash`)
- Only 3-4 translation requests are made per test run
- Each test has a 30-second timeout
- Tests are skipped by default if no API key is provided

## Notes

- The `.env` file is gitignored and will not be committed
- Tests may fail if rate limits are hit
- Some models may not be available depending on your OpenRouter account
