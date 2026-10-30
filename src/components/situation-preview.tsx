import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, X } from "lucide-react";
import { situations } from "@/lib/situations";

type Choice = "good" | "poor" | null;

/**
 * Working preview of the practice engine, built on the real
 * "repeating questions" situation content.
 */
export function SituationPreview() {
  const situation = situations.find((s) => s.slug === "repeating-questions")!;
  const practice = situation.practice!;
  const [choice, setChoice] = useState<Choice>(null);

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft sm:p-10">
      <p className="text-sm font-medium uppercase tracking-widest text-primary">
        A real moment
      </p>
      <p className="mt-4 text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
        {practice.prompt}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setChoice("good")}
          aria-pressed={choice === "good"}
          className={`rounded-2xl border p-5 text-left transition-all ${
            choice === "good"
              ? "border-primary bg-sky-soft shadow-soft"
              : "border-border bg-background hover:border-primary/50 hover:shadow-soft"
          }`}
        >
          <span className="text-base leading-relaxed text-foreground">{practice.good}</span>
        </button>
        <button
          type="button"
          onClick={() => setChoice("poor")}
          aria-pressed={choice === "poor"}
          className={`rounded-2xl border p-5 text-left transition-all ${
            choice === "poor"
              ? "border-destructive/50 bg-destructive/5 shadow-soft"
              : "border-border bg-background hover:border-primary/50 hover:shadow-soft"
          }`}
        >
          <span className="text-base leading-relaxed text-foreground">{practice.poor}</span>
        </button>
      </div>

      {choice && (
        <div className="mt-6 rounded-2xl bg-secondary/70 p-5">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                choice === "good" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
              }`}
            >
              {choice === "good" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">
                {choice === "good" ? "This tends to help." : "This tends to backfire."}
              </p>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                {choice === "good" ? practice.goodWhy : practice.poorWhy}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Every person is different. These are educational examples, not
                guarantees of how any one moment will go.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          to="/learn/connect/$situation"
          params={{ situation: situation.slug }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Read the full guide
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/learn/connect"
          className="text-sm font-medium text-primary hover:underline"
        >
          Practice more situations
        </Link>
      </div>
    </div>
  );
}
