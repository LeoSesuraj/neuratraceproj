import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getUnderstandTopic, understandTopics } from "@/lib/understand";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Compass,
  Eye,
  HelpCircle,
  RefreshCw,
  X,
} from "lucide-react";

export const Route = createFileRoute("/learn/understand/$topic")({
  loader: ({ params }) => {
    const t = getUnderstandTopic(params.topic);
    if (!t) throw notFound();
    return t;
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
        Topic not found.{" "}
        <Link to="/learn/understand" className="text-primary underline">
          Go back
        </Link>
      </p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <p className="py-16 text-center text-muted-foreground">
        Something went wrong loading this topic.
      </p>
    </AppShell>
  ),
  component: UnderstandTopicPage,
});

function MythCardView({ myth, reality }: { myth: string; reality: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((v) => !v)}
      className="group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide">
        <span
          className={
            flipped ? "text-emerald-600" : "text-rose-600"
          }
        >
          {flipped ? "Reality" : "Myth"}
        </span>
        <RefreshCw className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:rotate-90" />
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
        {flipped ? reality : myth}
      </p>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Tap to {flipped ? "see the myth" : "reveal the reality"}
      </p>
    </button>
  );
}

function Quiz({ quiz }: { quiz: NonNullable<ReturnType<typeof getUnderstandTopic>>["quiz"] }) {
  const [picked, setPicked] = useState<number | null>(null);
  if (!quiz) return null;
  return (
    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl">Quick check</h2>
      </div>
      <p className="mt-4 text-[15px] text-foreground/90">{quiz.question}</p>
      <div className="mt-4 grid gap-2">
        {quiz.choices.map((c, i) => {
          const isPicked = picked === i;
          const showResult = picked !== null;
          const correct = c.correct;
          return (
            <button
              key={c.text}
              onClick={() => setPicked(i)}
              disabled={showResult}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                showResult
                  ? correct
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                    : isPicked
                      ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30"
                      : "border-border/60 bg-card opacity-60"
                  : "border-border/60 bg-card hover:bg-surface"
              }`}
            >
              <div className="flex items-start gap-2">
                {showResult &&
                  (correct ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : isPicked ? (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" />
                  ))}
                <span>{c.text}</span>
              </div>
              {showResult && (isPicked || correct) && (
                <p className="mt-2 pl-6 text-xs text-muted-foreground">
                  {c.explain}
                </p>
              )}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <button
          onClick={() => setPicked(null)}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <RefreshCw className="h-3 w-3" /> Try again
        </button>
      )}
    </section>
  );
}

function UnderstandTopicPage() {
  const t = Route.useLoaderData() as ReturnType<typeof getUnderstandTopic> & {};
  const others = understandTopics.filter((o) => o.slug !== t.slug).slice(0, 3);

  return (
    <AppShell>
      <Link
        to="/learn/understand"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All topics
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl sm:text-4xl">{t.title}</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">{t.blurb}</p>
      </header>

      <div className="mt-8 grid gap-4">
        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-soft">
              <BookOpen className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="text-xl">Why it happens</h2>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
            {t.why}
          </p>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sage/40">
              <Eye className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="text-xl">How common it is</h2>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
            {t.howCommon}
          </p>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-warm/70">
              <Compass className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="text-xl">What to expect</h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-foreground/90">
            {t.expect.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {t.myths && t.myths.length > 0 && (
          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
            <h2 className="text-xl">Myth vs reality</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap a card to flip it.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {t.myths.map((m) => (
                <MythCardView key={m.myth} {...m} />
              ))}
            </div>
          </section>
        )}

        {t.quiz && <Quiz quiz={t.quiz} />}
      </div>

      <section className="mt-10">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Keep reading
        </h3>
        <ul className="mt-3 grid gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                to="/learn/understand/$topic"
                params={{ topic: o.slug }}
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
