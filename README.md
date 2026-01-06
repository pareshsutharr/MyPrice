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
# ENABLE_DEV_LOGIN=true   # optional, enables /api/auth/dev-login for teammates

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
cp .env.example .env   # set VITE_API_URL, VITE_GOOGLE_CLIENT_ID, VITE_ENABLE_DEV_LOGIN
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

## Google Sign-In Configuration

- Create a Web OAuth client in Google Cloud Console and add every dev origin you use (e.g. `http://localhost:5173`, `https://mypricefrontend.onrender.com`) under **Authorized JavaScript origins**. If the current origin is missing you will see the `The given origin is not allowed for the given client ID` 403 error coming from the Google button iframe.
- Copy the generated client ID to both `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`). The backend uses it to verify ID tokens, the frontend uses it to render the Google button.
- Chrome’s FedCM / one-tap flows require third-party sign-in permission. If a tester blocks it they will see `FedCM was disabled...`. Either re-enable the permission from the site settings or use the standard button-only login (no one-tap) provided in this repo.
- When onboarding teammates who do not have a Google OAuth client, set `ENABLE_DEV_LOGIN=true` (backend) and `VITE_ENABLE_DEV_LOGIN=true` (frontend). This exposes `/api/auth/dev-login`, a local-only entry point that accepts an email and issues a JWT so the rest of the app can be exercised without Google. Never enable it in production.

## Verification

- `frontend`: `npm run build` (passes, generates PWA bundle + service worker).
- Backend endpoints exercised locally via context provider; Mongo connection/seed script are ready with `.env`.

With these pieces in place, you can track expenses, loans, and reports, seed historical MPokket + EMI data, and install the progressive web app on Android or desktop. Enjoy the neon cockpit!
# MyPrice
