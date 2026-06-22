import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getSituation, situations, type Situation } from "@/lib/situations";
import {
  Check,
  Heart,
  HeartHandshake,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";

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
    <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${toneClass}`}>
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <h3 className="text-lg">{title}</h3>
      </div>
      <div className="mt-3 text-[15px] leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function GuideBody({ s }: { s: Situation }) {
  const [reveal, setReveal] = useState<"none" | "good" | "poor">("none");
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-1.5">
        {s.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>

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
        <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg">Practice a response</h3>
          </div>
          <p className="mt-4 rounded-2xl bg-surface p-4 text-[15px] italic leading-relaxed text-foreground/90">
            {s.practice.prompt}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setReveal(reveal === "good" ? "none" : "good")}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <Check className="h-3.5 w-3.5" />
              {reveal === "good" ? "Hide" : "Show"} a kind response
            </button>
            <button
              onClick={() => setReveal(reveal === "poor" ? "none" : "poor")}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <X className="h-3.5 w-3.5" />
              {reveal === "poor" ? "Hide" : "Show"} what to avoid
            </button>
          </div>
          {reveal === "good" && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="text-[15px] text-emerald-900 dark:text-emerald-100">{s.practice.good}</p>
              <p className="mt-2 text-xs text-emerald-800/80 dark:text-emerald-200/80">
                Why it works: {s.practice.goodWhy}
              </p>
            </div>
          )}
          {reveal === "poor" && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
              <p className="text-[15px] text-rose-900 dark:text-rose-100">{s.practice.poor}</p>
              <p className="mt-2 text-xs text-rose-800/80 dark:text-rose-200/80">
                Why it stings: {s.practice.poorWhy}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export function GuideSheet({
  slug,
  open,
  onOpenChange,
  onSelectSlug,
}: {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSlug?: (slug: string) => void;
}) {
  const s = slug ? getSituation(slug) : null;
  const others = s ? situations.filter((o) => o.slug !== s.slug).slice(0, 3) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-xl"
      >
        {s ? (
          <div className="px-5 pb-10 pt-6 sm:px-6">
            <SheetHeader className="text-left">
              <SheetTitle className="text-2xl sm:text-3xl">{s.title}</SheetTitle>
              <SheetDescription>{s.blurb}</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <GuideBody s={s} />
            </div>

            {others.length > 0 && (
              <section className="mt-8">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  More guides
                </h4>
                <ul className="mt-3 grid gap-2">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <button
                        type="button"
                        onClick={() => onSelectSlug?.(o.slug)}
                        className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3 text-left text-sm hover:bg-surface"
                      >
                        <span>{o.title}</span>
                        <span className="text-muted-foreground">→</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">Guide not found.</div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function BrowseGuidesSheet({
  open,
  onOpenChange,
  onSelectSlug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSlug: (slug: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <div className="px-5 pb-10 pt-6 sm:px-6">
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl sm:text-3xl">All guides</SheetTitle>
            <SheetDescription>Pick a situation to read about.</SheetDescription>
          </SheetHeader>
          <ul className="mt-6 grid gap-2">
            {situations.map((s) => (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => onSelectSlug(s.slug)}
                  className="flex w-full flex-col items-start gap-1 rounded-2xl border border-border/60 bg-card px-4 py-3 text-left hover:bg-surface"
                >
                  <span className="text-base">{s.title}</span>
                  <span className="text-xs text-muted-foreground">{s.blurb}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
