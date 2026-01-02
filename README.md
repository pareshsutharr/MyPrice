# MyPrice Finance Tracker PWA

Modern finance tracking experience with a neon-dark UI, optimized for Android web installs with offline-ready PWA support. The project is split into a Vite + React frontend, an Express + MongoDB backend, and a shared module for constants/datasets.

## Tech Stack

- React 19 + Vite + TailwindCSS (dark neon dashboard, responsive + floating action button)
- Recharts for analytics (trend, bar, pie)
- Node.js + Express API with MongoDB Atlas via Mongoose
- Vite PWA plugin (manifest, icons, offline cache, install prompt)
- Shared seed data + constants reused by both tiers

## Project Structure

```
frontend/   # React PWA codebase
backend/    # Express API + MongoDB seed scripts
shared/     # Categories, defaults, and Mongo-ready seed data
```

## Getting Started

### 1. Shared module (no install required)

`shared/` contains `constants.js` and `data/seedData.js` that both the API and UI import. No build step is required.

### 2. Backend (Express API)

```bash
cd backend
npm install
cp .env.example .env
# update .env with:
# MONGODB_URI=...
# PORT=4000
# GOOGLE_CLIENT_ID=your-web-oauth-client-id
# JWT_SECRET=some-long-random-string

# Seed historical data once (requires SEED_USER_EMAIL in .env)
npm run seed

# Start the API
npm run dev
```

Available routes:

- `GET/POST/PUT/DELETE /api/expenses`
- `GET/POST /api/income`
- `GET/POST/PUT /api/loans`
- `GET/POST/PUT/DELETE /api/investments`
- `POST /api/investments/import/statement`
- `POST /api/investments/import/upload` (multipart CSV/XLSX statement ingestion)
- `GET /api/stats`

The stats route powers the dashboard with balance calculations, category distribution, EMI reminders, and monthly aggregates.

### 3. Frontend (React PWA)

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL and VITE_GOOGLE_CLIENT_ID
npm run dev            # starts Vite dev server
npm run build          # creates the optimized PWA build (validated in this task)
```

Key UI features:

- Dashboard: total balance, monthly credit/debit/savings, trend chart, EMI reminder popup, quick actions, floating add button.
- Daily Expenses: form + category icons/colors, filters (search/date range), responsive table.
- Loans & EMI: loan form with automatic remaining/interest/progress calculations, separate active/completed lists.
- Investments: manual Groww/Angel One SIP tracker with broker filters plus CSV/XLSX statement uploads (auto dedupe + progress feedback).
- Google login: secure Google OAuth with token-based API access so every user only sees their own data.
- Reports: bar chart for monthly expenses, pie chart for category distribution, salary 50/30/20 split cards.
- Settings: editable default currency and custom categories stored locally.

PWA details:

- Manifest (`frontend/public/manifest.json`) with neon icons.
- `vite-plugin-pwa` auto-generates the service worker; `registerSW()` is wired in `src/main.jsx`.
- Add-to-home-screen ready with offline caching for shell assets and Google Fonts.

## MongoDB Seed Data

The seed script automatically loads:

- Day-wise expenses from 13–18 Dec (multiple categories)
- MPokket (5 entries), FDPL, Phone, True Balance, and Divesh personal loans
- Salary + freelance inflows with 50/30/20 tracking

Run it anytime via:

```bash
cd backend
npm run seed
```

The script is idempotent (skips collections that already contain documents).

## Deployment Notes

1. Deploy backend (e.g., Render, Railway, Vercel functions) with `NODE_ENV=production`.
2. Configure `frontend/.env` `VITE_API_URL` to the deployed API URL, rebuild (`npm run build`), and host the `dist/` output on a static host.
3. Ensure HTTPS for both tiers so that the PWA install prompt is available.

## Verification

- `frontend`: `npm run build` (passes, generates PWA bundle + service worker).
- Backend endpoints exercised locally via context provider; Mongo connection/seed script are ready with `.env`.

With these pieces in place, you can track expenses, loans, and reports, seed historical MPokket + EMI data, and install the progressive web app on Android or desktop. Enjoy the neon cockpit!
# MyPrice
