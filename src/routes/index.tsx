import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/neurotrace-logo.png";
import { BookOpen, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole, seedDemoAccounts } from "@/lib/app.functions";

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
  to: "/auth/join" | "/learn";
  icon: typeof UserPlus;
  label: string;
  description: string;
  tone: string;
  iconColor: string;
};

const secondaryCards: SecondaryCard[] = [
  {
    to: "/auth/join",
    icon: UserPlus,
    label: "Join with a key",
    description: "Family, staff, or admin — sign up with today's key.",
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
      if (role === "super_admin") navigate({ to: "/admin/super" });
      else if (role === "admin") navigate({ to: "/admin" });
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

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
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

        <DemoAccounts />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          NeuroTrace is for education and emotional support only. It is not a
          diagnostic tool or a substitute for medical care.
        </p>
      </main>
    </div>
  );
}

const DEMO_ACCOUNTS = [
  { role: "Super Admin", email: "leonelbaskin@gmail.com", password: "SuperAdmin123!" },
  { role: "Facility Admin", email: "admin@demo.test", password: "Admin123!" },
  { role: "Staff", email: "staff@demo.test", password: "Staff123!" },
  { role: "Family", email: "family@demo.test", password: "Family123!" },
];

function DemoAccounts() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function seed() {
    setStatus("loading");
    setMsg(null);
    try {
      await seedDemoAccounts();
      setStatus("done");
      setMsg("Demo accounts ready. Sign in with any of the credentials below.");
    } catch (e: any) {
      setStatus("error");
      setMsg(e.message ?? "Seed failed");
    }
  }

  return (
    <div className="mt-10 rounded-3xl border border-dashed border-border bg-surface/60 p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left text-sm font-medium"
      >
        {open ? "▾" : "▸"} Demo / test accounts
      </button>
      {open && (
        <div className="mt-3 space-y-3 text-sm">
          <button
            onClick={seed}
            disabled={status === "loading"}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            {status === "loading" ? "Setting up…" : "Set up demo accounts"}
          </button>
          {msg && (
            <p className={status === "error" ? "text-destructive text-xs" : "text-xs text-muted-foreground"}>
              {msg}
            </p>
          )}
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="text-left font-medium">Role</th>
                <th className="text-left font-medium">Email</th>
                <th className="text-left font-medium">Password</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {DEMO_ACCOUNTS.map((a) => (
                <tr key={a.email} className="border-t border-border">
                  <td className="py-1 pr-2 font-sans">{a.role}</td>
                  <td className="py-1 pr-2">{a.email}</td>
                  <td className="py-1">{a.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
