import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { situations } from "@/lib/situations";
import {
  ArrowRight,
  BookOpen,
  Compass,
  LifeBuoy,
  MessageCircleHeart,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "NeuroTrace — A gentle companion for dementia caregivers" },
      {
        name: "description",
        content:
          "Understand dementia behaviors, communicate with your loved one, and feel less alone.",
      },
    ],
  }),
  component: HomePage,
});

const pillars = [
  {
    to: "/learn/connect" as const,
    label: "Connect",
    icon: MessageCircleHeart,
    description: "In-the-moment guides for the hardest behaviors.",
    tone: "bg-sky-soft",
  },
  {
    to: "/learn/understand" as const,
    label: "Understand",
    icon: BookOpen,
    description: "Why dementia changes memory, mood, and behavior.",
    tone: "bg-sage/40",
  },
  {
    to: "/learn/journey" as const,
    label: "Journey",
    icon: Compass,
    description: "A gentle road map of what to expect over time.",
    tone: "bg-warm/70",
  },
  {
    to: "/learn/support" as const,
    label: "Support",
    icon: LifeBuoy,
    description: "Resources, tips, and reminders for caregivers.",
    tone: "bg-surface-soft",
  },
];

function HomePage() {
  const featured = situations.slice(0, 3);

  return (
    <AppShell>
      <section className="pt-2 sm:pt-8">
        <p className="text-sm font-medium text-primary">A companion for the journey</p>
        <h1 className="mt-3 text-4xl leading-[1.05] sm:text-5xl">
          The disease is hard.
          <br />
          <span className="text-primary">Connection still happens.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          NeuroTrace helps families of people living with Alzheimer's and dementia
          understand the behaviors, find the right words, and feel less alone — one
          gentle moment at a time.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            to="/learn/connect"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Browse situations
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/learn/coach"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Talk to the AI Coach
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-3 sm:grid-cols-2">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.to}
              to={p.to}
              className="group flex items-start gap-3 rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${p.tone}`}
              >
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg leading-snug">{p.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {p.description}
                </p>
              </div>
              <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          );
        })}
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl">When this happens, try this.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Short, practical guides for the most common moments.
            </p>
          </div>
          <Link
            to="/learn/connect"
            className="hidden text-sm font-medium text-primary hover:underline sm:inline"
          >
            See all
          </Link>
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {featured.map((s) => (
            <li key={s.slug}>
              <Link
                to="/learn/connect/$situation"
                params={{ situation: s.slug }}
                className="group block h-full rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-soft">
                    <MessageCircleHeart className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg leading-snug">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                  Read guide
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-sky-soft via-surface to-warm/60 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-card shadow-soft">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl">Ask anything, anytime.</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              The NeuroTrace Coach is trained to help you navigate hard caregiving
              moments — "My mom keeps asking for her mother," "My dad doesn't
              recognize me anymore" — with calm, practical guidance.
            </p>
            <Link
              to="/learn/coach"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Start a conversation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        NeuroTrace is for education and emotional support only. It is not a
        diagnostic tool or a substitute for medical care.
      </p>
    </AppShell>
  );
}
