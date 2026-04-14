# THE WIRE — Global Intelligence Dashboard

Your personal global news intelligence platform with curated sources across the political spectrum.

## Features

- **11 instant-loading news tabs** powered by NewsAPI (< 1 second load times)
- **2 AI-powered tabs** (Weekly Brief & War/Conflict deep-dive) with timelines, historical parallels, and multi-perspective analysis
- **Curated elite source list**: Reuters, AP, BBC, FT, Bloomberg, Foreign Affairs, Nature, The Hindu, and 40+ more
- **Source lean badges** on every article (Left → Right, Independent, Public)
- **Dictionary & Vocab Builder**: Select any word → get definition → save to persistent vocabulary list
- **US Politics** with Domestic / International / Washington State sub-tabs
- **India** with Domestic / Foreign Policy / Economy / Society sub-tabs

## Setup (5 minutes)

### 1. Get API Keys

**NewsAPI** (free):
- Go to https://newsapi.org/register
- Sign up → copy your API key
- Free tier: 100 requests/day (plenty for personal use)

**Anthropic** (for AI features):
- Go to https://console.anthropic.com
- Create an account → add $5 credit → copy your API key
- Only used for Weekly Brief, Conflict tab, and dictionary

### 2. Deploy to Vercel (free)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → Sign in with GitHub
3. Click "Import Project" → select your repo
4. In **Environment Variables**, add:
   - `NEWSAPI_KEY` = your NewsAPI key
   - `ANTHROPIC_API_KEY` = your Anthropic key
5. Click Deploy

Your site will be live at `https://your-project.vercel.app`

### 3. Local Development (optional)

```bash
# Copy env file and add your keys
cp .env.local.example .env.local

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open http://localhost:3000

## Architecture

```
News tabs (11) → /api/news → NewsAPI.org → instant results
AI tabs (2)    → /api/ai   → Anthropic API + web search → deep analysis
Dictionary     → /api/define → Anthropic API → definitions
```

API keys are stored server-side in environment variables — never exposed to the browser.

## Source List

| Category | Outlets |
|----------|---------|
| Home | Reuters, AP, BBC, Al Jazeera, France 24, DW, FT, Bloomberg, The Economist, Foreign Affairs |
| Business | FT, Bloomberg, The Economist, WSJ, NYT, Nikkei Asia, SCMP, Reuters |
| Science | Nature, Science, Scientific American, STAT News, Quanta Magazine |
| Intl Relations | Foreign Affairs, Foreign Policy, ICG, Politico, CFR, The Hindu, The Diplomat |
| War & Conflict | Reuters, BBC, Al Jazeera, War on the Rocks, Defense News, AP |
| Society | The Atlantic, The Guardian, The Economist, National Review, Reuters |
| Entertainment | Variety, Hollywood Reporter, Deadline |
| AI & Tech | MIT Tech Review, Ars Technica, IEEE Spectrum, FT, Bloomberg, Semafor |
| US Politics | MSNBC, The Nation, Reuters, AP, PBS, WaPo, Fox News, The Dispatch, WSJ |
| India | The Hindu, Indian Express, NDTV, Times of India, Hindustan Times |
| Underreported | Rest of World, Africa Report, Al Jazeera, DW, France 24 |
