import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { lookupKey, signupWithKey } from "@/lib/app.functions";
import { isValidPassword, PASSWORD_HINT } from "@/lib/password";


const searchSchema = z.object({ code: z.string().optional() });

const KEY_RE = /^[A-Z0-9]{8}$/;

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
  const { code: initialCode } = Route.useSearch();
  const [code, setCode] = useState(initialCode ?? "");
  const [info, setInfo] = useState<Lookup | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const keyFormatError =
    code.length > 0 && !KEY_RE.test(code)
      ? "Key must be exactly 8 characters, letters and numbers only."
      : null;

  useEffect(() => {
    if (initialCode && KEY_RE.test(initialCode)) verify(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify(c: string) {
    setError(null);
    try {
      const r = (await lookupKey({ data: { code: c } })) as Lookup;
      if (!r.found) {
        setError(
          "This key is invalid or has expired. Ask your facility administrator for today's key.",
        );
        return;
      }
      setInfo(r);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    }
  }

  async function onSubmitKey(e: React.FormEvent) {
    e.preventDefault();
    if (!KEY_RE.test(code)) {
      setError("Key must be exactly 8 characters, letters and numbers only.");
      return;
    }
    await verify(code);
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidPassword(password)) {
      setError(PASSWORD_HINT);
      return;
    }
    setLoading(true);
    try {
      await signupWithKey({ data: { email, password, code } });
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }


  if (done) {
    return (
      <div>
        <h1 className="text-3xl">Account created</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You can sign in now with your email and password.
        </p>
        <Link
          to="/auth/login"
          className="mt-6 inline-block rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (!info) {
    return (
      <div>
        <h1 className="text-3xl font-sans font-semibold">Join with a key</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 8-character key from your facility, staff, or admin. Keys
          refresh every day at midnight UTC.
        </p>
        <form onSubmit={onSubmitKey} className="mt-8 space-y-4">
          <input
            required
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))
            }
            placeholder="ABCD1234"
            maxLength={8}
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="one-time-code"
            aria-label="8-character access key"
            className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-center font-mono text-xl tracking-widest shadow-soft min-h-[48px]"
          />
          {keyFormatError && (
            <p className="text-xs text-destructive">{keyFormatError}</p>
          )}
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!KEY_RE.test(code)}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
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
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft"
          />
          <p className="mt-1 text-xs text-muted-foreground">{PASSWORD_HINT}</p>
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
