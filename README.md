# Finch Financial (WIP)

## Premise

An internal operations console for a fictional neobank that your predecessor built, but left unfinished. Current capabilities include:

- Viewing and filtering customer accounts
- Inspecting transactions across all accounts
- Adding internal memos to accounts
- Viewing account audit log history

Management has a short list of features they want added. **Your job is to ship one of them today using spec-driven development.**

---

## What the starter app does

A running full-stack app with the following functionality already built:

- Sign in via email and password (all users share the password `Password123!`)
- Browse and filter a list of customer accounts by status and name
- Search and filter transactions across all accounts globally
- View an account's detail page with recent transactions, internal memos, and audit log
- *RBAC:* analysts see active and frozen accounts; supervisors can also see closed accounts
    - Only supervisors can add memos; analysts can read but not write

---

## Product requests

Two features are available as workshop exercises. Pick one.

**1. Freeze and unfreeze customer accounts when suspicious activity is detected.**

> **User story:** An ops analyst notices Big Bread Bakery has 15 suspicious cash deposits just under $10,000. They can't freeze the account themselves as that requires a supervisor. They flag it to their supervisor, who logs in and freezes the account with a reason.


**2. Flag suspicious transactions for follow-up review, with a supervisor resolution workflow.**

> **User story:** An analyst is reviewing the transactions list and notices Tran Consulting Group has a series of rapid international wires in both directions. They flag a transaction with a reason. The flag appears in a queue. A supervisor reviews it and resolves it.

See [`product-requests.md`](product-requests.md) for further details.

---

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite + TypeScript | React 19, Vite 8 |
| Styling | Tailwind CSS | v4 (via Vite plugin) |
| Routing | React Router | v7 |
| Backend | Node.js + Express | Express v5 |
| Database | SQLite (better-sqlite3) | — |
| ORM | Drizzle ORM | v0.45 |
| Auth | bcrypt + JWT | — |
| Testing | Vitest | v3 |
| Containers | Podman + podman-compose (optional) | — |
| Language | TypeScript | v5 |

TypeScript (v5) and Vitest (v3) are pinned to the last stable version before major releases to ensure compatibility with the coding agent used in this workshop. In a production environment, you would use the latest stable versions.

---

## Architecture
```
finch-financial/
├── types.ts              # shared API types — source of truth for API contracts
├── AGENTS.md             # repo conventions for coding agents
├── product-requests.md   # the two workshop features
├── .env.example          # copied to api/.env by `npm run setup`
├── compose.yml           # Podman compose — optional api + web containers
├── scripts/              # setup helpers (env bootstrap, dependency guard)
├── api/                  # Node + Express backend
│   ├── src/
│   │   ├── db/           # Drizzle schema + client
│   │   ├── lib/          # Shared utilities (audit, errors, sanitize, config)
│   │   ├── routes/       # Express route handlers
│   │   ├── services/     # Business logic + RBAC
│   │   ├── repositories/ # Database queries
│   │   ├── middleware/   # Auth + error handling
│   │   ├── types/        # Type definitions (DB types, Express extensions)
│   │   └── __tests__/    # Integration tests
│   ├── drizzle/          # Committed migration files (auto-named by drizzle-kit)
│   └── seed/             # Seed scripts
└── web/                  # React + Vite frontend
    ├── public/           # Static SVG assets
    └── src/
        ├── api.ts        # Fetch wrapper — all HTTP calls go here
        ├── components/   # Shared components (DataTable, Layout, ActivityFeed)
        ├── pages/        # Route-level components
        ├── lib/          # Shared utilities (audit labels)
        └── __tests__/    # Tests (also under pages/ and components/)
```

The backend follows a three-layer architecture: 
- routes handle HTTP concerns
- services own business logic and RBAC
- repositories handle database access. 


---

## Auth
Authentication uses bcrypt password hashing and JWT-signed session cookies.

- Email and password login. All users share the password `Password123!`.
- A signed JWT is stored in an `httpOnly` session cookie (`ops_session`) and verified on every protected request. Log out clears the cookie.
- `JWT_SECRET` is configured via environment variable. In development it falls back to a well-known dev secret so the app runs with no setup; in production it is required. See `.env.example`.

---

## Database

SQLite, stored in a single file (`api/finch.db`) — no server or container required. Five tables: `users`, `accounts`, `transactions`, `memos`, `audit_log`.

All monetary values are stored as `text` and kept as strings end-to-end, never float. Migrations are generated by `drizzle-kit` and should be committed to the repo. 

The flow for schema changes is: update `types.ts` → update `schema.ts` → `npm run db:generate -w api` → `npm run db:migrate -w api` → implement.

---

## Seed data

The database seeds with realistic, story-driven data designed to surface suspicious patterns during exploration:

- **10 users** → 6 analysts, 4 supervisors
- **10 accounts** → 7 active, 2 frozen, 1 closed
- **75 transactions** → distributed across accounts with weighted patterns on notable accounts
- **7 memos** → authored by supervisors with realistic banking language
- **7 audit log entries** → corresponding to the seeded memos

Notable accounts worth exploring:
- **Big Bread Bakery** (frozen) → 15 cash deposits over 60 days, all between $8,000–$9,800
- **Tran Consulting Group** (frozen) → 10 alternating international wires over 72 hours
- **Northgate Properties** (active) → one $280,000 wire to Cayman Holdings Ltd with no prior history

---

## Running locally

**Prerequisites:** Node.js 22 or newer (LTS 22 or 24 recommended). No database server or container runtime needed — SQLite is just a file.

> Node 20 reached end-of-life in April 2026, and `better-sqlite3` requires Node 22+.

```bash
# 1. clone
git clone <repo>
cd finch-financial

# 2. install deps, create api/.env, create the SQLite DB, run migrations, and seed
npm run setup

# 3. start api and web together
npm run dev
```

`npm run setup` creates `api/.env` from `.env.example` if it isn't already there, so there is nothing to copy by hand. Edit that file to customise the port, CORS origin, or JWT secret — re-running setup will not overwrite it.

Every setting also has a sensible default in code, so the app still runs if `.env` is missing or incomplete.

<details>
<summary>Creating it manually</summary>

```bash
cp .env.example api/.env        # Windows: copy .env.example api\.env
```

</details>

Open `http://localhost:5173` and log in with the workshop credentials


**Full container stack** (optional — for demo or review; the primary path above is containerless):

```bash
podman compose up
```

**Reset data:** The seed script is idempotent. To re-seed at any time, run 

```bash
# truncates and reseeds all tables
npm run seed -w api
```

To wipe the database entirely, delete the file and re-create it:
```bash
rm api/finch.db                 # Windows: del api\finch.db
npm run db:migrate -w api && npm run seed -w api
```

---

## Testing

Backend tests use supertest to run the Express app in-process. Each test file runs against its own fresh in-memory SQLite database — no running service, and your seeded dev data (`api/finch.db`) is never touched. Frontend tests mock fetch and are fully standalone.

```bash
# Everything
npm test

# Backend tests (no database setup needed)
npm test -w api

# Frontend tests (standalone)
npm test -w web

# Run specific file or watch mode
npm test -w api -- accounts.test.ts
npm test -w api -- --watch
```
