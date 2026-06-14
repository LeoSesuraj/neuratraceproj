import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { submitStaffRequest } from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/join-staff")({
  component: JoinStaff,
});

function JoinStaff() {
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string }>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("id, name")
        .order("name");
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        return;
      }
      setFacilities(data ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [email, setEmail] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await submitStaffRequest({ data: { email, facility_id: facilityId } });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? "Could not submit request");
    }
  }

  if (submitted) {
    return (
      <div>
        <h1 className="text-3xl">Request submitted</h1>
        <p className="mt-3 text-muted-foreground">
          We've notified the admin at your facility. Once they approve, you'll
          receive an email with a link to set your password and finish setting
          up your account.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl">Join as Staff</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your work email and select your facility. An admin will approve
        your request.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Work email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Facility</span>
          <select
            required
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm shadow-soft"
          >
            <option value="">
              {loadError
                ? "Could not load facilities"
                : facilities.length === 0
                  ? "Loading facilities…"
                  : "Select a facility…"}
            </option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
        >
          Submit request
        </button>
      </form>
    </div>
  );
}
