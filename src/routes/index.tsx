import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, MessagesSquare, Play, Sparkles } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { BrainExplorer } from "@/components/brain-explorer";
import { SituationPreview } from "@/components/situation-preview";
import { Reveal } from "@/components/reveal";
import heroBrain from "../assets/hero-brain.jpg";
import humanStory from "../assets/human-story.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuraTrace — Understand their world. Stay connected." },
      {
        name: "description",
        content:
          "Explore the science of Alzheimer's, experience real caregiving situations, and discover meaningful ways to connect with someone you love.",
      },
      { property: "og:title", content: "NeuraTrace — Understand their world. Stay connected." },
      {
        property: "og:description",
        content:
          "An interactive learning platform for families navigating Alzheimer's and dementia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const experiences = [
  {
    icon: Brain,
    title: "Neuroscience you can see",
    copy: "Explore what is actually happening in the brain, region by region, in plain language.",
  },
  {
    icon: MessagesSquare,
    title: "Real caregiving decisions",
    copy: "Step into everyday moments and practice how you might respond, with thoughtful feedback.",
  },
  {
    icon: Sparkles,
    title: "Guided AI conversations",
    copy: "Ask the questions you cannot ask anywhere else, and get calm, educational answers.",
  },
  {
    icon: Play,
    title: "Story-driven learning",
    copy: "Short, beautifully paced lessons built around real families and real situations.",
  },
];

const chapters = [
  { n: "01", title: "Understanding Alzheimer's", time: "15 min", live: true },
  { n: "02", title: "Experiencing Their World", time: "20 min", live: false },
  { n: "03", title: "Communication and Connection", time: "18 min", live: false },
  { n: "04", title: "Understanding Behaviors", time: "22 min", live: false },
  { n: "05", title: "Everyday Life and the Body", time: "16 min", live: false },
  { n: "06", title: "Meaningful Connection", time: "18 min", live: false },
  { n: "07", title: "The Caregiver Journey", time: "20 min", live: false },
  { n: "08", title: "Understanding Disease Progression", time: "24 min", live: false },
];

function HomePage() {
  return (
    <div className="theme-public min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <PublicNav />

      <main id="main-content">
        {/* 1 — Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:pb-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              An interactive dementia learning platform
            </p>
            <h1 className="mt-5 text-5xl leading-[1.02] sm:text-7xl lg:text-[5.25rem]">
              Understand their world. Stay connected.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Explore the science of Alzheimer's, experience real caregiving
              situations, and discover meaningful ways to connect with someone
              you love.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover"
              >
                Begin Learning
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#brain"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Explore the Brain
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-lift">
              <img
                src={heroBrain}
                alt="Artistic scientific illustration of the human brain with glowing neural connections"
                width={1216}
                height={1408}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Conceptual scientific artwork
            </p>
          </div>
        </section>

        {/* 2 — Human story */}
        <section id="about" className="bg-secondary/60 py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
            <Reveal>
              <div className="overflow-hidden rounded-[2rem] shadow-lift">
                <img
                  src={humanStory}
                  alt="An older woman and her daughter holding hands across a kitchen table, laughing together"
                  width={1600}
                  height={1072}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
            <div>
              <h2 className="text-4xl leading-[1.05] sm:text-5xl">
                Behind every diagnosis is a person.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Dementia changes how someone experiences the world, but it does
                not erase who they are. When families understand what is
                happening and why, everyday moments become easier to navigate,
                and connection stays possible.
              </p>
              <blockquote className="editorial-quote mt-8 border-l-2 border-sage pl-6 text-2xl leading-snug text-foreground">
                "They may forget what you said. They rarely forget how you made
                them feel."
              </blockquote>
            </div>
          </div>
        </section>

        {/* 3 — Learning experience */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <h2 className="max-w-3xl text-4xl leading-[1.05] sm:text-5xl">
              There's more to understanding than reading.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              NeuraTrace teaches the way memory actually works, through seeing,
              doing, and practicing, not pages of text.
            </p>
          </Reveal>
          <div className="mt-14 space-y-0">
            {experiences.map((e, i) => {
              const Icon = e.icon;
              return (
                <Reveal key={e.title} delay={i * 60}>
                  <div
                    className={`flex flex-col gap-4 border-t border-border/70 py-8 sm:flex-row sm:items-center sm:gap-10 ${
                      i === experiences.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <span className="w-14 shrink-0 text-sm font-semibold text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-soft">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="sm:flex-1">
                      <h3 className="text-2xl tracking-tight">{e.title}</h3>
                      <p className="mt-1 max-w-xl text-base text-muted-foreground">{e.copy}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* 4 — Explore the brain (cinematic dark) */}
        <section id="brain" className="bg-ink py-20 text-ink-foreground sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">
                Interactive neuroscience
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl leading-[1.05] text-ink-foreground sm:text-5xl">
                See what's happening beneath the surface.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
                Select a region to understand what it does, and how Alzheimer's
                can change it.
              </p>
            </Reveal>
            <div className="mt-12">
              <BrainExplorer />
            </div>
          </div>
        </section>

        {/* 5 — Chapters */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <h2 className="max-w-3xl text-4xl leading-[1.05] sm:text-5xl">
              Learn to understand. Practice to connect.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A guided curriculum that moves from the science of the disease to
              the art of staying close.
            </p>
          </Reveal>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {chapters.map((c, i) => (
              <Reveal key={c.n} delay={(i % 4) * 60}>
                <li className="group flex h-full flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                  <span className="text-sm font-semibold text-sage">{c.n}</span>
                  <h3 className="mt-3 text-xl leading-snug tracking-tight">{c.title}</h3>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="text-sm text-muted-foreground">{c.time}</span>
                    {c.live ? (
                      <Link
                        to="/learn/connect/$situation"
                        params={{ situation: "repeating-questions" }}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:underline"
                      >
                        Begin
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                        Coming soon
                      </span>
                    )}
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* 6 — Situation preview */}
        <section className="bg-secondary/60 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <Reveal>
              <h2 className="text-center text-4xl leading-[1.05] sm:text-5xl">
                What would you say?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground">
                This is a working preview of how NeuraTrace teaches. Choose a
                response and see what happens.
              </p>
            </Reveal>
            <div className="mt-12">
              <SituationPreview />
            </div>
          </div>
        </section>

        {/* 7 — AI companion */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <h2 className="text-4xl leading-[1.05] sm:text-5xl">
                Questions deserve thoughtful answers.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                The NeuraTrace AI Coach is a companion for understanding
                behaviors and practicing communication, available whenever a
                hard moment arrives.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                The Coach offers educational guidance only. It does not provide
                diagnoses or personalized medical advice.
              </p>
              <Link
                to="/learn/coach"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-base font-semibold text-background transition-opacity hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                Talk to the Coach
              </Link>
            </Reveal>
            <Reveal delay={120}>
              <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-lift sm:p-8">
                <div className="space-y-4">
                  <div className="ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-primary px-5 py-3.5 text-base text-primary-foreground">
                    My mom keeps asking when her husband is coming home. He
                    passed away years ago. What do I do?
                  </div>
                  <div className="max-w-[85%] rounded-3xl rounded-bl-md bg-secondary px-5 py-3.5 text-base text-foreground">
                    That is one of the hardest moments there is. Instead of
                    correcting her, try meeting the feeling underneath: "You
                    miss him. Tell me about him." You are not lying, you are
                    joining her world.
                  </div>
                  <div className="ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-primary px-5 py-3.5 text-base text-primary-foreground">
                    So I shouldn't remind her he passed?
                  </div>
                  <div className="max-w-[85%] rounded-3xl rounded-bl-md bg-secondary px-5 py-3.5 text-base text-foreground">
                    Usually not. Each reminder can feel like hearing the news
                    for the first time. Comfort matters more than accuracy here.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 8 — Care Portal */}
        <section className="border-t border-border/60 bg-secondary/40 py-16 sm:py-20">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="text-2xl tracking-tight sm:text-3xl">
                Already connected to a care community?
              </h2>
              <p className="mt-2 max-w-lg text-base text-muted-foreground">
                Access your personalized Care Portal for resident updates,
                messages, and your care team.
              </p>
            </div>
            <Link
              to="/auth/login"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-foreground/15 bg-card px-7 py-3.5 text-base font-semibold text-foreground shadow-soft transition-colors hover:bg-secondary"
            >
              Access Care Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
