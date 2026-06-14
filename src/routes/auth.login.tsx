import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/app.functions";
import logo from "@/assets/neurotrace-logo.png";
import { Users, Mail, Compass } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

function LoginPage() {
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
    <div className="flex min-h-dvh items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <img src={logo} alt="NeuroTrace" width={56} height={56} className="h-14 w-14" />
          <span className="mt-3 font-display text-2xl tracking-tight">NeuroTrace</span>
        </div>

        {/* Form */}
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

        {/* Secondary options — compact row */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <Link
            to="/auth/join-staff"
            className="flex flex-col items-center rounded-xl border border-border bg-surface-soft px-2 py-3 text-center transition-colors hover:bg-accent"
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="mt-1.5 text-[11px] font-medium leading-tight text-muted-foreground">
              Join as<br />Staff
            </span>
          </Link>
          <button
            type="button"
            onClick={openInvite}
            className="flex flex-col items-center rounded-xl border border-border bg-surface-soft px-2 py-3 text-center transition-colors hover:bg-accent"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="mt-1.5 text-[11px] font-medium leading-tight text-muted-foreground">
              Join as<br />Family
            </span>
          </button>
          <Link
            to="/learn"
            className="flex flex-col items-center rounded-xl border border-border bg-surface-soft px-2 py-3 text-center transition-colors hover:bg-accent"
          >
            <Compass className="h-4 w-4 text-muted-foreground" />
            <span className="mt-1.5 text-[11px] font-medium leading-tight text-muted-foreground">
              Explore<br />without account
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
