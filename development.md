# Development Plan - Clanker Translate

## Overview
This document outlines the development strategy for building a client-side LLM-powered translation web app with AI assistance. Focus: **working prototype fast, polish later**.

## Development Philosophy
- **Prototype-first:** Get it working quickly, iterate based on usage
- **AI-assisted development:** Leverage AI for rapid implementation
- **Minimum viable complexity:** Skip production concerns initially
- **User-centric:** Context-aware translations that beat Google Translate

---

# Phase 1: Working Prototype (2-3 days)

## Scope
Basic translation functionality with clean UI and provider flexibility.

## Core Features (Minimum Viable)
- [ ] Text input/output with simple language dropdowns
- [ ] Context field for better translations
- [ ] "Explain" toggle for elaboration
- [ ] One working provider (start with OpenAI)
- [ ] Basic API key input (no persistence initially)
- [ ] Simple responsive UI that works on phone

## Technical Implementation

### Rapid Setup
- **Framework:** React + Vite (TypeScript optional initially)
- **Styling:** Tailwind CSS (copy paste components)
- **State Management:** Simple useState hooks (no external state lib needed yet)
- **Storage:** Skip for now (just session state)
- **Build:** Default Vite build, deploy to GitHub Pages later

### Minimal File Structure
```
src/
├── App.tsx                   # Main app component (everything in one file initially)
├── main.tsx                  # Entry point
└── index.css                 # Tailwind imports
```

**Start simple, split components later when they get unwieldy.**

### Simple OpenAI Integration
```typescript
// Start with just a simple function, abstract later
async function translateWithOpenAI(text: string, fromLang: string, toLang: string, context: string, explain: boolean, apiKey: string) {
  const prompt = `Translate from ${fromLang} to ${toLang}: "${text}"${context ? ` Context: ${context}` : ''}${explain ? ' Also explain your translation choices.' : ''}`;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

**Keep it simple. Add structure when needed.**

## Rapid Prototype Milestones

### Day 1: Get It Working
- [x] Project setup (Vite + React + Tailwind) ✅ **COMPLETED**
- [x] Single App.tsx with basic form UI ✅ **COMPLETED** 
- [x] Gemini API integration (default) ✅ **COMPLETED**
- [x] Text input → translation output ✅ **COMPLETED**
- [x] API key input field ✅ **COMPLETED**

**🎉 MVP Core Working! Ready for testing with real API key.**

### Day 2: Make It Useful
- [x] Add language dropdowns (Japanese, Spanish, English) ✅ **COMPLETED**
- [ ] Context field and explain toggle
- [ ] Basic error handling (API key wrong, network error)
- [ ] Make it look decent on mobile
- [ ] Deploy to GitHub Pages

### Day 3: Polish & Test
- [ ] Copy translation to clipboard
- [ ] Loading states and better UX
- [ ] Test with multiple language pairs
- [ ] Fix any obvious issues

## Success Criteria (Phase 1)
- [ ] Can translate between common languages with context
- [ ] Works on phone browser
- [ ] Deployed and shareable
- [ ] Provides better translations than Google Translate

**Total time: 1-3 days, not weeks!**

---

# Phase 2: Make It Better (3-5 days)

**Only do this after Phase 1 is working and you've used it!**

## Quick Wins
- [ ] Save API key in localStorage (with warning)
- [ ] Add translation history (simple list)
- [ ] Better prompting for cultural context
- [ ] Add Claude/Anthropic as second provider option
- [ ] Improve mobile UI based on real usage

## If Time Permits
- [ ] Streaming responses (nice to have)
- [ ] Copy/share individual translations  
- [ ] Basic favorites for common phrases
- [ ] Better error messages

---

# Phase 3: Enhanced Features (1-2 weeks)

**Do this when you're actively using the app and identify pain points!**

## Focus on Real Needs
- [ ] **Better Context Handling**
  - Formality level hints in prompts (formal/casual)
  - Situational context presets (business, casual, travel, etc.)
  - Explain cultural nuances in elaborations

- [ ] **Learning Helpers**
  - Alternative translation suggestions
  - Grammar explanations for complex sentences
  - Pronunciation guides when available

- [ ] **User Experience** 
  - Quick phrase buttons for common translations
  - Voice input (Web Speech API) for convenience
  - Offline backup of frequently used phrases

## Maybe Later
- [ ] Camera OCR for text in images (if really needed)
- [ ] Full vocabulary tracking system

---

# Future Ideas (Do Later)

## Mobile App (If Web Version Gets Traction)
- **Option A:** Capacitor wrapper (fastest)
- **Option B:** React Native rewrite (better UX)

## Advanced Learning Features (If You Become a Regular User)
- Vocabulary tracking and progress
- Spaced repetition for phrases you translate often
- Grammar pattern recognition
- Cultural appropriateness scoring

**Rule: Don't build these unless you're actively missing them!**

---

# Prototype Guidelines

## Keep It Simple
- **No tests initially** - just make it work
- **No TypeScript strict mode** - use `any` liberally for speed
- **No complex state management** - useState is fine
- **No premature optimization** - worry about performance later

## Security Basics
- **Don't log API keys** to console
- **Warn users** about API key storage
- **Basic error handling** so app doesn't crash

## Quality Later
- Add tests when core features stabilize
- Add TypeScript strictness after prototype works
- Optimize performance when you have real usage data

## Easy Deployment
- **Development:** `npm run dev`
- **Production:** `npm run build` → drag `dist/` folder to Netlify/Vercel
- **Later:** Set up automatic deployment if app is useful

---

# Realistic Timeline

| Phase | Duration | Goal |
|-------|----------|------|
| Phase 1 | 1-3 days | Working translator you can use |
| Phase 2 | 3-5 days | Polish and convenience features |
| Phase 3 | 1-2 weeks | Enhanced context and learning features |
| Future | When needed | Mobile app, advanced features |

**Total to useful app: 1 week max**

## Success Metric
**Do users prefer this over Google Translate for context-aware translations?**

If yes → add more features  
If no → figure out why not

Simple as that!
