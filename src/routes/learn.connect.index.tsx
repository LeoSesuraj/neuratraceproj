import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { situations } from "@/lib/situations";
import { ArrowRight, MessageCircleHeart } from "lucide-react";

export const Route = createFileRoute("/learn/connect/")({
  head: () => ({
    meta: [
      { title: "Connect — NeuroTrace" },
      {
        name: "description",
        content:
          "Gentle, practical guides for the most common dementia caregiving moments.",
      },
    ],
  }),
  component: ConnectIndex,
});

function ConnectIndex() {
  return (
    <AppShell>
      <header className="pt-2">
        <p className="text-sm font-medium text-primary">Connect</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">In the moment, what helps.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Pick a situation. Each guide explains what's happening, what to say, what
          to avoid, and small things that often make a difference.
        </p>
      </header>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {situations.map((s) => (
          <li key={s.slug}>
            <Link
              to="/learn/connect/$situation"
              params={{ situation: s.slug }}
              className="group flex h-full items-start gap-3 rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-soft">
                <MessageCircleHeart className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg leading-snug">{s.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                  Open
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
