import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listPendingStaffRequests,
  decideStaffRequest,
  listResidentsForMe,
  listFacilities,
  inviteAdmin,
} from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: requests = [] } = useQuery({
    queryKey: ["staff-requests"],
    queryFn: () => listPendingStaffRequests(),
  });
  const { data: residents = [] } = useQuery({
    queryKey: ["residents"],
    queryFn: () => listResidentsForMe(),
  });
  const { data: facilities = [] } = useQuery({
    queryKey: ["facilities"],
    queryFn: () => listFacilities(),
  });
  const decide = useMutation({
    mutationFn: (vars: { id: string; approve: boolean }) =>
      decideStaffRequest({ data: vars }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["staff-requests"] });
      toast.success(vars.approve ? "Approved — invite email sent." : "Request denied.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminFacility, setAdminFacility] = useState("");

  const invite = useMutation({
    mutationFn: (vars: { email: string; facility_id: string }) =>
      inviteAdmin({ data: vars }),
    onSuccess: () => {
      toast.success("Admin invite email sent.");
      setAdminEmail("");
      setAdminFacility("");
      setShowAdminForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Admin</p>
          <h1 className="mt-1 text-3xl">Facility dashboard</h1>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </header>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Admins</h2>
          <button
            onClick={() => setShowAdminForm((v) => !v)}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            {showAdminForm ? "Cancel" : "Add admin"}
          </button>
        </div>
        {showAdminForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!adminEmail || !adminFacility) return;
              invite.mutate({ email: adminEmail, facility_id: adminFacility });
            }}
            className="mt-3 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Email</span>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2"
                placeholder="admin@example.com"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Facility</span>
              <select
                required
                value={adminFacility}
                onChange={(e) => setAdminFacility(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2"
              >
                <option value="" disabled>
                  Select a facility
                </option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={invite.isPending}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {invite.isPending ? "Sending…" : "Send admin invite"}
            </button>
          </form>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl">Staff requests</h2>
        <ul className="mt-3 grid gap-2">
          {requests.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted-foreground">
              No pending requests.
            </li>
          )}
          {requests.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div>
                <p className="font-medium">{r.email}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => decide.mutate({ id: r.id, approve: false })}
                  className="rounded-full border border-border px-3 py-1.5 text-xs"
                >
                  Deny
                </button>
                <button
                  onClick={() => decide.mutate({ id: r.id, approve: true })}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Approve
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl">Residents ({residents.length})</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {residents.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <p className="font-medium">{r.name}</p>
              {r.dementia_type && (
                <p className="text-xs text-muted-foreground">{r.dementia_type}</p>
              )}
            </li>
          ))}
        </ul>
        <Link
          to="/staff"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Go to staff tools →
        </Link>
      </section>
    </div>
  );
}
