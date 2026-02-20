# Node.js API

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:8080` and serves both API + frontend.

## Storage

- Current implementation persists reports in `data/reports.json` for fast local development.
- PostgreSQL and MongoDB schemas are provided in `../database` for production migration.

## Production Integration Idea

- Replace `services/reportStore.js` with PostgreSQL insert/select and MongoDB telemetry writes.
- Keep API contracts unchanged so frontend remains stable.
