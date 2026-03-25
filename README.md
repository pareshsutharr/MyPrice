# MyPrice / MoneyXP

MyPrice is a full-stack personal finance dashboard for tracking expenses, income, loans, investments, reports, banking references, tax estimates, and a document vault from one place.

The project uses a React 19 + Vite frontend and an Express 5 + MongoDB backend. It is designed for a split deployment model such as Vercel for the frontend and Railway or Render for the API.

## Highlights

- Expense and income tracking with filters, bulk selection, and history
- Loan and EMI management with payment and undo flows
- Mutual fund and investment tracking with CSV/XLSX import support
- Documents vault with folders, upload progress, breadcrumbs, preview, inline rename, and drag/drop move
- Local-only banks MVP for linked account references
- ITR estimation workspace with year-based draft persistence
- Dashboard analytics, reports, reminders, and transaction history
- Google login plus optional developer login for local development
- PWA-ready frontend built with Vite

## Tech Stack

### Frontend

- React 19
- Vite
- React Router 7
- Axios
- Recharts
- Lucide React
- Tailwind CSS + custom CSS
- react-hot-toast

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT authentication
- Google Auth Library
- Multer
- XLSX
- Morgan
- CORS

## Repository Structure

```text
MyPrice/
├── frontend/   # React app
├── backend/    # Express API
├── shared/     # Shared constants / seed data
└── README.md
```

## Core Features

### Finance

- Expenses: create, edit, delete, filter, bulk delete
- Income: create, edit, delete, filter, bulk delete
- Loans: add loan, record EMI, undo EMI, delete loan, active/completed sections
- History: merged feed of expenses, income, and EMI activity
- Reports: monthly expenses, category split, 50/30/20 view

### Investments

- Manual mutual fund / investment entry
- Broker grouping and top holdings
- CSV/XLSX import flow
- Import queue with real upload progress and retry handling
- Import template download

### Documents Vault

- Folder-based vault
- File uploads with progress bar
- 50 MB per-user storage cap
- Breadcrumb navigation
- Right-click context menu
- Inline rename
- Multi-select + bulk delete
- Drag and drop move into folders
- Preview support for images, PDFs, and CSV files

### Local Productivity Surfaces

- Banks page with local-only linked account storage
- ITR estimation page with draft persistence in localStorage
- Settings for theme, mode, currency, date format, and categories

## Application Flow

- Frontend entry: `frontend/src/main.jsx`
- App routes: `frontend/src/App.jsx`
- Main shell: `frontend/src/layout/DashboardLayout.jsx`
- Auth context: `frontend/src/context/AuthContext.jsx`
- Finance context: `frontend/src/context/FinanceContext.jsx`
- Backend entry: `backend/src/index.js`
- API base: `/api/*`

All non-auth backend routes are protected by JWT middleware.

## Local Development

## 1. Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:4000
```

### Backend environment

Create `backend/.env` with values like:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
GOOGLE_CLIENT_ID=your_google_web_client_id
ENABLE_DEV_LOGIN=true
```

## 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

### Frontend environment

Create `frontend/.env` with values like:

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
VITE_ENABLE_DEV_LOGIN=true
```

## 3. Shared data

`shared/` contains constants and seed data used across the app. No separate install step is required.

## Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```bash
npm run dev
npm start
npm run seed
npm run reset
```

## Main API Areas

### Auth

- `POST /api/auth/google`
- `POST /api/auth/dev-login`

### Expenses

- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

### Income

- `GET /api/income`
- `POST /api/income`
- `PUT /api/income/:id`
- `DELETE /api/income/:id`

### Loans

- `GET /api/loans`
- `POST /api/loans`
- `PUT /api/loans/:id`
- payment and undo-payment routes

### Investments

- `GET /api/investments`
- `POST /api/investments`
- `PUT /api/investments/:id`
- `DELETE /api/investments/:id`
- `POST /api/investments/import`
- `GET /api/investments/import/template`

### Documents

- `GET /api/documents`
- `POST /api/documents/folders`
- `POST /api/documents/upload`
- `POST /api/documents/move`
- `PATCH /api/documents/:id`
- `DELETE /api/documents/:id`
- `GET /api/documents/:id/content`

### Aggregates

- `GET /api/stats`
- `GET /api/history`

## Import Template

Investment import supports:

- `.csv`
- `.xlsx`
- `.xls`

The sample import template is available at:

- Frontend static file: `frontend/public/sample-import-template.xlsx`
- Backend route: `GET /api/investments/import/template`

Expected columns:

- `Scheme Name`
- `ISIN`
- `Broker`
- `Units`
- `Buy Price`
- `Current Price`
- `Date`

## Authentication Notes

- JWT auth is stored in localStorage under `myprice-auth`
- Google Sign-In is supported through backend token verification
- Developer login can be enabled locally with:
  - `ENABLE_DEV_LOGIN=true` in backend
  - `VITE_ENABLE_DEV_LOGIN=true` in frontend
- Dev login should not be enabled in production

## Deployment

### Frontend

Recommended: Vercel

Required environment variables:

```env
VITE_API_URL=https://your-backend-url/api
VITE_GOOGLE_CLIENT_ID=your_google_web_client_id
VITE_ENABLE_DEV_LOGIN=false
```

### Backend

Recommended: Railway or Render

Required environment variables:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
GOOGLE_CLIENT_ID=your_google_web_client_id
ENABLE_DEV_LOGIN=false
NODE_ENV=production
```

## Current State

Implemented and working:

- Core finance CRUD
- Dashboard + reporting
- Investment manual tracking
- CSV/XLSX investment import
- Document vault
- Local banks MVP
- ITR estimation MVP

Still worth improving:

- Automated tests
- Production hardening
- CORS tightening
- Pagination for large lists
- Document storage abstraction for future object storage migration

## Verification

Frontend production build:

```bash
cd frontend
npm run build
```

## Contributing

1. Create a branch
2. Make your changes
3. Run the relevant local checks
4. Open a pull request

## License

Private project unless the repository owner specifies otherwise.
