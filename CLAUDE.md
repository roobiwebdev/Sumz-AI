# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Every rule here is mandatory. The working method and skills are adapted from
[Projects-Starter](https://github.com/roobiwebdev/Projects-Starter); its monorepo-specific rules
(tRPC, Expo, pnpm workspaces) do not apply to this single Next.js app and were left out.

## 0. How to work

1. **Plan before code.** For any feature, use the `architect-feature` skill: restate the goal, break it into building blocks, find what already exists, place it at the root, run the security pass, propose a build order. Get approval before writing implementation code.
2. **Explore cheaply.** Grep for `SOURCE OF TRUTH KEYWORDS` and similar names before reading whole files.
3. **Reuse before you create.** Never create a type, function, component, CSS class or constant without first grepping for an existing one. Duplicates are bugs.
4. **Root cause, not symptoms.** Fix problems where they originate so every caller benefits.
5. **Finish the whole feature.** Never leave a piece half-built. If something is out of scope or blocked, say so in your handover.
6. **Prove it.** Before handing over, run `npm run check-types`, `npm run lint` and `npm run build`. There is no unit-test suite; for UI/runtime changes, verify in the running app (`evidence-driven-testing`), including phone widths (360/390px) with no sideways scroll. Report real results. Never claim a pass you did not see.
7. **Git: task branches only.** For edits, use the `new-feature` skill: one worktree and branch per task, created from **`origin/master`** (this repo's default branch, not `main`) inside the gitignored `.worktrees/` folder, branch name `agent/<task-name>`, then `npm install` inside the worktree. Agents may commit and push their **own task branch**. Never commit or push to `master`, never merge, never `--force` (only `--force-with-lease` on your own branch), and open a PR only when the user asks. Read-only work (reviews, explanations, investigations) needs no worktree.

## 1. Commands

```bash
npm install            # node_modules is not committed
cp .env.example .env.local   # then fill in values (see .env.example comments)
npm run dev            # http://localhost:3000
npm run check-types    # tsc --noEmit
npm run lint           # eslint (next/core-web-vitals + typescript)
npm run build          # production build
npm run db:generate    # SQL migration from src/db/schema → drizzle/
npm run db:migrate     # apply migrations to DATABASE_URL
npm run db:studio      # browse the database
npm run auth:generate  # regenerate src/db/schema/auth.ts after changing Better Auth plugins/fields
```

## 2. Architecture

Next.js 16 (App Router, Turbopack) + React 19 + TypeScript, Tailwind CSS v4, Better Auth, Drizzle ORM on Neon Postgres, Resend for email, `motion` for animation.

```
src/app/page.tsx            Landing page (server component; passes signedIn to client sections)
src/app/(auth)/*            sign-in, sign-up, forgot-password, reset-password, check-email
src/app/app/*               Signed-in product: page.tsx (data), actions.ts (server actions), layout.tsx (guard + header)
src/app/api/auth/[...all]   Better Auth HTTP handler
src/proxy.ts                Next 16 proxy (never create middleware.ts): cookie-only redirect of /app/* to /sign-in
src/server/                 Server-only modules (env, auth, session, email, summaries)
src/db/                     Drizzle client + schema; migrations in drizzle/
src/components/ui|landing|auth|app   Shared primitives, then per-area components
```

Request flow: **UI → server action (`src/app/app/actions.ts`) → `requireUser()` + Zod validation → service in `src/server/*` → `db`.**

- **Env is read in exactly one place:** `src/server/env.ts` (Zod-validated). Optional integrations (Google, Resend, RapidAPI) are exposed as `integrations.*` flags and the UI degrades when they're missing (no Google button, emails logged to the server console, summarizer disabled). Only `drizzle.config.ts` reads `process.env` directly.
- **Security checkpoint:** `requireUser()` in `src/server/session.ts` verifies the session for every protected page and server action. `proxy.ts` is only a fast redirect, never the real check. Every query on user data filters by `userId`.
- **Auth:** `src/server/auth.ts` — email + password (email verification required, reset via email, sessions revoked on reset), Google (enabled when both Google env vars are set), DB-backed rate limits with stricter rules on sign-in/sign-up/reset. `user.plan` (default `free`) is the hook for paid tiers. Client calls go through `authClient` in `src/lib/auth-client.ts`.
- **Database driver:** Neon WebSocket `Pool` (`drizzle-orm/neon-serverless`), not the HTTP driver, because Better Auth's adapter runs multi-step writes in transactions (`transaction: true`).
- **Summarizer:** `src/server/summaries.ts` calls RapidAPI "Article Extractor and Summarizer" server-side (key never reaches the browser), enforces `SUMMARY_DAILY_LIMIT` per user per UTC day by counting rows, and stores results in the `summary` table.

### Single sources of truth (grep these first)

| Concern                          | Lives in                                                    |
| -------------------------------- | ----------------------------------------------------------- |
| Env vars + integration flags     | `src/server/env.ts` (template: `.env.example`)              |
| Auth config, providers, limits   | `src/server/auth.ts`                                        |
| Session check for pages/actions  | `src/server/session.ts` (`getSession`, `requireUser`)       |
| Tables and row types             | `src/db/schema/*` (`typeof table.$inferSelect`)             |
| Summaries: call, cap, store      | `src/server/summaries.ts`                                   |
| Transactional email              | `src/server/email.ts` (`sendActionEmail`, `escapeHtml`)     |
| Brand colors, fonts, gradients   | `src/app/globals.css` (`@theme` tokens + brand utilities)   |
| Buttons, inputs, logo, typewriter| `src/components/ui/*`                                       |
| Safe post-login redirects        | `src/lib/safe-redirect.ts`                                  |

## 3. TypeScript

- No `any`. No `as` assertions except `as const` and casts needed for typed routes. No `!` non-null assertions. No `@ts-ignore` / `@ts-expect-error`. Narrow `unknown` with type guards (see `readSummary` in `src/server/summaries.ts`), never by casting.
- Zod on every input boundary: server action arguments, form data, env.
- Type lookup order: Drizzle inferred types, Better Auth `$Infer` (`Session`, `AuthUser` from `src/server/auth.ts`), types derived from services (`SummaryItem`), only then a new type next to the owning code with a SOT header.
- `strict` and `noUncheckedIndexedAccess` are on; fix the real type instead of fighting it.

## 4. Source-of-truth comments

Put this header above every exported, reusable block (functions, components, API slices, hooks):

```ts
/**
 * SOURCE OF TRUTH KEYWORDS: Symbol1, Symbol2, related words (around 6 to 10)
 * WHAT:  what this is
 * WHY:   why it exists and why it is built this way
 * WHERE: where it is used
 */
```

Inline comments explain outcomes and intent, not syntax. Keep them short.

## 5. UI rules

- **Theme tokens only:** `bg-background`, `bg-surface`, `bg-surface-raised`, `border-border`, `text-foreground`, `text-muted`, `text-subtle`, `text-brand`, plus utilities `text-gradient-brand`, `text-gradient-accent`, `bg-brand-gradient`, `bg-grid`, `bg-aurora`. No hex values in components. Brand = the original Sumz amber→orange gradient, blue→cyan accent, black grid background, Satoshi (display) + Inter (body).
- Reuse `Button`/`ButtonLink`, `Field`/`Input`, `Logo`, `Spinner`, `Typewriter`, `Reveal`/`SectionHeading` before writing new markup.
- Reduced motion is handled globally by `<MotionConfig reducedMotion="user">` in `src/components/providers.tsx`. Never branch render output on `useReducedMotion()` (it breaks hydration); read it only inside effects.
- Grids that hold long text need `grid-cols-1` (minmax(0,1fr)) and `min-w-0` children, or they push the page wider than the phone screen.
- Landing copy stays honest: no invented testimonials, user counts or logos. Demo content uses `.example` domains.
- Icons: `lucide-react`. Follow `web-design-guidelines`, `vercel-react-best-practices` and `vercel-composition-patterns`.

## 6. Workflow skills: isolate, build, prove, ship

Pick the steps a task needs. A plan, review or local experiment does not imply a branch, commit or PR.

| Step     | Skill                       | Rule here                                                                                                                         |
| -------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Plan     | `architect-feature`         | Section 0, rule 1. Its tRPC/`protectedProcedure` advice maps to `requireUser()` here (section 2). |
| Isolate  | `new-feature`               | Section 0, rule 7 (base `origin/master`).                                                                                         |
| Prove    | `evidence-driven-testing`   | Run `npm run check-types`, `npm run lint`, `npm run build`. For changed UI or runtime behavior, record the failure before the fix and the success after. Evidence goes in the gitignored `.artifacts/<task-name>/`. |
| Ship     | `before-and-after`          | Screenshots stay local by default. Upload (the default host 0x0.st is public) only when the user asks for PR images.             |
| Write    | `unslop`                    | Run it over prose you write for a person: commit messages, PR bodies, docs, code comments. Leave text you didn't touch alone.    |
| Research | `reverse-engineer-anything` | Use with the `rea` MCP server (`.mcp.json`) to study how an existing app does something. Rebuild the behavior here; never copy third-party code. |
| Deploy   | `deploy-to-vercel`          | Only when the user asks.                                                                                                          |

`better-auth-best-practices`, `email-and-password-best-practices`, `better-auth-security-best-practices` and `neon-postgres` apply to this stack. The Expo, React Native, HeroUI Native and shadcn skills don't; use them only if the project adopts that technology.

**Multi-agent rules**

- One worktree and one branch per task and per agent. Never touch another agent's worktree, branch or uncommitted work.
- Before starting, skim open PRs (`gh pr list`, `gh pr diff <n> --name-only`). Ask when changes conflict in behavior or ownership is unclear.
- Resolve `package-lock.json` conflicts by regenerating it (`npm install`), never by hand-merging.
- Worktrees do not isolate ports. Confirm the dev-server port answers your process (`lsof -i :3000`) before trusting it.

**Shipping a task (only when asked):** keep the change to the task, run the checks, commit with a clear message, rebase onto `origin/master` and re-run the checks, push your branch, then open the PR with what changed, how it was tested (each claim backed by evidence), before/after proof, and risks. Do not merge unless told to.

## 7. Database changes

1. Edit `src/db/schema/*.ts` (for auth tables, change `src/server/auth.ts` then run `npm run auth:generate`; the CLI can't load files that import `server-only`, so temporarily remove that line from the auth/env/db/email modules while it runs).
2. `npm run db:generate`, review the SQL in `drizzle/`, commit it with the schema change.
3. `npm run db:migrate`. Neon project: `sumz-ai` (`floral-flower-74625812`, org Roobi, aws-us-east-1). Use a Neon branch for risky schema experiments.

## 8. Known gotchas

- `next dev` appends a Next.js block to `AGENTS.md`; keep it.
- Without `RESEND_API_KEY`, verification and reset links are printed to the dev-server console.
- Local queries are slow on high-latency connections (each Neon round trip from far away can take seconds); deploy app servers in the database's region (Vercel `iad1`).
- Google sign-in needs the redirect URI `<BETTER_AUTH_URL>/api/auth/callback/google` registered in Google Cloud Console.
- Production: Vercel project `sumz-ai` (team roobis-projects) at https://sumz.roobi.dev, region `iad1`. `vercel.json` pins the framework to Next.js because the project was first detected as the old Vite app. Production env vars live in Vercel (`vercel env ls`); its `BETTER_AUTH_SECRET` differs from local. Deploy with `vercel deploy --prod` only when the user asks.

Keep this file updated when you change structure, commands or conventions.
