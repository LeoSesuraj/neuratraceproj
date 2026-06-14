import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { getSituation, situations } from "@/lib/situations";
import {
  ArrowLeft,
  Heart,
  HeartHandshake,
  Lightbulb,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/learn/connect/$situation")({
  loader: ({ params }) => {
    const s = getSituation(params.situation);
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.title} — NeuroTrace` },
            { name: "description", content: loaderData.blurb },
          ],
        }
      : {},
  notFoundComponent: () => (
    <AppShell>
      <p className="py-16 text-center text-muted-foreground">
        Situation not found.{" "}
        <Link to="/connect" className="text-primary underline">
          Go back
        </Link>
      </p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <p className="py-16 text-center text-muted-foreground">
        Something went wrong loading this guide.
      </p>
    </AppShell>
  ),
  component: SituationPage,
});

function Section({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone: "sky" | "sage" | "warm" | "rose";
  children: React.ReactNode;
}) {
  const toneClass = {
    sky: "bg-sky-soft",
    sage: "bg-sage/40",
    warm: "bg-warm/70",
    rose: "bg-destructive/10",
  }[tone];
  return (
    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${toneClass}`}>
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <h2 className="text-xl">{title}</h2>
      </div>
      <div className="mt-4 text-[15px] leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}

function SituationPage() {
  const s = Route.useLoaderData() as ReturnType<typeof getSituation> & {};
  const others = situations.filter((o) => o.slug !== s.slug).slice(0, 3);

  return (
    <AppShell>
      <Link
        to="/connect"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All situations
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl sm:text-4xl">{s.title}</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">{s.blurb}</p>
      </header>

      <div className="mt-8 grid gap-4">
        <Section icon={Heart} title="What's happening" tone="sky">
          <p>{s.whatsHappening}</p>
        </Section>

        <Section icon={HeartHandshake} title="What to say" tone="sage">
          <ul className="space-y-2.5">
            {s.whatToSay.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ShieldAlert} title="What to avoid" tone="rose">
          <ul className="space-y-2.5">
            {s.whatToAvoid.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/70" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={Lightbulb} title="Helpful tips" tone="warm">
          <ul className="space-y-2.5">
            {s.tips.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="mt-10 rounded-3xl border border-border/70 bg-surface p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="text-base font-semibold">Want to talk it through?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The NeuroTrace Coach can help you think through your specific situation.
            </p>
            <Link
              to="/coach"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Open AI Coach
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          More situations
        </h3>
        <ul className="mt-3 grid gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                to="/connect/$situation"
                params={{ situation: o.slug }}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm transition-colors hover:bg-surface"
              >
                <span>{o.title}</span>
                <span className="text-muted-foreground">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
