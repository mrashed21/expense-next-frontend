# Expense Tracker — Frontend

A free, mobile-first personal & business finance tracker. Track income, expenses, budgets, and savings with real-time analytics. Built with **Next.js 16 (App Router)**, **React 19**, and **TypeScript**.

## Tech Stack

| Concern               | Technology                                                           |
| --------------------- | -------------------------------------------------------------------- |
| Framework             | Next.js 16 (App Router, standalone output)                           |
| UI                    | React 19, Tailwind CSS 4, shadcn/ui (Radix primitives), lucide-react |
| State / data fetching | Redux Toolkit + RTK Query                                            |
| Forms & validation    | react-hook-form + Zod                                                |
| Realtime              | Ably                                                                 |
| Charts                | Recharts                                                             |
| Exports               | jsPDF / jsPDF-AutoTable, @react-pdf/renderer, xlsx                   |
| Theming               | next-themes (light/dark)                                             |
| Testing               | Playwright (E2E)                                                     |
| Package manager       | pnpm                                                                 |

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, register, OTP verify, password reset, admin login
│   │   ├── (dashboard)/       # Authenticated app: dashboard, transactions, budgets, admin panel, etc.
│   │   ├── api/                 # Route handlers (e.g. health check)
│   │   ├── layout.tsx, page.tsx  # Root layout & landing page
│   │   └── manifest.ts, sitemap.ts
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── layout/              # Sidebar, header, mobile nav, command palette
│   │   ├── custom/               # Domain widgets (PDF reports, date pickers, cropper, etc.)
│   │   ├── admin/                 # Admin-only components
│   │   └── auth/                   # Auth guards, password strength meter
│   ├── services/             # RTK Query API slices (one per domain)
│   ├── redux/                 # Store + slices (auth, layout)
│   ├── hooks/                   # use-realtime, use-socket, use-currency, use-debounce
│   ├── providers/                 # Redux, auth, theme, toast providers
│   ├── lib/                         # utils, navigation config, export helpers
│   └── proxy.ts               # Edge middleware — route protection via accessToken cookie
├── public/                    # Icons, PWA assets, OG image
└── next.config.ts               # Rewrites /api/* to the backend
```

## Features

- **Dashboard & Analytics** — spending overview, trends, category breakdowns
- **Transactions** — income/expense records with categories, search, and saved filters
- **Accounts & Transfers** — multiple accounts (bank/cash/wallet), inter-account transfers, credit statement handling
- **Budgets & Goals** — budget planning and savings goal tracking
- **Bills, Recurring & Installments** — recurring transactions, bill reminders, installment plans
- **Net Worth, Investments, Assets & Debts** — portfolio and liability tracking
- **Reports & Calendar** — exportable reports (PDF/Excel) and a calendar view of financial events
- **Notifications** — real-time in-app notifications via Ably
- **Admin Panel** — user management, activity logs, system health, broadcast messaging, feedback/review moderation (role-gated: admin / super admin)
- **Auth** — registration with OTP email verification, login with optional 2FA, forgot/reset password, "logout all devices"
- **PWA-ready** — installable manifest with app icons
- **Dark/light theme** support

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- The [backend API](../backend) running locally or deployed

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Public API base URL used by the browser
NEXT_PUBLIC_API_URL=http://localhost:5005/api/v1

# Backend origin used by next.config.ts to proxy /api/* requests
# (overridable per-environment, e.g. for Docker networking)
BACKEND_URL=http://localhost:5005

# Ably public key for realtime notifications
NEXT_PUBLIC_ABLY_KEY=
```

### Run in Development

```bash
pnpm dev
```

Runs the app at `http://localhost:3000`.

### Build & Run in Production

```bash
pnpm build
pnpm start
```

### Lint

```bash
pnpm lint
```

### End-to-End Tests

```bash
pnpm test:e2e
```

Runs the Playwright test suite.

## Routing & Auth Guard

- Route groups: `(auth)` for public authentication pages, `(dashboard)` for the authenticated app shell.
- `src/proxy.ts` (Next.js middleware) allows public routes (`/`, `/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password`, `/admin-login`, static assets, and `/api/*`) through unchecked, and redirects any other route to `/login` when no `accessToken` cookie is present.
- API requests from the browser are proxied through Next.js (`/api/*` → `BACKEND_URL`), avoiding CORS issues and keeping the backend origin server-side configurable.

## Deployment

Configured for Vercel with `output: "standalone"`, making it equally deployable in a Docker container. Set `BACKEND_URL` to point at the backend deployment (defaults to the production backend URL if unset).
