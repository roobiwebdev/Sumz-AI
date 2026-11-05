"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/server/session";
import { deleteSummary, summarizeArticle, type SummarizeResult } from "@/server/summaries";

const urlInput = z
  .string()
  .trim()
  .url("Enter a full link, starting with https://")
  .refine((value) => /^https?:\/\//i.test(value), "Only http and https links are supported")
  .max(2048);

export async function summarizeAction(rawUrl: string): Promise<SummarizeResult> {
  const user = await requireUser();
  const parsed = urlInput.safeParse(rawUrl);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid link" };
  const result = await summarizeArticle(user.id, parsed.data);
  if (result.ok) revalidatePath("/app");
  return result;
}

export async function deleteSummaryAction(id: string): Promise<void> {
  const user = await requireUser();
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return;
  await deleteSummary(user.id, parsed.data);
  revalidatePath("/app");
}
