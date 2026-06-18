import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setHasSession(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
      setReady(true);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    const { error: uErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (uErr) return setError(uErr.message);
    await supabase.auth.signOut();
    setDone(true);
  }

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!hasSession) {
    return (
      <div>
        <h1 className="text-3xl">Link expired</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This reset link is invalid or has expired. Request a new one from the
          sign-in page.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <h1 className="text-3xl">Password updated</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You can now sign in with your new password.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
        >
          Go to sign in
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a new password for your NeuroTrace account.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">New password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Confirm password</span>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft"
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
          className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
        >
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
