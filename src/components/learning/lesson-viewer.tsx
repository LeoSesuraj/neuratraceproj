import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Clock, PartyPopper } from "lucide-react";
import { type Lesson, type Interaction, type StepVideo, chapterOf, reviewQuiz } from "@/lib/curriculum";
import { KnowledgeCheck } from "./knowledge-check";
import { BrainInteraction } from "./brain-interaction";
import { BrainChanges, ForgetfulnessSort, MemorySequence, NeuronDiagram } from "./interactive-diagram";
import { LearnCompanion } from "./learn-companion";

type Props = {
  lesson: Lesson;
  isLastLesson: boolean;
  hasPrevLesson: boolean;
  reflection?: string;
  onReflection: (t: string) => void;
  onComplete: () => void;
  onPrevLesson: () => void;
};

export function LessonViewer(props: Props) {
  const { lesson } = props;
  const [stepIdx, setStepIdx] = useState(0);
  const articleRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  useEffect(() => setStepIdx(0), [lesson.id]);

  const chapter = chapterOf(lesson.id);
  const step = lesson.steps[Math.min(stepIdx, lesson.steps.length - 1)];
  const lastStep = stepIdx === lesson.steps.length - 1;

  return (
    <article ref={articleRef} className="relative mx-auto w-full max-w-3xl px-5 pb-24 pt-6 sm:px-8 lg:pt-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary/80">
          Chapter {String(chapter.n).padStart(2, "0")} · {chapter.title}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {lesson.id} {lesson.title}
        </h1>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden /> About {lesson.minutes} min
          </span>
          <span>
            Part {stepIdx + 1} of {lesson.steps.length}
          </span>
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {lesson.steps.map((s, i) => (
            <span key={s.id} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= stepIdx ? "bg-primary" : "bg-accent"}`} />
          ))}
        </div>
      </header>

      <section ref={contentRef} className="nim-lesson-content relative mt-8 pr-20 sm:pr-24">
        <div key={`${lesson.id}-${step.id}`} className="animate-in fade-in duration-500">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">{step.heading}</h2>
        <div data-nim-anchor="reading" className="mt-4 space-y-4 text-lg leading-relaxed text-foreground/85">
          {step.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {step.interaction && (
          <div data-nim-anchor="exploring" className="mt-7">
            <InteractionBlock
              interaction={step.interaction}
              reflection={props.reflection}
              onReflection={props.onReflection}
            />
          </div>
        )}
        {step.video && <VideoBlock video={step.video} />}
        {step.deeper && <Deeper text={step.deeper} />}
        </div>
      </section>

      <LearnCompanion lesson={lesson} activePart={`${lesson.id}-${step.id}`} articleRef={articleRef} contentRef={contentRef} />

      <LessonNavigation
        canBack={stepIdx > 0 || props.hasPrevLesson}
        onBack={() => (stepIdx > 0 ? setStepIdx(stepIdx - 1) : props.onPrevLesson())}
        nextLabel={lastStep ? (props.isLastLesson ? "Complete chapter" : "Complete lesson") : "Next"}
        onNext={() => {
          if (lastStep) props.onComplete();
          else setStepIdx(stepIdx + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        finishing={lastStep}
      />
    </article>
  );
}

function VideoBlock({ video }: { video: StepVideo }) {
  return (
    <figure data-nim-anchor="exploring" className="mt-7 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          src={video.embedUrl}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <figcaption className="px-5 py-4 text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">{video.title}</span>
        <span aria-hidden> · </span>
        Video courtesy of the {video.source}
      </figcaption>
    </figure>
  );
}

function Deeper({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 rounded-3xl border border-border bg-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-12 w-full items-center justify-between px-5 text-left text-base font-semibold text-primary"
      >
        Go deeper: the science
        <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && <p className="px-5 pb-5 text-base leading-relaxed text-muted-foreground">{text}</p>}
    </div>
  );
}

function InteractionBlock({
  interaction,
  reflection,
  onReflection,
}: {
  interaction: Interaction;
  reflection?: string;
  onReflection: (t: string) => void;
}) {
  switch (interaction.kind) {
    case "quiz":
      return <KnowledgeCheck quiz={interaction.quiz} />;
    case "forgetfulness":
      return <ForgetfulnessSort />;
    case "memory":
      return <MemorySequence />;
    case "brain":
      return <BrainInteraction />;
    case "neuron":
      return <NeuronDiagram />;
    case "changes":
      return <BrainChanges />;
    case "review":
      return <ChapterReview reflection={reflection} onReflection={onReflection} />;
  }
}

const takeaways = [
  "Alzheimer's is a brain disease and the most common cause of dementia. It is not normal aging.",
  "New memories depend on the hippocampus, which is often affected first. Older memories can last longer.",
  "Memories live in connections between neurons, and those connections are disrupted in Alzheimer's.",
  "Amyloid plaques, tau tangles, lost synapses, and neuron loss build up together over many years.",
  "Behind every symptom is a changing brain, not a choice. Feelings and connection often remain.",
];

function ChapterReview({ reflection, onReflection }: { reflection?: string; onReflection: (t: string) => void }) {
  const [text, setText] = useState(reflection ?? "");
  useEffect(() => setText(reflection ?? ""), [reflection]);
  return (
    <div className="space-y-4">
      {reviewQuiz.map((q, i) => (
        <KnowledgeCheck key={q.question} quiz={q} index={i} />
      ))}
      <div className="rounded-3xl bg-gradient-to-br from-lavender to-blush p-6">
        <h3 className="text-xl font-semibold text-foreground">Key takeaways</h3>
        <ul className="mt-4 space-y-3">
          {takeaways.map((t) => (
            <li key={t} className="flex gap-3 text-base text-foreground">
              <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6">
        <label htmlFor="reflection" className="text-xl font-semibold text-foreground">
          A moment to reflect
        </label>
        <p className="mt-1 text-base text-muted-foreground">
          Is there something your loved one does that makes more sense now? This stays on this device only.
        </p>
        <textarea
          id="reflection"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onReflection(text)}
          rows={4}
          className="mt-3 w-full rounded-2xl border border-input bg-background p-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Write a few words, if you'd like."
        />
      </div>
    </div>
  );
}

export function LessonNavigation({
  canBack,
  onBack,
  onNext,
  nextLabel,
  finishing,
}: {
  canBack: boolean;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  finishing: boolean;
}) {
  return (
    <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
      <button
        type="button"
        onClick={onBack}
        disabled={!canBack}
        className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-base font-semibold text-primary transition-colors hover:bg-accent disabled:opacity-40"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
      >
        {nextLabel} {finishing ? <Check className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}

export function ChapterCompletion({ chapterTitle, onRevisit }: { chapterTitle: string; onRevisit: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-lavender to-blush">
        <PartyPopper className="h-7 w-7 text-primary" aria-hidden />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Chapter complete</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        You've finished <span className="font-semibold text-foreground">{chapterTitle}</span>. Understanding what's
        happening in the brain is a meaningful first step. Your progress is saved on this device.
      </p>
      <p className="mt-6 rounded-3xl bg-card p-5 text-base text-muted-foreground">
        Chapter 2, <span className="font-semibold text-foreground">Experiencing Their World</span>, is coming soon.
      </p>
      <button
        type="button"
        onClick={onRevisit}
        className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-base font-semibold text-primary hover:bg-accent"
      >
        Revisit Chapter 1
      </button>
    </div>
  );
}
