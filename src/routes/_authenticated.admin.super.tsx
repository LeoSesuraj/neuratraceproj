import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listAllFacilities,
  createFacility,
  deleteFacility,
  listAllResidents,
  getFacilityAdminKey,
} from "@/lib/app.functions";
import { KeyCard } from "@/components/key-card";

export const Route = createFileRoute("/_authenticated/admin/super")({
  component: SuperAdminPage,
});

type Tab = "facilities" | "keys" | "residents";

function SuperAdminPage() {
  const [tab, setTab] = useState<Tab>("facilities");

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <header>
        <p className="text-sm font-medium text-primary">Super Admin</p>
        <h1 className="mt-1 text-3xl">All facilities</h1>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["facilities", "Facilities"],
            ["keys", "Admin signup keys"],
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
        {tab === "keys" && <KeysTab />}
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

function KeysTab() {
  const { data: facilities = [] } = useQuery({
    queryKey: ["all-facilities"],
    queryFn: () => listAllFacilities(),
  });

  return (
    <section>
      <p className="text-sm text-muted-foreground">
        Each facility has a daily-rotating key for new admins to sign up. Share
        privately. Keys refresh at midnight UTC.
      </p>
      <ul className="mt-4 grid gap-3">
        {facilities.map((f) => (
          <li key={f.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="font-medium">{f.name}</p>
            <div className="mt-2">
              <KeyCard
                queryKey={["admin-key", f.id]}
                fetch={() => getFacilityAdminKey({ data: { facility_id: f.id } })}
              />
            </div>
          </li>
        ))}
      </ul>
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
