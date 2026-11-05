# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Every rule here is mandatory. The working method and skills are adapted from
[Projects-Starter](https://github.com/roobiwebdev/Projects-Starter); its monorepo-specific rules
(tRPC, Drizzle, Better Auth, pnpm) do not apply to this single Vite app and were left out.

## 0. How to work

1. **Plan before code.** For any feature, use the `architect-feature` skill: restate the goal, break it into building blocks, find what already exists, place it at the root, run the security pass, propose a build order. Get approval before writing implementation code.
2. **Explore cheaply.** Grep for `SOURCE OF TRUTH KEYWORDS` and similar names before reading whole files.
3. **Reuse before you create.** Never create a type, function, component, CSS class or constant without first grepping for an existing one. Duplicates are bugs.
4. **Root cause, not symptoms.** Fix problems where they originate so every caller benefits.
5. **Finish the whole feature.** Never leave a piece half-built. If something is out of scope or blocked, say so in your handover.
6. **Prove it.** Before handing over, run `npm run build` (type-check + bundle) and `npm run lint`. There is no test suite; for UI/runtime changes, verify in the running app (`evidence-driven-testing`). Report real results. Never claim a pass you did not see.
7. **Git: task branches only.** For edits, use the `new-feature` skill: one worktree and branch per task, created from **`origin/master`** (this repo's default branch, not `main`) inside the gitignored `.worktrees/` folder, branch name `agent/<task-name>`, then `npm install` inside the worktree. Agents may commit and push their **own task branch**. Never commit or push to `master`, never merge, never `--force` (only `--force-with-lease` on your own branch), and open a PR only when the user asks. Read-only work (reviews, explanations, investigations) needs no worktree.

## 1. Commands

```bash
npm install        # node_modules is not committed
npm run dev        # Vite dev server
npm run build      # tsc -b (type-check) then vite build → dist/
npm run lint       # eslint . (flat config, TS/TSX only)
npm run preview    # serve the production build
```

## 2. Architecture

Single-page React 19 + TypeScript app built with Vite, styled with Tailwind 3, state via Redux Toolkit.

- **Summarization backend is RapidAPI, not OpenAI.** The README says "Powered by OpenAI", but the app calls the RapidAPI "Article Extractor and Summarizer" service (`article-extractor-and-summarizer.p.rapidapi.com/summarize?url=...&length=3`). The key comes from `VITE_RAPID_API_ARTICLE_KEY` in `.env` (Vite exposes only `VITE_`-prefixed vars via `import.meta.env`). Note this key ships to the browser — there is no server.
- **Data flow:** `src/services/article.tsx` defines an RTK Query API (`articleApi`) exporting `useLazyGetSummaryQuery`; `src/services/store.tsx` registers its reducer and middleware; `src/main.tsx` wraps `<App />` in the Redux `<Provider>`. No hand-written slices — RTK Query is the only Redux state. New remote endpoints belong in `articleApi` (or a sibling `createApi` registered in the store), not ad-hoc `fetch` calls in components.
- **UI:** `App.tsx` renders `Hero` (header/title) and `Demo` (everything functional). `Demo` owns the URL form, calls the lazy query on submit, renders the result with a `react-simple-typewriter` animation, and keeps link history in component state mirrored to `localStorage` under the key `"articles"` (array of `{ url, summary }`).
- SVG icons are re-exported from `src/assets/index.js`; import from `../assets` rather than individual files.

### Single sources of truth (grep these first)

| Concern                       | Lives in                                         |
| ----------------------------- | ------------------------------------------------ |
| Remote API calls / endpoints  | `src/services/article.tsx` (RTK Query)           |
| Redux store setup + types     | `src/services/store.tsx` (`RootState`, `AppDispatch`) |
| Reusable visual styles        | `src/App.css` named `@apply` classes             |
| Font families                 | `tailwind.config.js` + font links in `index.html` |
| Icons                         | `src/assets/index.js`                            |
| Saved link history            | `localStorage["articles"]`, owned by `Demo.tsx`  |

## 3. TypeScript

- No `any`. No `as` assertions except `as const`. No `!` non-null assertions. No `@ts-ignore` / `@ts-expect-error`. Narrow `unknown` with type guards, never by casting.
- Treat data from outside the app (API responses, `localStorage`, URL input) as untrusted: validate its shape with a type guard before using it.
- Type lookup order: library-inferred types (RTK Query hook results, `RootState`), then existing project types (grep), only then a new type next to the code that owns it, with a SOT header.
- `tsconfig.app.json` has `strict`, `noUnusedLocals`, `noUnusedParameters`; fix the real type instead of fighting it.

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

- Most styling lives in `src/App.css` as named component classes built with `@apply` (`.app`, `.head_text`, `.url_input`, `.submit_btn`, `.link_card`, `.copy_btn`, `.summary_box`, gradient text classes, the `.main`/`.gradient` background). Reuse or extend these before adding new styles; add a new named class when a style repeats.
- Check `src/components` before creating a component. Reusable components take props; no hardcoded copy or data inside them.
- Follow `web-design-guidelines`, `vercel-react-best-practices` and `vercel-composition-patterns` for React/UI work.

## 6. Workflow skills: isolate, build, prove, ship

Pick the steps a task needs. A plan, review or local experiment does not imply a branch, commit or PR.

| Step     | Skill                       | Rule here                                                                                                                         |
| -------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Plan     | `architect-feature`         | Section 0, rule 1. Its tRPC/`protectedProcedure` advice doesn't apply — this app has no backend; the "security pass" means: no secrets in client code beyond the public Vite key, validate external data. |
| Isolate  | `new-feature`               | Section 0, rule 7 (base `origin/master`).                                                                                         |
| Prove    | `evidence-driven-testing`   | Run `npm run build` + `npm run lint`. For changed UI or runtime behavior, record the failure before the fix and the success after. Evidence goes in the gitignored `.artifacts/<task-name>/`. |
| Ship     | `before-and-after`          | Screenshots stay local by default. Upload (the default host 0x0.st is public) only when the user asks for PR images.             |
| Write    | `unslop`                    | Run it over prose you write for a person: commit messages, PR bodies, docs, code comments. Leave text you didn't touch alone.    |
| Research | `reverse-engineer-anything` | Use with the `rea` MCP server (`.mcp.json`) to study how an existing app does something. Rebuild the behavior here; never copy third-party code. |
| Deploy   | `deploy-to-vercel`          | Only when the user asks.                                                                                                          |

The Expo, React Native, HeroUI Native, Better Auth, Neon and shadcn skills were installed with the starter set but don't match this stack; use them only if the project adopts that technology.

**Multi-agent rules**

- One worktree and one branch per task and per agent. Never touch another agent's worktree, branch or uncommitted work.
- Before starting, skim open PRs (`gh pr list`, `gh pr diff <n> --name-only`). Ask when changes conflict in behavior or ownership is unclear.
- Resolve `package-lock.json` conflicts by regenerating it (`npm install`), never by hand-merging.
- Worktrees do not isolate ports. Confirm the dev-server port answers your process (`lsof -i :5173`) before trusting it.

**Shipping a task (only when asked):** keep the change to the task, run the checks, commit with a clear message, rebase onto `origin/master` and re-run the checks, push your branch, then open the PR with what changed, how it was tested (each claim backed by evidence), before/after proof, and risks. Do not merge unless told to.

## 7. Known gotchas

- `index.html` loads `/src/main.jsx`, but the entry file is `src/main.tsx` — the script path must match the actual entry.
- `tailwind.config.js` `content` globs are `./src/**/*.{html,js,jsx}` and don't include `.ts`/`.tsx`, so utility classes written only in TSX components may not be generated. Classes used via `@apply` in `App.css` are unaffected.
- `src/services/article.tsx` contains an unused `options` object with a hardcoded RapidAPI key; the real request path uses the env var in `prepareHeaders`.
- `.env` is tracked in git (it is not in `.gitignore`).
- `Demo.tsx` reads `error?.data?.error`, which RTK Query's error union type may reject under `strict`.

Keep this file updated when you change structure, commands or conventions.
