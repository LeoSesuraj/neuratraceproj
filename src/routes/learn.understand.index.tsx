import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { understandTopics } from "@/lib/understand";
import { ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/learn/understand/")({
  component: UnderstandIndex,
});

function UnderstandIndex() {
  return (
    <AppShell>
      <header className="pt-2">
        <p className="text-sm font-medium text-primary">Understand</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">It isn't them. It's the disease.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          The behaviors that hurt the most often have a clear, biological reason.
          Knowing why can soften the moment — and remind you who your loved one
          still is, underneath.
        </p>
      </header>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {understandTopics.map((t) => (
          <li key={t.slug}>
            <Link
              to="/understand/$topic"
              params={{ topic: t.slug }}
              className="group flex h-full items-start gap-3 rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sage/40">
                <BookOpen className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg leading-snug">{t.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Educational only. Not medical advice or a diagnostic tool.
      </p>
    </AppShell>
  );
}
