import { Summarizer } from "@/components/app/summarizer";
import { integrations } from "@/server/env";
import { requireUser } from "@/server/session";
import { listSummaries, usageToday } from "@/server/summaries";

export default async function AppPage() {
  const user = await requireUser();
  const [items, usage] = await Promise.all([listSummaries(user.id), usageToday(user.id)]);
  const firstName = user.name.split(" ")[0] ?? user.name;
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Hi {firstName}, <span className="text-gradient-brand">what are we reading?</span>
      </h1>
      <p className="mt-2 text-muted">Paste an article link and get the gist in three sentences.</p>
      <Summarizer initialItems={items} usage={usage} configured={integrations.summarizer} />
    </>
  );
}
