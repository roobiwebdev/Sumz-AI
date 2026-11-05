import "server-only";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { db, schema } from "@/db";
import { serverEnv } from "./env";

/**
 * SOURCE OF TRUTH KEYWORDS: summarizeArticle, summaries service, RapidAPI, article summarizer, daily limit, listSummaries, deleteSummary
 * WHAT:  Calls the RapidAPI article summarizer and stores/reads/deletes a user's summaries.
 * WHY:   The API key never leaves the server, and every caller gets the same daily cap and storage.
 * WHERE: src/app/app/actions.ts, src/app/app/page.tsx.
 */
const RAPIDAPI_HOST = "article-extractor-and-summarizer.p.rapidapi.com";

export type SummarizeResult =
  | { ok: true; summary: { id: string; url: string; content: string; createdAt: Date } }
  | { ok: false; error: string };

function startOfUtcDay(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function usageToday(userId: string): Promise<{ used: number; limit: number }> {
  const [row] = await db
    .select({ value: count() })
    .from(schema.summary)
    .where(and(eq(schema.summary.userId, userId), gte(schema.summary.createdAt, startOfUtcDay())));
  return { used: row?.value ?? 0, limit: serverEnv.SUMMARY_DAILY_LIMIT };
}

function readSummary(body: unknown): string | null {
  if (typeof body === "object" && body !== null && "summary" in body && typeof body.summary === "string") {
    return body.summary.trim() || null;
  }
  return null;
}

function readError(body: unknown): string | null {
  if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
    return body.error;
  }
  return null;
}

export async function summarizeArticle(userId: string, url: string): Promise<SummarizeResult> {
  if (!serverEnv.RAPIDAPI_KEY) {
    return { ok: false, error: "The summarizer isn't configured yet. Add RAPIDAPI_KEY to the server environment." };
  }

  const { used, limit } = await usageToday(userId);
  if (used >= limit) {
    return { ok: false, error: `You've reached today's limit of ${limit} summaries. It resets at midnight UTC.` };
  }

  let response: Response;
  try {
    response = await fetch(
      `https://${RAPIDAPI_HOST}/summarize?url=${encodeURIComponent(url)}&length=3`,
      {
        headers: { "X-RapidAPI-Key": serverEnv.RAPIDAPI_KEY, "X-RapidAPI-Host": RAPIDAPI_HOST },
        signal: AbortSignal.timeout(30_000),
        cache: "no-store",
      },
    );
  } catch {
    return { ok: false, error: "The summarizer took too long to respond. Try again in a moment." };
  }

  const body: unknown = await response.json().catch(() => null);
  const content = response.ok ? readSummary(body) : null;
  if (!content) {
    return { ok: false, error: readError(body) ?? "We couldn't summarize that page. Check the link points to an article." };
  }

  const [row] = await db
    .insert(schema.summary)
    .values({ userId, url, content })
    .returning({
      id: schema.summary.id,
      url: schema.summary.url,
      content: schema.summary.content,
      createdAt: schema.summary.createdAt,
    });
  if (!row) return { ok: false, error: "Saving the summary failed. Try again." };
  return { ok: true, summary: row };
}

export async function listSummaries(userId: string, limit = 50) {
  return db
    .select({
      id: schema.summary.id,
      url: schema.summary.url,
      content: schema.summary.content,
      createdAt: schema.summary.createdAt,
    })
    .from(schema.summary)
    .where(eq(schema.summary.userId, userId))
    .orderBy(desc(schema.summary.createdAt))
    .limit(limit);
}

export type SummaryItem = Awaited<ReturnType<typeof listSummaries>>[number];

export async function deleteSummary(userId: string, id: string): Promise<void> {
  await db.delete(schema.summary).where(and(eq(schema.summary.id, id), eq(schema.summary.userId, userId)));
}
