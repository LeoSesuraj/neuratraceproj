import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { stages, type Stage } from "@/lib/journey";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  ChevronDown,
  Compass,
  HeartHandshake,
  Info,
  LifeBuoy,
  NotebookPen,
} from "lucide-react";

export const Route = createFileRoute("/learn/journey")({
  head: () => ({
    meta: [
      { title: "Journey, NeuroTrace" },
      {
        name: "description",
        content:
          "A gentle, interactive roadmap of what families often experience across the stages of dementia.",
      },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const [active, setActive] = useState<Stage["slug"]>("early");
  const current = stages.find((s) => s.slug === active)!;

  return (
    <AppShell>
      <header className="pt-2">
        <p className="text-sm font-medium text-primary">Journey</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">A road map, not a forecast.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Dementia unfolds differently for every person. This timeline helps you
          understand the broad shape of what's ahead, so the changes feel a
          little less unexpected.
        </p>
      </header>

      <StageProgress active={active} onChange={setActive} />

      <div
        id={`stage-panel-${current.slug}`}
        role="tabpanel"
        aria-labelledby={`stage-tab-${current.slug}`}
        className="mt-6 rounded-3xl border border-border/70 bg-card p-6 shadow-soft sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-soft">
            <Compass className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-2xl">{current.label}</h2>
            <p className="text-xs text-muted-foreground">{current.duration}</p>
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
      </div>

      <SelfCareChecklist stage={current} />
      <ReflectionNote stage={current} />
      <CommonQuestions stage={current} />

      <aside className="mt-10 flex gap-3 rounded-2xl border border-border/70 bg-surface p-5 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p>
          Every individual experiences dementia differently. This roadmap is
          educational only and is not intended to predict progression for any
          one person. For medical questions, consult a healthcare professional.
        </p>
      </aside>
    </AppShell>
  );
}

function StageProgress({
  active,
  onChange,
}: {
  active: Stage["slug"];
  onChange: (s: Stage["slug"]) => void;
}) {
  const idx = stages.findIndex((s) => s.slug === active);
  const pct = ((idx + 1) / stages.length) * 100;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % stages.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + stages.length) % stages.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = stages.length - 1;
    onChange(stages[next].slug);
    tabRefs.current[next]?.focus();
  };
  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="Stages of dementia"
        className="grid grid-cols-3 gap-2 rounded-2xl border border-border/70 bg-card p-1.5 shadow-soft"
      >
        {stages.map((s, i) => {
          const isActive = s.slug === active;
          return (
            <button
              key={s.slug}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`stage-tab-${s.slug}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`stage-panel-${s.slug}`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, i)}
              onClick={() => onChange(s.slug)}
              className={`min-h-[44px] w-full rounded-xl px-2 py-2.5 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
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
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {stages.map((s, i) => (
          <li key={s.slug}>
            <button
              onClick={() => onChange(s.slug)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                s.slug === active
                  ? "border-primary bg-sky-soft"
                  : "border-border/60 bg-card hover:bg-surface"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Stage {i + 1}
              </p>
              <p className="mt-1 font-semibold">{s.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.duration}</p>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SelfCareChecklist({ stage }: { stage: Stage }) {
  const key = `nt.journey.selfcare.${stage.slug}`;
  const [checked, setChecked] = useLocalStorage<string[]>(key, []);
  const toggle = (item: string) =>
    setChecked((cur) =>
      cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item],
    );
  const done = stage.selfCare.filter((i) => checked.includes(i)).length;
  return (
    <section className="mt-8 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-warm/70">
            <LifeBuoy className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-xl">Caregiver self-care</h2>
            <p className="text-xs text-muted-foreground">
              {done} of {stage.selfCare.length} checked off
            </p>
          </div>
        </div>
      </div>
      <ul className="mt-4 grid gap-2">
        {stage.selfCare.map((item) => {
          const isChecked = checked.includes(item);
          return (
            <li key={item}>
              <button
                onClick={() => toggle(item)}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                  isChecked
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                    : "border-border/60 bg-surface hover:bg-card"
                }`}
              >
                <span
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border-2 transition-colors ${
                    isChecked
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border bg-background"
                  }`}
                  aria-hidden
                >
                  {isChecked && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3">
                      <path
                        d="M2 6.5L5 9.5L10 3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className={
                    isChecked
                      ? "text-foreground/80 line-through decoration-emerald-500/50"
                      : ""
                  }
                >
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Saved on this device. Each stage has its own list.
      </p>
    </section>
  );
}

function ReflectionNote({ stage }: { stage: Stage }) {
  const key = `nt.journey.reflection.${stage.slug}`;
  const [note, setNote] = useLocalStorage<string>(key, "");
  return (
    <section className="mt-6 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sage/40">
          <NotebookPen className="h-5 w-5 text-foreground" />
        </div>
        <h2 className="text-xl">A quiet question</h2>
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
        {stage.reflectionPrompt}
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
        placeholder="Write a few words for yourself…"
        rows={4}
        className="mt-4 w-full resize-y rounded-2xl border border-border/70 bg-surface p-4 text-sm leading-relaxed outline-none focus:border-primary"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Private. Stored only in this browser.
      </p>
    </section>
  );
}

function CommonQuestions({ stage }: { stage: Stage }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mt-6 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <h2 className="text-xl">Common questions families ask</h2>
      <ul className="mt-4 divide-y divide-border/60">
        {stage.faq.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 py-3 text-left"
              >
                <span className="text-[15px] font-medium">{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="animate-fade-in pb-4 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
