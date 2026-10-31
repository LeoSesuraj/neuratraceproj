import { useEffect, useRef, useState, type RefObject } from "react";
import { EyeOff, Minus } from "lucide-react";
import { allLessons, type Lesson } from "@/lib/curriculum";
import { NimWisp, type CompanionMood } from "./nim-wisp";
import { Button } from "@/components/ui/button";
import { companionPosition } from "./companion-position";

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

type Props = {
  lesson: Lesson;
  activePart: string;
  articleRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
};

export function LearnCompanion({ lesson, activePart, articleRef, contentRef }: Props) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, ready: false, side: "left" as "left" | "right", panelAbove: false });
  const currentPosition = useRef(position);
  const traveler = useRef<HTMLElement | null>(null);
  const travelAnimation = useRef<Animation | null>(null);
  const crossingUntil = useRef(0);
  const interactionState = useRef({ open, hidden });
  interactionState.current = { open, hidden };
  const [reply, setReply] = useState<string | null>(null);
  const [mood, setMood] = useState<CompanionMood>("idle");
  const thinkTimer = useRef<number | null>(null);

  // Reset when the lesson changes.
  useEffect(() => {
    setReply(null);
    setMood("idle");
    setOpen(false);
    if (thinkTimer.current) window.clearTimeout(thinkTimer.current);
  }, [activePart]);

  // Clear any pending "thinking" pause when Nim goes away.
  useEffect(
    () => () => {
      if (thinkTimer.current) window.clearTimeout(thinkTimer.current);
    },
    [],
  );

  // The reserved lane belongs to the lesson, not the viewport. Keep one
  // mounted traveler and interpolate its coordinates between content anchors.
  useEffect(() => {
    const article = articleRef.current;
    const content = contentRef.current;
    if (!article || !content) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let releaseTimer: number | undefined;
    let frame: number | undefined;
    const precedingParts = allLessons.slice(0, allLessons.findIndex((item) => item.id === lesson.id)).reduce((sum, item) => sum + item.steps.length, 0);
    const visit = precedingParts + Math.max(0, lesson.steps.findIndex((part) => `${lesson.id}-${part.id}` === activePart));
    let stop = visit;

    function move(idle = false, scrolling = false) {
      if (!article || !content) return;
      if (scrolling && performance.now() < crossingUntil.current) return;
      const articleBox = article.getBoundingClientRect();
      const contentBox = content.getBoundingClientRect();
      const body = content.firstElementChild;
      if (!(body instanceof HTMLElement)) return;
      const size = window.matchMedia("(min-width: 640px)").matches ? 64 : 48;
      const anchors = Array.from(content.querySelectorAll<HTMLElement>("[data-nim-anchor]"));
      const visibleAnchors = anchors.filter((anchor) => {
        const rect = anchor.getBoundingClientRect();
        return rect.top < window.innerHeight - 80 && rect.bottom > 100;
      });
      const choices = (idle || scrolling) && visibleAnchors.length ? visibleAnchors : anchors;
      const anchor = choices[stop % Math.max(choices.length, 1)] ?? body;
      const anchorBox = anchor.getBoundingClientRect();
      const sectionTop = contentBox.top - articleBox.top;
      const naturalHeight = Math.max(body.offsetHeight, size + 24);
      const next = companionPosition({
        left: contentBox.left - articleBox.left, right: contentBox.right - articleBox.left, sectionTop, height: naturalHeight,
        anchorTop: anchorBox.top - contentBox.top, anchorHeight: anchorBox.height, size, visit,
        viewportTop: -articleBox.top, viewportHeight: window.innerHeight,
        scroll: window.scrollY + (idle ? stop * 55 : 0),
      });
      // Hold the outgoing lane until arrival, so even a shorter next part
      // cannot put its navigation underneath the moving character.
      window.clearTimeout(releaseTimer);
      content.style.minHeight = `${Math.max(naturalHeight, currentPosition.current.y - sectionTop + size + 24)}px`;
      const element = traveler.current;
      const previous = currentPosition.current;
      const destination = { ...next, panelAbove: next.y + articleBox.top > window.innerHeight * 0.45 };
      if (element && previous.ready && !reducedMotion.matches) {
        const start = getComputedStyle(element).transform;
        travelAnimation.current?.cancel();
        const crossing = previous.side !== next.side;
        const corridor = sectionTop - size - 16;
        const finish = `translate3d(${next.x}px, ${next.y}px, 0)`;
        const frames = crossing ? [
          { transform: start },
          { transform: `translate3d(${previous.x}px, ${corridor}px, 0)`, offset: 0.3 },
          { transform: `translate3d(${next.x}px, ${corridor}px, 0)`, offset: 0.7 },
          { transform: finish },
        ] : [{ transform: start }, { transform: finish }];
        crossingUntil.current = crossing ? performance.now() + 1500 : 0;
        travelAnimation.current = element.animate(frames, { duration: crossing ? 1500 : scrolling ? 480 : 1200, easing: "ease-in-out" });
        if (crossing) travelAnimation.current.onfinish = () => move(false, true);
      }
      currentPosition.current = destination;
      setPosition(destination);
      releaseTimer = window.setTimeout(() => { content.style.minHeight = ""; }, reducedMotion.matches ? 0 : 1550);
    }

    frame = window.requestAnimationFrame(() => move());
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame ?? 0);
      frame = window.requestAnimationFrame(() => move());
    });
    if (content.firstElementChild) observer.observe(content.firstElementChild);
    observer.observe(article);
    const onScroll = () => {
      window.cancelAnimationFrame(frame ?? 0);
      frame = window.requestAnimationFrame(() => move(false, true));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const driftTimer = window.setInterval(() => {
      if (reducedMotion.matches || interactionState.current.open || interactionState.current.hidden) return;
      stop += 1;
      move(true);
    }, 14000);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame ?? 0);
      window.clearTimeout(releaseTimer);
      window.clearInterval(driftTimer);
    };
  }, [activePart, lesson, articleRef, contentRef]);

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
      <Button
        ref={(element) => { traveler.current = element; }}
        variant="ghost"
        type="button"
        onClick={() => setHidden(false)}
        aria-label="Bring Nim back"
        className="nim-traveler absolute left-0 top-0 z-20 h-12 w-12 rounded-full p-0 text-primary"
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)`, visibility: position.ready ? "visible" : "hidden", transition: "none" }}
      >
        <span className="h-8 w-8 shrink-0">
          <NimWisp />
        </span>
      </Button>
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
      ref={(element) => { traveler.current = element; }}
      className="nim-traveler absolute left-0 top-0 z-20"
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)`, visibility: position.ready ? "visible" : "hidden", transition: "none" }}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Nim, the learning companion"
          className={`absolute z-40 w-[min(20rem,calc(100vw-2.5rem))] rounded-3xl border border-border bg-card shadow-lg ${position.side === "left" ? "left-0" : "right-0"} ${position.panelAbove ? "bottom-full mb-3" : "top-full mt-3"}`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 shrink-0">
                <NimWisp mood={mood} />
              </span>
              <p className="text-sm font-semibold text-foreground">Nim is here to help</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                type="button"
                onClick={closePanel}
                aria-label="Minimize companion"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setOpen(false);
                  setHidden(true);
                }}
                aria-label="Hide companion"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
              >
                <EyeOff className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
          <div className="space-y-2 px-4 py-3">
            {actions.map((a) => (
              <Button
                variant="secondary"
                key={a.label}
                type="button"
                onClick={() => ask(a.respond)}
                className="block h-auto w-full whitespace-normal rounded-2xl bg-secondary px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                {a.label}
              </Button>
            ))}
            {reply && (
              <p className="rounded-2xl bg-gradient-to-br from-lavender to-blush px-4 py-3 text-sm leading-relaxed text-foreground">
                {reply}
              </p>
            )}
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        type="button"
        onClick={togglePanel}
        aria-expanded={open}
        aria-label={open ? "Close Nim, the learning companion" : "Open Nim, the learning companion"}
        className="nim-trigger h-12 w-12 shrink-0 bg-transparent p-0 transition-transform duration-300 hover:scale-105 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring sm:h-16 sm:w-16"
      >
        <NimWisp mood={mood} />
      </Button>
    </div>
  );
}
