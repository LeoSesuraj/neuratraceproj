import { useEffect, useRef, useState } from "react";
import { EyeOff, Minus } from "lucide-react";
import type { Lesson } from "@/lib/curriculum";
import { NimWisp, type CompanionMood } from "./nim-wisp";

/**
 * Nim the Wisp floats over the lesson area and offers gentle, pre-written
 * help for the current lesson. No network calls, no dependencies; everything
 * stays on the device.
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
  const [mood, setMood] = useState<CompanionMood>("idle");
  const thinkTimer = useRef<number | null>(null);

  // Reset when the lesson changes.
  useEffect(() => {
    setReply(null);
    setMood("idle");
  }, [lesson.id]);

  // Clear any pending "thinking" pause when Nim goes away.
  useEffect(
    () => () => {
      if (thinkTimer.current) window.clearTimeout(thinkTimer.current);
    },
    [],
  );

  // On wide screens, occasionally drift to the other corner so she never
  // sits on the same content for too long. Skipped for reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const t = window.setInterval(() => setSide((s) => (s === "right" ? "left" : "right")), 60000);
    return () => window.clearInterval(t);
  }, []);

  function closePanel() {
    setOpen(false);
    setMood("idle");
  }

  function togglePanel() {
    if (open) closePanel();
    else {
      setOpen(true);
      setMood("listening");
    }
  }

  // Nim pauses for a beat before answering, so she feels like she's thinking.
  function ask(compose: () => string) {
    setMood("thinking");
    if (thinkTimer.current) window.clearTimeout(thinkTimer.current);
    thinkTimer.current = window.setTimeout(() => {
      setReply(compose());
      setMood("happy");
    }, 700);
  }

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        aria-label="Bring Nim back"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card py-1.5 pr-4 pl-1.5 text-sm font-semibold text-primary shadow-sm lg:bottom-4"
      >
        <span className="h-8 w-8 shrink-0">
          <NimWisp />
        </span>
        Nim
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
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3 transition-[left,right] duration-1000 ease-in-out lg:bottom-4 ${
        side === "right" ? "right-4 left-auto" : "left-4 right-auto"
      }`}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Nim, the learning companion"
          className="w-[min(20rem,calc(100vw-2rem))] rounded-3xl border border-border bg-card shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 shrink-0">
                <NimWisp mood={mood} />
              </span>
              <p className="text-sm font-semibold text-foreground">Nim is here to help</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={closePanel}
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
                onClick={() => ask(a.respond)}
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
        onClick={togglePanel}
        aria-expanded={open}
        aria-label={open ? "Close Nim, the learning companion" : "Open Nim, the learning companion"}
        className="h-12 w-12 shrink-0 drop-shadow-[0_8px_16px_rgba(75,47,143,0.22)] transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-[4.5rem] sm:w-[4.5rem]"
      >
        <NimWisp mood={mood} />
      </button>
    </div>
  );
}
