import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/neurotrace-logo.png";
import { BookOpen, UserPlus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/app.functions";

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

type SecondaryCard = {
  to: "/auth/join-staff" | "/auth/join-family" | "/learn";
  icon: typeof UserPlus;
  label: string;
  description: string;
  tone: string;
  iconColor: string;
};

const secondaryCards: SecondaryCard[] = [
  {
    to: "/auth/join-staff",
    icon: UserPlus,
    label: "Join as Staff",
    description: "Request access to your facility.",
    tone: "bg-sage/40",
    iconColor: "text-foreground",
  },
  {
    to: "/auth/join-family",
    icon: Users,
    label: "Join as Family",
    description: "Have an invite link? Get started here.",
    tone: "bg-warm/70",
    iconColor: "text-foreground",
  },
  {
    to: "/learn",
    icon: BookOpen,
    label: "Learn about dementia",
    description: "Free guides & AI coach. No account needed.",
    tone: "bg-sky-soft",
    iconColor: "text-foreground",
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { role } = await getMyRole();
      if (role === "admin") navigate({ to: "/admin" });
      else if (role === "staff") navigate({ to: "/staff" });
      else navigate({ to: "/resident" });
    } catch (e: any) {
      setError(e.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
        <header className="flex flex-col items-center text-center">
          <img src={logo} alt="" width={88} height={88} className="h-22 w-22" style={{ height: 88, width: 88 }} />
          <h1 className="mt-5 text-4xl leading-[1.05] sm:text-6xl">
            Welcome to <span className="text-primary">NeuroTrace</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            A gentle companion for families and care teams supporting someone
            with dementia.
          </p>
        </header>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-95 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">Or get started another way</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {secondaryCards.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.to}>
                <Link
                  to={c.to}
                  className="group flex h-full flex-col items-center gap-3 rounded-3xl border border-border/70 bg-card p-5 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${c.tone}`}>
                    <Icon className={`h-5 w-5 ${c.iconColor}`} />
                  </div>
                  <h2 className="text-base font-semibold leading-snug">{c.label}</h2>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
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
