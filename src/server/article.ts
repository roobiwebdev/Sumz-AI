import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

/**
 * SOURCE OF TRUTH KEYWORDS: fetchArticle, article extraction, Readability, SSRF guard, readable text, page fetch
 * WHAT:  Downloads a public web page and extracts its readable title and text.
 * WHY:   Users paste arbitrary links, so the fetch must refuse private/internal addresses (checked on every
 *        redirect hop), cap size and time, and hand the model only the article text, not menus and ads.
 * WHERE: src/server/summaries.ts.
 */
const MAX_BYTES = 2_000_000;
const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 15_000;
const MIN_TEXT_LENGTH = 200;
const USER_AGENT = "Mozilla/5.0 (compatible; SumzAI/1.0; +https://sumz.roobi.dev)";

export type ArticleResult =
  | { ok: true; title: string | null; text: string; finalUrl: string }
  | { ok: false; error: string };

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  const [a = 0, b = 0] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) return isPrivateIPv4(ip);
  const v6 = ip.toLowerCase();
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped?.[1]) return isPrivateIPv4(mapped[1]);
  return (
    v6 === "::" ||
    v6 === "::1" ||
    v6.startsWith("fc") ||
    v6.startsWith("fd") ||
    v6.startsWith("fe8") ||
    v6.startsWith("fe9") ||
    v6.startsWith("fea") ||
    v6.startsWith("feb") ||
    v6.startsWith("ff")
  );
}

async function isPublicUrl(url: URL): Promise<boolean> {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.port && url.port !== "80" && url.port !== "443") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) return false;
  try {
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    return addresses.length > 0 && addresses.every((a) => !isPrivateAddress(a.address));
  } catch {
    return false;
  }
}

async function readCapped(response: Response): Promise<string | null> {
  if (!response.body) return null;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function fetchArticle(rawUrl: string): Promise<ArticleResult> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  let current = new URL(rawUrl);
  let response: Response | null = null;

  try {
    // Follow redirects by hand so every hop gets the same address check.
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await isPublicUrl(current))) {
        return { ok: false, error: "That link points to a private or unsupported address." };
      }
      const res = await fetch(current, {
        redirect: "manual",
        signal,
        cache: "no-store",
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
      });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        current = new URL(location, current);
        continue;
      }
      response = res;
      break;
    }
  } catch {
    return { ok: false, error: "That page took too long to load or couldn't be reached." };
  }

  if (!response) return { ok: false, error: "That link redirects too many times." };
  if (!response.ok) {
    return { ok: false, error: `That page returned an error (${response.status}). It may be private or paywalled.` };
  }
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("html")) {
    return { ok: false, error: "That link isn't a web page. Paste a link to an article." };
  }

  let html: string | null;
  try {
    html = await readCapped(response);
  } catch {
    return { ok: false, error: "That page took too long to load or couldn't be reached." };
  }
  if (!html) return { ok: false, error: "That page was empty." };

  const { document } = parseHTML(html);
  const parsed = new Readability(document).parse();
  const text = parsed?.textContent?.replace(/\s+/g, " ").trim() ?? "";
  if (text.length < MIN_TEXT_LENGTH) {
    return { ok: false, error: "We couldn't find article text on that page. It may need a login or load its text with JavaScript." };
  }
  const title = parsed?.title?.trim() || null;
  return { ok: true, title, text, finalUrl: current.toString() };
}
