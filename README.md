# Algeria Opportunity Radar

Aggregates European scholarships for Algerian students and CS internships in Algeria using compliant data sources, intelligent filtering, and a polished Next.js interface optimised for Vercel.

## Features

- Automated ingestion from public RSS feeds (Opportunity Desk, Scholarship Positions) and Remotive's jobs API with per-source compliance notes.
- Curated fallback catalogue for high-impact programmes (Erasmus+, DAAD, Yassir, Innovation Cluster Algiers).
- Intelligent scoring that prioritises Algerian relevance, STEM keywords, funding indicators, and upcoming deadlines.
- Rich filtering UI (keywords, type, mode, funding, tags, min confidence) with JSON export of filtered results.
- Telegram digest endpoint for pushing filtered updates via the Telegram Bot API (no protected scraping).
- Compliance dashboard explaining guardrails and ingestion cadence.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Environment Variables

Optional Telegram integration requires:

```bash
export TELEGRAM_BOT_TOKEN="123456:abcdef..."
```

### Available Scripts

- `npm run dev` – local development
- `npm run lint` – lint with `eslint-config-next`
- `npm run build` – production build
- `npm start` – run built app

## API Surface

- `GET /api/opportunities` – returns aggregated opportunities with optional query params:
  - `?type=scholarship&type=internship`
  - `?q=ai`
  - `?mode=remote`
  - `?country=Algeria`
  - `?tag=machine learning`
  - `?minConfidence=0.6`
  - `?deadlineWithinDays=30`
- `POST /api/telegram/digest` – body: `{ "chatId": "12345", "limit": 6, "filters": { ... } }`

## Data Sources & Compliance

- **Opportunity Desk (RSS)** – public feed attributed in UI; polled hourly.
- **Scholarship Positions (RSS)** – public feed; polled twice daily.
- **Remotive (API)** – respects attribution policy; filtered to internships referencing Algeria/Africa.
- **Curated Partners** – manually verified listings for Erasmus+, DAAD, Yassir, Innovation Cluster Algiers.
- **Explicit exclusions** – LinkedIn, Glassdoor, DAAD protected areas, and other anti-scraping platforms.

Each source carries embedded compliance notes surfaced to users. Items with low certainty are flagged for manual review.

## Telegram Usage

1. Create a Telegram bot via `@BotFather` and retrieve the token.
2. Set `TELEGRAM_BOT_TOKEN` in the deployment environment.
3. Call `POST /api/telegram/digest` with a `chatId` (user, group, or channel where the bot is authorised).
4. The API sends a formatted digest using the latest filtered results.

## Deployment

This project is ready for Vercel deployment. After running `npm run build` locally, deploy with:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-feda284b
```

Once deployed, verify with:

```bash
curl https://agentic-feda284b.vercel.app
```

## License

MIT
