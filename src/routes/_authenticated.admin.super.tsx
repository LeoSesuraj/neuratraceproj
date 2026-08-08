import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Plus, Trash2, ChevronDown, ChevronRight, Mail, UserCog, Users } from "lucide-react";
import {
  listAllFacilities,
  createFacility,
  deleteFacility,
  listAllResidents,
  getFacilityAdminKey,
  getFacilityStaffKey,
  listFacilityStaffing,
} from "@/lib/app.functions";
import { KeyCard } from "@/components/key-card";
import {
  groupByFacility,
  FacilityHeader,
  type ResidentWithFacility,
} from "@/components/grouped-residents";

type StaffingEntry = {
  user_id: string;
  email: string | null;
  name: string | null;
  active: boolean;
};
type Staffing = Record<string, { admins: StaffingEntry[]; staff: StaffingEntry[] }>;


export const Route = createFileRoute("/_authenticated/admin/super")({
  component: SuperAdminPage,
});

type Tab = "facilities" | "residents";

function SuperAdminPage() {
  const [tab, setTab] = useState<Tab>("facilities");

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <header>
        <p className="text-sm font-medium text-primary">Super Admin</p>
        <h1 className="mt-1 text-3xl">Nursing homes</h1>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["facilities", "Nursing homes"],
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
        {tab === "residents" && <ResidentsTab />}
      </div>
    </div>
  );
}

function FacilitiesTab() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const { data: facilities = [] } = useQuery({
    queryKey: ["all-facilities"],
    queryFn: () => listAllFacilities(),
  });
  const create = useMutation({
    mutationFn: () => createFacility({ data: { name } }),
    onSuccess: (f) => {
      setName("");
      setCreating(false);
      setJustCreatedId(f?.id ?? null);
      qc.invalidateQueries({ queryKey: ["all-facilities"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteFacility({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-facilities"] }),
  });

  return (
    <section className="grid gap-4">
      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New nursing home
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) create.mutate();
          }}
          className="rounded-3xl border border-dashed border-border bg-surface/60 p-4"
        >
          <label className="block text-sm font-medium">Nursing home name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunrise Care"
            className="mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            We'll generate today's admin & staff signup keys instantly. Hand
            them to your first admin and at least one staff member.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={!name.trim() || create.isPending}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {create.isPending ? "Creating…" : "Create & generate keys"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setName("");
              }}
              className="rounded-full border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="grid gap-4">
        {facilities.map((f) => (
          <li
            key={f.id}
            className={`rounded-3xl border bg-card p-5 shadow-soft transition-colors ${
              justCreatedId === f.id ? "border-primary" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <p className="text-lg font-medium">{f.name}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete "${f.name}"? This removes all its data.`))
                    del.mutate(f.id);
                }}
                className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Admin signup key
                </p>
                <KeyCard
                  queryKey={["admin-key", f.id]}
                  fetch={() => getFacilityAdminKey({ data: { facility_id: f.id } })}
                />
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Staff signup key
                </p>
                <KeyCard
                  queryKey={["staff-key", f.id]}
                  fetch={() => getFacilityStaffKey({ data: { facility_id: f.id } })}
                />
              </div>
            </div>
            {justCreatedId === f.id && (
              <p className="mt-3 text-xs text-primary">
                Share the admin key with your first admin and the staff key with
                at least one staff member. Keys rotate at midnight UTC.
              </p>
            )}
          </li>
        ))}
        {facilities.length === 0 && (
          <li className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            No nursing homes yet. Create your first above.
          </li>
        )}
      </ul>
    </section>
  );
}

function ResidentsTab() {
  const { data: residents = [] } = useQuery({
    queryKey: ["all-residents"],
    queryFn: () => listAllResidents() as Promise<ResidentWithFacility[]>,
  });
  const groups = groupByFacility(residents);

  if (residents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted-foreground">
        No residents yet.
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {groups.map((g) => (
        <section key={g.facilityId ?? "none"} className="grid gap-3">
          <FacilityHeader name={g.facilityName} count={g.residents.length} />
          <ul className="grid gap-2 sm:grid-cols-2">
            {g.residents.map((r) => (
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
        </section>
      ))}
    </div>
  );
}
