import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lookupKey, redeemKey, signupWithKey } from "@/lib/app.functions";

const searchSchema = z.object({ code: z.string().optional() });

export const Route = createFileRoute("/auth/join")({
  validateSearch: (s) => searchSchema.parse(s),
  component: JoinPage,
});

type Lookup =
  | { found: false }
  | {
      found: true;
      kind: "family" | "staff" | "admin";
      resident_id?: string;
      resident_name?: string;
      facility_id?: string;
      facility_name?: string | null;
    };

function JoinPage() {
  const navigate = useNavigate();
  const { code: initialCode } = Route.useSearch();
  const [code, setCode] = useState(initialCode ?? "");
  const [info, setInfo] = useState<Lookup | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCode) verify(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify(c: string) {
    setError(null);
    try {
      const r = (await lookupKey({ data: { code: c } })) as Lookup;
      if (!r.found) {
        setError("Key not recognized. Keys refresh every day at midnight UTC.");
        return;
      }
      setInfo(r);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    }
  }

  async function onSubmitKey(e: React.FormEvent) {
    e.preventDefault();
    await verify(code);
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (sess.session) await supabase.auth.signOut();
      await signupWithKey({ data: { email, password } });
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) throw signInErr;
      const r = await redeemKey({ data: { code } });
      if (r.kind === "family" && r.resident_id) {
        navigate({ to: "/resident/$residentId", params: { residentId: r.resident_id } });
      }
      else if (r.kind === "staff") navigate({ to: "/staff" });
      else navigate({ to: "/admin" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  if (!info) {
    return (
      <div>
        <h1 className="text-3xl">Join with a key</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 8-character key from your facility, staff, or admin. Keys
          refresh every day at midnight UTC.
        </p>
        <form onSubmit={onSubmitKey} className="mt-8 space-y-4">
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCD-EFGH"
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-center font-mono text-lg tracking-widest shadow-soft"
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

  if (!info.found) return null;
  const role =
    info.kind === "family"
      ? `${info.resident_name}'s family`
      : info.kind === "staff"
        ? `staff at ${info.facility_name}`
        : `admin at ${info.facility_name}`;

  return (
    <div>
      <h1 className="text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You're joining as <span className="font-medium text-foreground">{role}</span>.
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
        <button
          type="button"
          onClick={() => setInfo(null)}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          ← Use a different key
        </button>
      </form>
    </div>
  );
}
