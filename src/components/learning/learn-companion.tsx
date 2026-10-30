import { useEffect, useState } from "react";
import { EyeOff, MessageCircleHeart, Minus, X } from "lucide-react";
import type { Lesson } from "@/lib/curriculum";

/**
 * A small, friendly learning companion that floats over the lesson area.
 * It offers gentle, pre-written help for the current lesson. No network
 * calls, no dependencies; everything stays on the device.
 */

const simpleExplanations: Record<string, string> = {
  "1.1":
    "Alzheimer's is a disease that slowly hurts brain cells. It is the most common reason people develop dementia, and it is nobody's fault.",
  "1.2":
    "Your brain saves new moments using a part called the hippocampus. Alzheimer's often affects it first, so new memories fade while old ones stay.",
  "1.3":
    "Different parts of the brain do different jobs. Alzheimer's usually starts in the memory areas and slowly spreads, which is why memory changes come first.",
  "1.4":
    "Brain cells talk to each other through tiny connection points. In Alzheimer's, those connections stop working well, so messages get lost.",
  "1.5":
    "Several changes happen together in Alzheimer's: protein clumps, tangles, lost connections, and lost brain cells. They build up slowly over many years.",
  "1.6":
    "This chapter's big idea: Alzheimer's is a brain disease, not a choice. Behind every symptom is a changing brain, and feelings and connection often remain.",
};

const encouragements = [
  "You're doing something really meaningful by learning this. One small step at a time is plenty.",
  "There's no rush here. Even a few minutes of understanding can change how a hard moment feels.",
  "Every lesson you finish helps you show up with more patience and confidence. Keep going gently.",
  "It's okay if some of this feels heavy. Pausing is part of learning, too.",
];

type Props = { lesson: Lesson };

export function LearnCompanion({ lesson }: Props) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [side, setSide] = useState<"right" | "left">("right");
  const [reply, setReply] = useState<string | null>(null);

  // Reset the reply when the lesson changes.
  useEffect(() => setReply(null), [lesson.id]);

  // On wide screens, occasionally drift to the other corner so it never
  // sits on the same content for too long. Skipped for reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const t = window.setInterval(() => setSide((s) => (s === "right" ? "left" : "right")), 60000);
    return () => window.clearInterval(t);
  }, []);

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        className="fixed bottom-4 right-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-primary shadow-sm"
      >
        <MessageCircleHeart className="h-4 w-4" aria-hidden /> Companion
      </button>
    );
  }

  const actions: { label: string; respond: () => string }[] = [
    {
      label: "Explain this more simply",
      respond: () =>
        simpleExplanations[lesson.id] ??
        `In short: "${lesson.title}" is about understanding what is happening in the brain, one small idea at a time.`,
    },
    {
      label: "Summarize this lesson",
      respond: () =>
        `This lesson walks through ${lesson.steps.length} parts: ${lesson.steps
          .map((s) => s.heading.toLowerCase())
          .join(", ")}. Take it one part at a time.`,
    },
    {
      label: "Help me understand this diagram",
      respond: () =>
        lesson.steps.some((s) => s.interaction && s.interaction.kind !== "quiz")
          ? "The interactive parts are meant to be explored, not tested. Tap or click each labeled piece and read the short note that appears. There is no wrong way to do it."
          : "This lesson is mostly reading. If a picture or idea feels unclear, try the 'Explain this more simply' option, or move on and come back later.",
    },
    {
      label: "Encourage me to continue",
      respond: () => encouragements[Math.floor(Math.random() * encouragements.length)],
    },
  ];

  return (
    <div
      className={`fixed bottom-4 z-40 flex flex-col items-end gap-3 transition-[left,right] duration-1000 ease-in-out ${
        side === "right" ? "right-4 left-auto" : "left-4 right-auto"
      }`}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Learning companion"
          className="w-[min(20rem,calc(100vw-2rem))] rounded-3xl border border-border bg-card shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Learning companion</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Minimize companion"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setHidden(true);
                }}
                aria-label="Hide companion"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
              >
                <EyeOff className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
          <div className="space-y-2 px-4 py-3">
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => setReply(a.respond())}
                className="block w-full rounded-2xl bg-secondary px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                {a.label}
              </button>
            ))}
            {reply && (
              <p className="rounded-2xl bg-gradient-to-br from-lavender to-blush px-4 py-3 text-sm leading-relaxed text-foreground">
                {reply}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close learning companion" : "Open learning companion"}
        className="companion-bob inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-gradient-to-br from-lavender to-blush shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {open ? (
          <X className="h-6 w-6 text-primary" aria-hidden />
        ) : (
          <CompanionFace />
        )}
      </button>
    </div>
  );
}

function CompanionFace() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary/60" />
      <circle cx="17.5" cy="21" r="2.4" fill="currentColor" className="text-primary" />
      <circle cx="30.5" cy="21" r="2.4" fill="currentColor" className="text-primary" />
      <path
        d="M17 29c2 3 4.5 4.5 7 4.5s5-1.5 7-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-primary"
      />
      <path d="M24 2.5c1 2 3 3 3 3s-2 1-3 3c-1-2-3-3-3-3s2-1 3-3z" fill="currentColor" className="text-primary/70" />
    </svg>
  );
}
