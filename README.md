# Sumz AI

Paste an article link, get the gist in three clear sentences. Every summary is saved to your account.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Better Auth (email + password, Google) · Drizzle ORM · Neon Postgres · Resend · motion

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run db:migrate
npm run dev                  # http://localhost:3000
```

See `.env.example` for every variable. Google sign-in, email delivery and the summarizer each switch on when their keys are set.

## Features

- Animated landing page with a live product demo
- Sign up / sign in with email and password or Google, with email verification and password reset
- Server-side summarization (the API key never reaches the browser), 25 summaries per user per day
- Summary history stored per account: copy, revisit, delete
