import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/neurotrace-logo.png";
import { ArrowRight, BookOpen, LogIn, UserPlus, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroTrace — Sign in" },
      {
        name: "description",
        content:
          "Sign in to NeuroTrace, join your facility, or explore our free Learn module about dementia caregiving.",
      },
    ],
  }),
  component: LandingPage,
});

type Card = {
  to:
    | "/auth/login"
    | "/auth/join-staff"
    | "/auth/join-family"
    | "/learn";
  icon: typeof LogIn;
  label: string;
  description: string;
  tone: string;
  primary?: boolean;
};

const loginCard = {

  to: "/auth/login" as const,
  icon: LogIn,
  label: "Log in",
  description:
    "For admins, staff, and family members who already have an account.",
  tone: "bg-sky-soft",
};

const secondaryCards: Card[] = [
  {
    to: "/auth/join-staff",
    icon: UserPlus,
    label: "Join as Staff",
    description:
      "Request access to your facility. An admin will approve your request.",
    tone: "bg-sage/40",
  },
  {
    to: "/auth/join-family",
    icon: Users,
    label: "Join as Family",
    description:
      "Have an invite link from staff? Create your family account here.",
    tone: "bg-warm/70",
  },
  {
    to: "/learn",
    icon: BookOpen,
    label: "Learn about dementia",
    description:
      "Free guides, articles, and an AI coach — no account required.",
    tone: "bg-surface-soft",
  },
];

function LandingPage() {
  const PrimaryIcon = loginCard.icon;
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
        <header className="flex flex-col items-center text-center">
          <img src={logo} alt="" width={88} height={88} className="h-22 w-22" style={{ height: 88, width: 88 }} />
          <h1 className="mt-5 text-4xl leading-[1.05] sm:text-5xl">
            Welcome to <span className="text-primary">NeuroTrace</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            A gentle companion for families and care teams supporting someone
            with dementia.
          </p>
        </header>

        <Link
          to={loginCard.to}
          className="group mt-10 flex items-start gap-5 rounded-3xl border border-primary/30 bg-card p-7 shadow-lift ring-1 ring-primary/20 transition-all hover:-translate-y-0.5 sm:p-9"
        >
          <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${loginCard.tone} sm:h-20 sm:w-20`}>
            <PrimaryIcon className="h-8 w-8 text-foreground sm:h-9 sm:w-9" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl leading-snug sm:text-3xl">{loginCard.label}</h2>
            <p className="mt-2 text-base text-muted-foreground">
              {loginCard.description}
            </p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
              Continue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {secondaryCards.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.to}>
                <Link
                  to={c.to}
                  className="group flex h-full items-start gap-3 rounded-3xl border border-border/70 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${c.tone}`}
                  >
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold leading-snug">{c.label}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                      Continue
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>


        <p className="mt-10 text-center text-xs text-muted-foreground">
          NeuroTrace is for education and emotional support only. It is not a
          diagnostic tool or a substitute for medical care.
        </p>
      </main>
    </div>
  );
}
