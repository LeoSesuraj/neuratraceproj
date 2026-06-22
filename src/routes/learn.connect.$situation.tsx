import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getSituation, situations } from "@/lib/situations";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  ArrowLeft,
  Check,
  Heart,
  HeartHandshake,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Star,
  X,
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
            { title: `${loaderData.title}, NeuroTrace` },
            { name: "description", content: loaderData.blurb },
          ],
        }
      : {},
  notFoundComponent: () => (
    <AppShell>
      <p className="py-16 text-center text-muted-foreground">
        Situation not found.{" "}
        <Link to="/learn/connect" className="text-primary underline">
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
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${toneClass}`}
        >
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
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    "nt.connect.favorites",
    [],
  );
  const isFav = favorites.includes(s.slug);
  const toggleFav = () =>
    setFavorites((cur) =>
      cur.includes(s.slug) ? cur.filter((x) => x !== s.slug) : [...cur, s.slug],
    );

  const [reveal, setReveal] = useState<"none" | "good" | "poor">("none");

  return (
    <AppShell>
      <Link
        to="/learn/connect"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All situations
      </Link>

      <header className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl">{s.title}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{s.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {s.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={toggleFav}
          aria-pressed={isFav}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            isFav
              ? "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="h-3.5 w-3.5" fill={isFav ? "currentColor" : "none"} />
          {isFav ? "Saved" : "Save"}
        </button>
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

        {s.practice && (
          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl">Practice a response</h2>
            </div>
            <p className="mt-4 rounded-2xl bg-surface p-4 text-[15px] italic leading-relaxed text-foreground/90">
              {s.practice.prompt}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Think about what you'd say. Then peek at one or both responses.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setReveal(reveal === "good" ? "none" : "good")
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Check className="h-3.5 w-3.5" />
                {reveal === "good" ? "Hide" : "Show"} a kind response
              </button>
              <button
                onClick={() =>
                  setReveal(reveal === "poor" ? "none" : "poor")
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <X className="h-3.5 w-3.5" />
                {reveal === "poor" ? "Hide" : "Show"} what to avoid
              </button>
            </div>

            {reveal === "good" && (
              <div className="mt-4 animate-fade-in rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-[15px] text-emerald-900 dark:text-emerald-100">
                  {s.practice.good}
                </p>
                <p className="mt-2 text-xs text-emerald-800/80 dark:text-emerald-200/80">
                  Why it works: {s.practice.goodWhy}
                </p>
              </div>
            )}
            {reveal === "poor" && (
              <div className="mt-4 animate-fade-in rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
                <p className="text-[15px] text-rose-900 dark:text-rose-100">
                  {s.practice.poor}
                </p>
                <p className="mt-2 text-xs text-rose-800/80 dark:text-rose-200/80">
                  Why it stings: {s.practice.poorWhy}
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="mt-10 rounded-3xl border border-border/70 bg-surface p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="text-base font-semibold">Want to talk it through?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The NeuroTrace Coach can help you think through your specific
              situation.
            </p>
            <Link
              to="/learn/coach"
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
                to="/learn/connect/$situation"
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
