import { MessageCircleHeart, Sparkles } from "lucide-react";

export function AIComingSoon({
  heading = "AI Coach, Coming Soon",
  body = "Personalised AI coaching for caregivers is on its way. Check back soon.",
  compact = false,
}: {
  heading?: string;
  body?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border/70 bg-sky-soft/60 text-center shadow-soft ${
        compact ? "px-6 py-8" : "px-6 py-16 sm:py-20"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-soft/0 via-sky-soft/40 to-sky-soft/0" />
      <div className="relative">
        <div
          className={`mx-auto grid place-items-center rounded-2xl bg-card shadow-soft ${
            compact ? "h-12 w-12" : "h-16 w-16"
          }`}
        >
          <MessageCircleHeart
            className={`text-primary ${compact ? "h-6 w-6" : "h-8 w-8"}`}
            aria-hidden
          />
        </div>
        <h2
          className={`mt-4 font-semibold text-foreground ${
            compact ? "text-lg" : "text-2xl sm:text-3xl"
          }`}
        >
          {heading}
        </h2>
        <p
          className={`mx-auto mt-2 max-w-md text-muted-foreground ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {body}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium text-primary shadow-soft">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Coming soon
        </div>
      </div>
    </div>
  );
}
