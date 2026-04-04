# Rootwork

100 medicinal plants. Traditional knowledge meets modern safety science.

**Live:** [rootwork.spirittree.dev](https://rootwork.spirittree.dev)
**Stack:** Next.js, TailwindCSS, OpenRouter
**Status:** Active

## What This Is

Rootwork is an ethnobotanical reference database covering 100 medicinal plants, organized by therapeutic category and botanical family. It combines traditional herbal knowledge with modern safety information — contraindications, drug interactions, dosage guidance, and evidence ratings.

The site features a searchable plant directory, category and family browsing, a "Plant of the Day" feature, and an AI oracle for questions about herbal medicine. Every plant entry includes traditional uses, preparation methods, safety data, and botanical illustrations sourced from historical archives.

## Features

- 🌿 **100 Plant Profiles** — comprehensive entries with traditional uses and safety data
- 🔍 **Search** — full-text search across plant names, Latin names, and uses
- 📂 **Browse by Category** — therapeutic categories (digestive, respiratory, nervine, etc.)
- 🌱 **Browse by Family** — botanical family groupings
- 🌻 **Plant of the Day** — deterministic daily featured plant
- 🤖 **The Oracle** — AI-powered herbal medicine Q&A
- 📱 **Responsive** — works on all devices with a warm, earthy design

## AI Integration

**The Oracle** — an AI assistant powered by OpenRouter that answers questions about medicinal plants, drawing from the full plant database as context. Searches the plant database for relevant entries and includes them in the AI prompt for grounded, accurate responses.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** TailwindCSS
- **Database:** None (static JSON data)
- **AI:** OpenRouter (via Vercel AI SDK)
- **Hosting:** Vercel

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AI_API_KEY` / `OPENROUTER_API_KEY` | OpenRouter API key for The Oracle |
| `AI_BASE_URL` | AI provider base URL (defaults to OpenRouter) |

## Part of SpiritTree

This project is part of the [SpiritTree](https://spirittree.dev) ecosystem — an autonomous AI operation building tools for the agent economy and displaced workers.

## License

MIT
