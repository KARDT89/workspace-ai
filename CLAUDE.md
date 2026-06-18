# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 15 App Router application. Routes, layouts, and API handlers live under `app/`; groups such as `app/(auth)/` organize pages without changing URLs. Shared React components belong in `components/`, with shadcn primitives in `components/ui/`. Put reusable hooks in `hooks/`, client and authentication helpers in `lib/`, and server-only code in `server/`. Database schemas are under `server/db/schema/`, generated migrations in `drizzle/`, and static assets in `public/`.
Core Rules
Use TypeScript everywhere.
NEVER change migrations of drizzle. always change schema instead.
Prefer Server Components by default.
Use Client Components only when state, effects, browser APIs, or interactivity are needed.
Prefer Server Actions for form mutations.
Use API routes only for webhooks, external clients, auth callbacks, file uploads, streaming, or public HTTP endpoints.

Keep business logic out of React components.

Preferred architecture:

Read:
Page → Service → Query → Database

Mutation:
Form → Server Action → Service → Query → Database

Webhook:
API Route → Service → Query → Database

AI/External Integrations:
API Route → Service → Queries/APIs

Keep database access inside `server/db/queries` and business workflows inside `server/services`.

Do not introduce new libraries without explaining why.
Do not rewrite unrelated files.
After meaningful changes, run typecheck/build.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies from `package-lock.json`.
- `docker compose up -d postgres` starts the local PostgreSQL 16 service.
- `npm run dev` starts the Turbopack development server at `http://localhost:3000`.
- `npm run lint` runs the Next.js ESLint rules and TypeScript-specific checks.
- `npm run build` creates a production build and catches type or bundling failures.
- `npm start` serves the completed production build.
- `npm run db:generate`, `npm run db:migrate`, and `npm run db:studio` manage Drizzle migrations and inspect the database.

## Coding Style & Naming Conventions

Keep TypeScript strict and prefer the `@/` alias for root imports. Follow the frontend style: two-space indentation, double quotes, and functional components. Use kebab-case filenames (`mode-toggle.tsx`), PascalCase components, camelCase functions and variables, and `use-*.ts` for hooks. Follow Next.js names such as `page.tsx`, `layout.tsx`, and `route.ts`. ESLint is authoritative where existing files differ.

## Testing Guidelines

No automated test framework or coverage threshold is configured. Run `npm run lint` and `npm run build`, then manually exercise affected routes and database operations. When adding tests, colocate `*.test.ts` or `*.test.tsx` files near the implementation and add the test script and framework configuration to `package.json`.

## Commit & Pull Request Guidelines

History uses Conventional Commit-style subjects, for example `chore: nextjs + drizzle + auth setup`. Use concise, imperative subjects such as `feat: add calendar connection`. Pull requests should explain the change, list validation, link relevant issues, and include screenshots for UI changes. Call out migrations, environment variables, or deployment steps.

## Security & Configuration

Keep secrets in ignored `.env` files; never commit credentials or OAuth keys. `DATABASE_URL` is required by the database client and Drizzle tooling. Review generated SQL in `drizzle/` before applying migrations, especially against shared databases.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

