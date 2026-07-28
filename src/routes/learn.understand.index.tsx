import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { understandTopics } from "@/lib/understand";
import { ArrowRight, BookOpen, Search, X } from "lucide-react";

export const Route = createFileRoute("/learn/understand/")({
  head: () => ({
    meta: [
      { title: "Understand, NeuraTrace" },
      {
        name: "description",
        content:
          "Why dementia changes behavior, memory, sleep, and communication, explained without jargon.",
      },
    ],
  }),
  component: UnderstandIndex,
});

function UnderstandIndex() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return understandTopics.filter((t) =>
      q
        ? t.title.toLowerCase().includes(q) ||
          t.blurb.toLowerCase().includes(q) ||
          t.why.toLowerCase().includes(q)
        : true,
    );
  }, [query]);

  return (
    <AppShell>
      <header className="pt-2">
        <p className="text-sm font-medium text-primary">Understand</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">
          It isn't them. It's the disease.
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          The behaviors that hurt the most often have a clear, biological
          reason. Knowing why can soften the moment, and remind you who your
          loved one still is, underneath.
        </p>
      </header>

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-4 py-2.5 shadow-soft">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search topics…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {filtered.map((t) => (
          <li key={t.slug}>
            <Link
              to="/learn/understand/$topic"
              params={{ topic: t.slug }}
              className="group flex h-full items-start gap-3 rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sage/40">
                <BookOpen className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg leading-snug">{t.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-primary">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  {t.quiz && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                      quick check
                    </span>
                  )}
                  {t.myths && (
                    <span className="rounded-full bg-warm/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-foreground/80">
                      myths
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          No topics match that search.
        </p>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Educational only. Not medical advice or a diagnostic tool.
      </p>
    </AppShell>
  );
}
