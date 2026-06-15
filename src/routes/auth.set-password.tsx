import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/app.functions";

export const Route = createFileRoute("/auth/set-password")({
  component: SetPasswordPage,
});

function SetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // supabase-js auto-detects the access_token in the URL hash from the
    // invite/recovery email and creates a session. Give it a tick, then check.
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setHasSession(!!data.session);
      setReady(true);
    };
    check();
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
    if (uErr) {
      setLoading(false);
      return setError(uErr.message);
    }
    try {
      const r = await getMyRole();
      const dest =
        r.role === "super_admin"
          ? "/admin/super"
          : r.role === "admin"
            ? "/admin"
            : r.role === "staff"
              ? "/staff"
              : "/resident";
      navigate({ to: dest });
    } catch {
      navigate({ to: "/" });
    }
  }

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!hasSession) {
    return (
      <div>
        <h1 className="text-3xl">Link expired</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This invite link is invalid or has expired. Ask your admin to send a
          new invite.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl">Set your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome to NeuroTrace. Choose a password to finish setting up your
        account.
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
          {loading ? "Saving…" : "Set password & continue"}
        </button>
      </form>
    </div>
  );
}
