import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listAllFacilities,
  createFacility,
  deleteFacility,
  listAllStaffRequests,
  decideStaffRequestSuper,
  listAllResidents,
  createFacilityAdmin,
} from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/super")({
  component: SuperAdminPage,
});

type Tab = "facilities" | "requests" | "admins" | "residents";

function SuperAdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("facilities");

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Super Admin</p>
          <h1 className="mt-1 text-3xl">All facilities</h1>
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

      <nav className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["facilities", "Facilities"],
            ["requests", "Staff requests"],
            ["admins", "Facility admins"],
            ["residents", "All residents"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              tab === k
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground hover:bg-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "facilities" && <FacilitiesTab />}
        {tab === "requests" && <RequestsTab />}
        {tab === "admins" && <AdminsTab />}
        {tab === "residents" && <ResidentsTab />}
      </div>
    </div>
  );
}

function FacilitiesTab() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const { data: facilities = [] } = useQuery({
    queryKey: ["all-facilities"],
    queryFn: () => listAllFacilities(),
  });
  const create = useMutation({
    mutationFn: () => createFacility({ data: { name } }),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["all-facilities"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteFacility({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-facilities"] }),
  });

  return (
    <section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New facility name"
          className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
        />
        <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Add facility
        </button>
      </form>

      <ul className="mt-5 grid gap-2">
        {facilities.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <span className="font-medium">{f.name}</span>
            <button
              onClick={() => {
                if (confirm(`Delete facility "${f.name}"? This deletes all its data.`))
                  del.mutate(f.id);
              }}
              className="text-xs text-destructive hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RequestsTab() {
  const qc = useQueryClient();
  const { data: requests = [] } = useQuery({
    queryKey: ["all-staff-requests"],
    queryFn: () => listAllStaffRequests(),
  });
  const decide = useMutation({
    mutationFn: (v: { id: string; approve: boolean }) => decideStaffRequestSuper({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-staff-requests"] }),
  });

  return (
    <ul className="grid gap-2">
      {requests.length === 0 && (
        <li className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted-foreground">
          No staff requests.
        </li>
      )}
      {requests.map((r) => {
        const facility = (r as { facilities: { name: string } | null }).facilities;
        return (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <div>
              <p className="font-medium">{r.email}</p>
              <p className="text-xs text-muted-foreground">
                {facility?.name ?? "—"} · {r.status} ·{" "}
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            {r.status === "pending" && (
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
            )}
          </li>
        );
      })}
    </ul>
  );
}

function AdminsTab() {
  const { data: facilities = [] } = useQuery({
    queryKey: ["all-facilities"],
    queryFn: () => listAllFacilities(),
  });
  const [email, setEmail] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: () => createFacilityAdmin({ data: { email, facility_id: facilityId } }),
    onSuccess: () => {
      setMsg(`Invite sent to ${email}.`);
      setEmail("");
    },
    onError: (e: Error) => setMsg(e.message),
  });

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-lg">Invite a new facility admin</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email && facilityId) create.mutate();
        }}
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          type="email"
          required
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
        />
        <select
          required
          value={facilityId}
          onChange={(e) => setFacilityId(e.target.value)}
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
        >
          <option value="">Choose facility…</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <button
          disabled={create.isPending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {create.isPending ? "Sending…" : "Send invite"}
        </button>
      </form>
      {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}
    </section>
  );
}

function ResidentsTab() {
  const { data: residents = [] } = useQuery({
    queryKey: ["all-residents"],
    queryFn: () => listAllResidents(),
  });

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {residents.length === 0 && (
        <li className="col-span-full rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted-foreground">
          No residents yet.
        </li>
      )}
      {residents.map((r) => {
        const facility = (r as { facilities: { name: string } | null }).facilities;
        return (
          <li
            key={r.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">
              {facility?.name ?? "—"}
              {r.dementia_type ? ` · ${r.dementia_type}` : ""}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
