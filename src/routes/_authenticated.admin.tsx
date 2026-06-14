import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listPendingStaffRequests, decideStaffRequest, listResidentsForMe } from "@/lib/app.functions";
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
  const decide = useMutation({
    mutationFn: (vars: { id: string; approve: boolean }) =>
      decideStaffRequest({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-requests"] }),
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
