"use client";

import { ChevronDown } from "lucide-react";
import { animate, AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { FeatureCards } from "./cards/feature-cards";
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

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <SectionHeading
        eyebrow="Features"
        title={<>Built for people who <span className="text-gradient-brand">read a lot</span></>}
        description="Everything you need to get through your reading list, and nothing you don't. Each card below is the real feature, running."
      />
      <FeatureCards />
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
