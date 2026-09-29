# AGENTS.md

Guidance for coding agents working in this repository. Read this before making changes.

## What this is

**Finch Financial** — an internal operations console for a regulated neobank. Staff
review customer accounts, inspect transactions, record internal memos, and read an audit
trail. Two roles exist: **analysts** (read-mostly) and **supervisors** (can act).

Actions here affect customer money and are subject to audit. Prefer being correct and
explicit over being clever or fast.

## How to work in this repo

- **Produce only what was asked.** Requirements, a plan, and code are three separate
  deliverables. If asked for requirements, do not write a plan. If asked for a plan, do
  not write code.
- **Run the relevant checks before saying you are done** — `npm test -w api` or
  `npm test -w web`, and `npm run typecheck -w api`.
- **Surface ambiguity as a question.** If a requirement does not determine a decision
  (validation rules, which status codes apply, what to store where), ask rather than
  choosing silently.
- **Stay in scope.** Do not refactor unrelated code, and do not modify authentication.
- **Do not commit or push** unless asked. Leaving the working tree uncommitted is what
  lets a change be reviewed or reset.

## Keep the thread readable

Aim for a thread a reviewer can follow at a glance: brief prose around the work. Not an
essay, and not a bare wall of tool calls and file reads.

**Do:**
- Say in one line what you are about to do before a batch of edits.
- After changing something, state what changed and the outcome in a sentence or two —
  including the test result.
- Ask when a decision is genuinely ambiguous.
- Call out anything surprising you found, briefly.
- Close multi-phase work with a short summary of what each phase changed.

**Don't:**
- Restate the request back before starting.
- Print file contents the diff already shows.
- Explain the code you just wrote line by line unless asked.
- Recap work already visible after every individual step.
- Offer alternatives unless asked to compare options.

Rule of thumb: a few sentences per step, not paragraphs.

## Architecture

A single HTTP boundary separates the React frontend from the Express backend. The backend
is strictly three-layered, and requests only travel downward:

```
types.ts            shared API contract — imported and type-checked by BOTH sides
web/src/api.ts      the frontend's only HTTP entry point
api/src/routes/     HTTP concerns only: parse input, shape the response
api/src/services/   business logic, authorization, audit writes
api/src/repositories/  all database access (Drizzle)
api/src/db/         schema + SQLite client
api/src/lib/        errors, audit, sanitize, config
```

Routes never touch the database. Repositories never enforce authorization.

## Conventions that are not optional

- **Update `types.ts` first** when adding or changing an endpoint, then the API, then the
  frontend. The type is the contract.
- **Authorization lives in the service layer**, not in routes and not in the UI. Match how
  existing role-gated actions are implemented.
- **Money is a string.** Monetary columns are `text` and values stay strings end to end,
  formatted only at render. Never use floating point.
- **Audit consequential actions** via `writeAuditLog` in `api/src/lib/audit.ts`.
- **Errors go through `Errors` and `errorHandler`** so every response uses the
  `{ error: { code, message } }` envelope. Never hand-roll an error response.
- **Schema changes:** update `types.ts` → `api/src/db/schema.ts` →
  `npm run db:generate -w api` → `npm run db:migrate -w api`. Commit the generated
  migration and its snapshot.

## Stack and commands

SQLite (embedded file, no server) · Drizzle ORM · Express 5 · React 19 + Vite · Vitest.

```bash
npm run setup          # install, create api/.env, migrate, seed
npm run dev            # API (:3000) and web (:5173) together
npm test -w api        # in-process API tests against an in-memory database
npm run typecheck -w api
```

Tests need no running server and never touch the development database.
