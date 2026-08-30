@AGENTS.md

# AirAware

## What this is
AirAware is a web app that helps people plan outdoor activities by showing environmental conditions (weather, UV, air quality) through a chat interface and a dashboard.

## Standing rules
- Keep everything as simple as possible; build nothing I haven't asked for.
- After each change, explain what changed in plain English.
- Ask before touching anything outside this project folder.

## What's placeholder
- All environmental data (temperature, precipitation, UV, air quality, sunrise/sunset) comes from `src/lib/mockWeather.ts`, a deterministic fake-data generator — not a real weather API. It only backs the dashboard (`src/app/dashboard/page.tsx` + `src/components/dashboard/`) now.
- The chat screen (`src/app/page.tsx` + `src/components/chat/`) sends each message to the real AirAware backend (`backend/`, deployed at `https://christy-project-production.up.railway.app`) and shows its reply — not mock data. The backend itself calls a real model; see `backend/agent.py`.

## How to run it
npm run dev, then open http://localhost:3000
