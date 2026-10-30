import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { Quiz } from "@/lib/curriculum";

export function KnowledgeCheck({
  quiz,
  index,
  onAnswered,
}: {
  quiz: Quiz;
  index?: number;
  onAnswered?: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const choice = picked === null ? null : quiz.options[picked];

  return (
    <fieldset className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <legend className="sr-only">{quiz.question}</legend>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
        {index !== undefined ? `Question ${index + 1}` : "Quick check"}
      </p>
      <p className="mt-2 text-lg font-semibold text-foreground">{quiz.question}</p>
      <div className="mt-4 grid gap-2.5">
        {quiz.options.map((o, i) => {
          const isPicked = picked === i;
          const state = isPicked ? (o.correct ? "right" : "wrong") : "idle";
          return (
            <button
              key={o.label}
              type="button"
              aria-pressed={isPicked}
              onClick={() => {
                setPicked(i);
                onAnswered?.(o.correct);
              }}
              className={`flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                state === "right"
                  ? "border-primary bg-accent text-foreground"
                  : state === "wrong"
                    ? "border-blush-strong/60 bg-blush text-foreground"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted"
              }`}
            >
              <span>{o.label}</span>
              {state === "right" && <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden />}
              {state === "wrong" && <X className="h-5 w-5 shrink-0 text-blush-strong" aria-hidden />}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {choice && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
            <p className="text-base text-foreground">
              <span className="font-semibold">{choice.correct ? "Nicely done. " : "Not quite. "}</span>
              {choice.feedback}
            </p>
            {!choice.correct && (
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> Try again
              </button>
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
}
