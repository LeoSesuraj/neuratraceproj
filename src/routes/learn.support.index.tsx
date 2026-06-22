import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { supportResources } from "@/lib/support";
import { ArrowRight, LifeBuoy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/learn/support/")({
  component: SupportIndex,
});

function SupportIndex() {
  return (
    <AppShell>
      <header className="pt-2">
        <p className="text-sm font-medium text-primary">Support</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">You matter too.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Caring for someone with dementia is one of the hardest things a person
          can do. These resources are for you, your health, your sanity, your
          permission to set down the weight for a moment.
        </p>
      </header>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {supportResources.map((r) => (
          <li key={r.slug}>
            <Link
              to="/learn/support/$resource"
              params={{ resource: r.slug }}
              className="group flex h-full items-start gap-3 rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-warm/70">
                <LifeBuoy className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg leading-snug">{r.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{r.blurb}</p>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                  Open
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-sky-soft via-surface to-sage/40 p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Need to talk it through?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The NeuroTrace Coach can help with the specific situation you're in
              right now.
            </p>
            <Link
              to="/learn/coach"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
            >
              Open AI Coach
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
