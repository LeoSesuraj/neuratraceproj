import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/app.functions";
import logo from "@/assets/neurotrace-logo.png";
import { UserPlus, Users, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroTrace — Welcome" },
      {
        name: "description",
        content:
          "Sign in to NeuroTrace, join your facility, or explore our free Learn module about dementia caregiving.",
      },
    ],
  }),
  component: LandingPage,
});

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
      if (role === "super_admin" || role === "admin") navigate({ to: "/admin" });
      else if (role === "staff") navigate({ to: "/staff" });
      else if (role === "family") navigate({ to: "/resident" });
      else navigate({ to: "/resident" });
    } catch (e: any) {
      setError(e.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  function openInvite() {
    const token = window.prompt("Paste your invite token or link:");
    if (!token) return;
    const match = token.match(/token=([0-9a-f-]{36})/i);
    const t = match ? match[1] : token.trim();
    navigate({ to: "/auth/join-family", search: { token: t } as any });
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-md px-5 py-10 sm:py-16">
        {/* Header */}
        <header className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="NeuroTrace"
            width={72}
            height={72}
            className="h-18 w-18"
          />
          <h1 className="mt-5 text-3xl leading-tight sm:text-4xl">
            Welcome to <span className="text-primary">NeuroTrace</span>
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            A gentle companion for families and care teams supporting someone
            with dementia.
          </p>
        </header>

        {/* Login form */}
        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
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
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
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
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">Or get started another way</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Three entry cards */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link
            to="/auth/join-staff"
            className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sage/40">
              <UserPlus className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="mt-3 text-sm font-semibold">Join as Staff</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Request access to your facility.
            </p>
          </Link>

          <button
            type="button"
            onClick={openInvite}
            className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-warm/70">
              <Users className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="mt-3 text-sm font-semibold">Join as Family</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Have an invite link? Get started here.
            </p>
          </button>

          <Link
            to="/learn"
            className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-soft">
              <BookOpen className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="mt-3 text-sm font-semibold">Learn about dementia</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Free guides & AI coach. No account needed.
            </p>
          </Link>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          NeuroTrace is for education and emotional support only. It is not a
          diagnostic tool or a substitute for medical care.
        </p>
      </main>
    </div>
  );
}
