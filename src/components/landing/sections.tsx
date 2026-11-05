"use client";

import { Check, ChevronDown, Clock, Copy, Link2, ShieldCheck, Trash2 } from "lucide-react";
import { animate, AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, SectionHeading } from "./reveal";

/* ---------- Source strip (looping marquee) ---------- */

const sources = ["News sites", "Engineering blogs", "Research write-ups", "Newsletters", "Long reads", "Product docs", "Opinion pieces", "Explainers"];

export function SourceStrip() {
  const row = [...sources, ...sources];
  return (
    <section aria-label="What you can summarize" className="border-y border-border/70 py-8">
      <p className="text-center text-xs font-semibold tracking-[0.2em] text-subtle uppercase">One link. Any kind of article.</p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
        <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
          {row.map((s, i) => (
            <span key={`${s}-${i}`} aria-hidden={i >= sources.length} className="rounded-full border border-border bg-surface px-5 py-2 text-sm whitespace-nowrap text-muted">
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */

const steps = [
  { n: "01", title: "Paste a link", body: "Copy the address of any article or blog post and drop it into Sumz AI." },
  { n: "02", title: "We read it for you", body: "Sumz AI pulls out the article text and condenses it into the points that matter." },
  { n: "03", title: "Get the gist", body: "Three clear sentences arrive in seconds, saved to your history and ready to copy." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <SectionHeading eyebrow="How it works" title={<>From link to summary in <span className="text-gradient-brand">three steps</span></>} />
      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-surface p-7 transition-colors hover:border-border-strong">
              <div className="absolute -top-16 -right-16 size-40 rounded-full bg-brand/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <span className="font-display text-5xl font-black text-gradient-brand">{s.n}</span>
              <h3 className="mt-6 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-muted">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Feature blocks (copy beside a product card) ---------- */

function FeatureRow({
  eyebrow,
  title,
  points,
  card,
  flip,
}: {
  eyebrow: string;
  title: string;
  points: Array<{ title: string; body: string }>;
  card: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
      <Reveal className={flip ? "min-w-0 md:order-2" : "min-w-0"}>
        <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">{eyebrow}</p>
        <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h3>
        <div className="mt-8 space-y-6">
          {points.map((p) => (
            <div key={p.title} className="flex gap-4">
              <span className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/15">
                <Check className="size-3.5 text-brand" />
              </span>
              <div>
                <h4 className="font-semibold">{p.title}</h4>
                <p className="mt-1 text-muted">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.15} className={flip ? "min-w-0 md:order-1" : "min-w-0"}>
        {card}
      </Reveal>
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-6 -z-10 bg-aurora opacity-15" />
      <div className="rounded-3xl border border-border bg-surface/90 p-5 shadow-2xl shadow-black/50 backdrop-blur sm:p-6">{children}</div>
    </div>
  );
}

const historyItems = [
  { url: "longreads.example/four-day-week", when: "2 min ago" },
  { url: "engineering.example/postgres-at-scale", when: "Yesterday" },
  { url: "science.example/sleep-and-memory", when: "Mon" },
  { url: "news.example/climate-report-2026", when: "Last week" },
];

function HistoryCard() {
  return (
    <CardShell>
      <div className="flex items-center justify-between">
        <p className="font-display font-bold">Your summaries</p>
        <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs text-subtle">4 saved</span>
      </div>
      <ul className="mt-4 space-y-2">
        {historyItems.map((h, i) => (
          <motion.li
            key={h.url}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3"
          >
            <Link2 className="size-4 shrink-0 text-brand" />
            <span className="min-w-0 flex-1 truncate text-sm text-accent-soft">{h.url}</span>
            <span className="flex items-center gap-1 text-xs text-subtle">
              <Clock className="size-3" />
              {h.when}
            </span>
          </motion.li>
        ))}
      </ul>
    </CardShell>
  );
}

function CopyCard() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => setCopied((c) => !c), 2200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <CardShell>
      <p className="text-xs font-semibold tracking-[0.18em] text-subtle uppercase">
        Article <span className="text-gradient-accent">summary</span>
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        A six-month trial across 61 companies found revenue held steady while burnout and sick days fell. Most firms kept the shorter week after the trial ended.
      </p>
      <div className="mt-5 flex items-center gap-2">
        <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border-strong bg-background px-4 text-sm">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(copied)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="inline-flex items-center gap-2">
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4 text-subtle" />}
              {copied ? "Copied" : "Copy summary"}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="inline-flex size-9 items-center justify-center rounded-full border border-border text-subtle">
          <Trash2 className="size-4" />
        </span>
      </div>
    </CardShell>
  );
}

function PrivacyCard() {
  return (
    <CardShell>
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-success/10">
          <ShieldCheck className="size-5 text-success" />
        </span>
        <div>
          <p className="font-display font-bold">Signed in with Google</p>
          <p className="text-sm text-subtle">or email and password</p>
        </div>
      </div>
      <div className="mt-5 space-y-2 text-sm">
        {["Summaries visible only to you", "Delete any summary in one click", "No ads, no tracking pixels"].map((t) => (
          <div key={t} className="flex items-center gap-2 rounded-xl bg-background/60 px-3 py-2.5 text-muted">
            <Check className="size-4 text-brand" />
            {t}
          </div>
        ))}
      </div>
    </CardShell>
  );
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <SectionHeading
        eyebrow="Features"
        title={<>Built for people who <span className="text-gradient-brand">read a lot</span></>}
        description="Everything you need to get through your reading list, and nothing you don't."
      />
      <div className="mx-auto mt-20 max-w-6xl space-y-28">
        <FeatureRow
          eyebrow="History"
          title="Every summary, saved where you can find it"
          points={[
            { title: "Your reading, in one list", body: "Each link you summarize is saved to your account, newest first." },
            { title: "On every device", body: "Sign in anywhere and your history is already there." },
          ]}
          card={<HistoryCard />}
        />
        <FeatureRow
          flip
          eyebrow="Share"
          title="Copy the gist in one click"
          points={[
            { title: "Ready to paste", body: "Drop a summary into Slack, notes or an email without retyping a word." },
            { title: "Tidy as you go", body: "Delete summaries you no longer need. They're gone for good." },
          ]}
          card={<CopyCard />}
        />
        <FeatureRow
          eyebrow="Account"
          title="Private by default"
          points={[
            { title: "Sign in your way", body: "Continue with Google, or use an email and password." },
            { title: "Your data stays yours", body: "Only you can see your summaries. We don't sell or share them." },
          ]}
          card={<PrivacyCard />}
        />
      </div>
    </section>
  );
}

/* ---------- Facts with count-up ---------- */

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: reduced ? 0 : 1.4, ease: "easeOut", onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduced, to]);
  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

const facts = [
  { value: 3, suffix: "", label: "sentences per summary", note: "Short enough to read at a glance" },
  { value: 25, suffix: "", label: "free summaries a day", note: "Resets every midnight UTC" },
  { value: 0, suffix: "", label: "ads or tracking pixels", note: "Your reading isn't the product" },
];

export function Facts() {
  return (
    <section className="px-4 py-24 sm:py-32">
      <SectionHeading eyebrow="The short version" title="No inflated numbers. Just how it works." />
      <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
        {facts.map((f, i) => (
          <Reveal key={f.label} delay={i * 0.1}>
            <div className="h-full rounded-3xl border border-border bg-surface p-8 text-center">
              <p className="font-display text-6xl font-black text-gradient-brand">
                <CountUp to={f.value} suffix={f.suffix} />
              </p>
              <p className="mt-3 font-semibold">{f.label}</p>
              <p className="mt-1 text-sm text-subtle">{f.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

const faqs = [
  { q: "What can I summarize?", a: "Any public web page that's mostly an article: news stories, blog posts, essays, documentation. Pages behind a paywall or login can't be read." },
  { q: "How long are the summaries?", a: "About three sentences. Enough to decide whether the full article is worth your time." },
  { q: "Is it free?", a: "Yes. Every account can create 25 summaries a day. The count resets at midnight UTC." },
  { q: "Who can see my summaries?", a: "Only you. Your history is tied to your account and never shown to anyone else." },
  { q: "Can I delete my history?", a: "Yes. Delete any summary from your history and it's removed from our database." },
  { q: "Do I need a Google account?", a: "No. You can sign up with any email address and a password, or use Google if you prefer." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <SectionHeading eyebrow="Questions" title="Good to know" />
      <Reveal className="mx-auto mt-12 max-w-3xl">
        <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <h3>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold transition-colors hover:bg-surface-raised"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {f.q}
                    <ChevronDown className={`size-5 shrink-0 text-subtle transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={`faq-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-muted">{f.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Closing CTA ---------- */

export function CallToAction({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="px-4 pb-24 sm:pb-32">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-surface px-6 py-16 text-center sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-full max-w-2xl -translate-x-1/2 bg-aurora opacity-30" />
        <div className="relative">
          <h2 className="font-display text-4xl font-black tracking-tight text-balance sm:text-6xl">
            Your reading list, <span className="text-gradient-brand">finally finished.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-muted">Create a free account and summarize your first article in under a minute.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={signedIn ? "/app" : "/sign-up"} size="lg">
              {signedIn ? "Open Sumz AI" : "Get started free"}
            </ButtonLink>
            {signedIn ? null : (
              <ButtonLink href="/sign-in" variant="outline" size="lg">
                I already have an account
              </ButtonLink>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
