import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { stages } from "@/lib/journey";
import { useState } from "react";
import { Compass, HeartHandshake, Info } from "lucide-react";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Journey — NeuroTrace" },
      {
        name: "description",
        content:
          "A gentle, educational roadmap of what families often experience across the stages of dementia.",
      },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const [active, setActive] = useState<typeof stages[number]["slug"]>("early");
  const current = stages.find((s) => s.slug === active)!;

  return (
    <AppShell>
      <header className="pt-2">
        <p className="text-sm font-medium text-primary">Journey</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">A road map, not a forecast.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Dementia unfolds differently for every person. This timeline helps you
          understand the broad shape of what's ahead — so the changes feel a little
          less unexpected.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Stages of dementia"
        className="mt-8 grid grid-cols-3 gap-2 rounded-2xl border border-border/70 bg-card p-1.5 shadow-soft"
      >
        {stages.map((s) => {
          const isActive = s.slug === active;
          return (
            <button
              key={s.slug}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(s.slug)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <article className="mt-6 rounded-3xl border border-border/70 bg-card p-6 shadow-soft sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-soft">
              <Compass className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-2xl">{current.label}</h2>
              <p className="text-xs text-muted-foreground">{current.duration}</p>
            </div>
          </div>
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-foreground/90">
          {current.summary}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-surface p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              What often changes
            </h3>
            <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed">
              {current.changes.map((c) => (
                <li key={c} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border/60 bg-sage/25 p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <HeartHandshake className="h-4 w-4" />
              Where to focus
            </h3>
            <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed">
              {current.caregiverFocus.map((c) => (
                <li key={c} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        {stages.map((s, i) => (
          <li
            key={s.slug}
            className={`relative rounded-2xl border p-4 transition-colors ${
              s.slug === active
                ? "border-primary bg-sky-soft"
                : "border-border/60 bg-card"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Stage {i + 1}
            </p>
            <p className="mt-1 font-semibold">{s.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.duration}</p>
          </li>
        ))}
      </ol>

      <aside className="mt-10 flex gap-3 rounded-2xl border border-border/70 bg-surface p-5 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p>
          Every individual experiences dementia differently. This roadmap is
          educational only and is not intended to predict progression for any one
          person. For medical questions, consult a healthcare professional.
        </p>
      </aside>
    </AppShell>
  );
}
