import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lookupInvite, redeemFamilyInvite } from "@/lib/app.functions";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/auth/join-family")({
  validateSearch: (s) => searchSchema.parse(s),
  component: JoinFamily,
});

function JoinFamily() {
  const navigate = useNavigate();
  const { token: initialToken } = Route.useSearch();
  const [token, setToken] = useState(initialToken ?? "");
  const [invite, setInvite] = useState<
    null | { residentName: string | null; used: boolean }
  >(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialToken) return;
    lookupInvite({ data: { token: initialToken } })
      .then((r) => {
        if (!r.found) setError("Invite not found.");
        else if (r.role !== "family") setError("This invite isn't for family signup.");
        else setInvite({ residentName: r.residentName, used: r.used });
      })
      .catch((e) => setError(e.message));
  }, [initialToken]);

  async function onLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const r = await lookupInvite({ data: { token } });
      if (!r.found) return setError("Invite not found.");
      if (r.role !== "family") return setError("This invite isn't for family signup.");
      setInvite({ residentName: r.residentName, used: r.used });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: sErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (sErr) throw sErr;
      // If email confirmations are off, session is already active.
      // Try to sign in (no-op if already signed in).
      await supabase.auth.signInWithPassword({ email, password });
      await redeemFamilyInvite({ data: { token } });
      navigate({ to: "/resident" });
    } catch (e: any) {
      setError(e.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  if (!invite) {
    return (
      <div>
        <h1 className="text-3xl">Join as Family</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Paste the invite link or token you received from staff.
        </p>
        <form onSubmit={onLookup} className="mt-8 space-y-4">
          <input
            required
            value={token}
            onChange={(e) =>
              setToken(
                e.target.value
                  .trim()
                  .replace(/^.*token=/, "")
                  .replace(/[^a-f0-9-]/gi, ""),
              )
            }
            placeholder="Invite token"
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft"
          />
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  if (invite.used) {
    return (
      <div>
        <h1 className="text-3xl">Invite already used</h1>
        <p className="mt-3 text-muted-foreground">
          This invite has already been claimed. If you're a returning family
          member, please sign in instead.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You're joining {invite.residentName ? `${invite.residentName}'s` : "your"} family
        circle on NeuroTrace.
      </p>
      <form onSubmit={onSignup} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Creating account…" : "Create account"}
        </button>
        <p className="text-xs text-muted-foreground">
          For added security, you can enable two-factor authentication from your
          account settings after signing in.
        </p>
      </form>
    </div>
  );
}
