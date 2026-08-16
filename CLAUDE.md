@AGENTS.md

# AirAware

## What this is
AirAware is a web app that helps people plan outdoor activities by showing environmental conditions (weather, UV, air quality) through a chat interface and a dashboard.

## Standing rules
- Keep everything as simple as possible; build nothing I haven't asked for.
- After each change, explain what changed in plain English.
- Ask before touching anything outside this project folder.

## What's placeholder
- All environmental data (temperature, precipitation, UV, air quality, sunrise/sunset) comes from `src/lib/mockWeather.ts`, a deterministic fake-data generator seeded from the plan details — not a real weather API.
- The chat flow (`src/app/page.tsx` + `src/components/chat/`) and the dashboard (`src/app/dashboard/page.tsx` + `src/components/dashboard/`) are both fully wired up and functional, just running on mock data.
- Saved plans persist to the browser's `localStorage` (`src/lib/savedPlans.ts`), not a real backend/database.

## How to run it
npm run dev, then open http://localhost:3000
