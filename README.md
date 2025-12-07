# Clanker Translate

A modern, AI-powered translation web application built with React, TypeScript, and Vite. Translate text between multiple languages using OpenRouter's AI models.

🌐 **Live Demo:** [https://quasarbright.github.io/clanker-translate](https://quasarbright.github.io/clanker-translate)

## Features

- 🌍 Support for 11 languages including English, Japanese, Spanish, French, German, Chinese, Korean, Arabic, Russian, and Portuguese
- 🤖 Multiple AI models via OpenRouter (GPT-4, GPT-3.5, Claude, etc.)
- 📝 Context-aware translations with explanations
- 🔤 Phonetic transcriptions for different writing systems
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Dark theme optimized for readability
- 💾 Local storage for API keys and preferences
- ♿ WCAG 2.1 Level AA accessibility compliant
- 🔒 Secure with Content Security Policy

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- An OpenRouter API key ([Get one here](https://openrouter.ai/keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/quasarbright/clanker-translate.git
cd clanker-translate

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

```bash
npm run deploy
```

Will deploy to github pages

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Project Structure

```
src/
├── components/       # React components
├── services/        # API and storage services
├── constants/       # Language definitions and constants
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── __tests__/      # Test files
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **OpenRouter API** - AI translation backend

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
