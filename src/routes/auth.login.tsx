import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/app.functions";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type AttemptRecord = { count: number; lockedUntil: number };

function attemptKey(email: string) {
  return `login_attempts:${email.toLowerCase().trim()}`;
}

function readAttempts(email: string): AttemptRecord {
  if (typeof window === "undefined") return { count: 0, lockedUntil: 0 };
  try {
    const raw = localStorage.getItem(attemptKey(email));
    if (!raw) return { count: 0, lockedUntil: 0 };
    return JSON.parse(raw) as AttemptRecord;
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function writeAttempts(email: string, rec: AttemptRecord) {
  try {
    localStorage.setItem(attemptKey(email), JSON.stringify(rec));
  } catch {
    // ignore
  }
}

function clearAttempts(email: string) {
  try {
    localStorage.removeItem(attemptKey(email));
  } catch {
    // ignore
  }
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const rec = readAttempts(email);
    if (rec.lockedUntil && rec.lockedUntil > Date.now()) {
      const mins = Math.ceil((rec.lockedUntil - Date.now()) / 60000);
      setError(`Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const next = rec.count + 1;
        if (next >= MAX_ATTEMPTS) {
          writeAttempts(email, { count: next, lockedUntil: Date.now() + LOCKOUT_MS });
          setError("Too many attempts. Try again in 15 minutes.");
        } else {
          writeAttempts(email, { count: next, lockedUntil: 0 });
          setError(error.message);
        }
        return;
      }
      clearAttempts(email);
      const { role } = await getMyRole();
      if (role === "super_admin") navigate({ to: "/admin/super" });
      else if (role === "admin") navigate({ to: "/admin" });
      else if (role === "staff") navigate({ to: "/staff" });
      else navigate({ to: "/resident" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword() {
    setError(null);
    setInfo(null);
    if (!email) {
      setError("Enter your email above first, then tap Forgot password.");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://neurotraceproj.vercel.app/auth/reset-password",
      });
      if (error) throw error;
      setInfo("Check your email for a reset link.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not send reset email");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to continue to NeuroTrace.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
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
            className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            {info}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={resetLoading}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {resetLoading ? "Sending reset link…" : "Forgot password?"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link to="/" className="text-primary hover:underline">
          Choose how to join
        </Link>
      </p>
    </div>
  );
}
