import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/app.functions";
import {
  recordLoginEvent,
  checkLockout,
  recordFailedLogin,
  clearLockoutSelf,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

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

    setLoading(true);
    try {
      const { lockedUntil } = await checkLockout({ data: { email } }).catch(() => ({ lockedUntil: null }));
      if (lockedUntil && lockedUntil > Date.now()) {
        const mins = Math.ceil((lockedUntil - Date.now()) / 60000);
        setError(`Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const res = await recordFailedLogin({ data: { email } }).catch(() => ({ locked: false }));
        if (res.locked) {
          setError("Too many attempts. Try again in 15 minutes.");
        } else {
          setError(error.message);
        }
        return;
      }
      // Successful sign-in: clear any prior lockout/attempt counter.
      void clearLockoutSelf().catch(() => {});
      // Fire-and-forget audit log; never block sign-in on it.
      void recordLoginEvent().catch(() => {});
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
        redirectTo: `${window.location.origin}/auth/reset-password`,
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
        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to our{" "}
          <Link to="/legal/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
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
