import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  listPendingStaffRequests,
  decideStaffRequest,
  listResidentsForMe,
  listFacilities,
  inviteAdmin,
  getMyRole,
  listAllFacilities,
  createFacility,
  deleteFacility,
  createResident,
} from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: me } = useQuery({ queryKey: ["my-role"], queryFn: () => getMyRole() });
  const isSuper = me?.isSuperAdmin ?? false;

  const { data: facilities = [] } = useQuery({
    queryKey: ["facilities"],
    queryFn: () => listFacilities(),
  });

  const [facilityFilter, setFacilityFilter] = useState<string>(""); // "" = all
  const activeFacility = isSuper ? facilityFilter : me?.facilityId ?? "";

  const { data: requests = [] } = useQuery({
    queryKey: ["staff-requests"],
    queryFn: () => listPendingStaffRequests(),
  });
  const { data: residents = [] } = useQuery({
    queryKey: ["residents"],
    queryFn: () => listResidentsForMe(),
  });

  const visibleRequests = useMemo(
    () => (activeFacility ? requests.filter((r) => r.facility_id === activeFacility) : requests),
    [requests, activeFacility],
  );
  const visibleResidents = useMemo(
    () => (activeFacility ? residents.filter((r) => r.facility_id === activeFacility) : residents),
    [residents, activeFacility],
  );

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
          <p className="text-sm font-medium text-primary">
            {isSuper ? "Super admin" : "Admin"}
          </p>
          <h1 className="mt-1 text-3xl">
            {isSuper ? "All facilities" : "Facility dashboard"}
          </h1>
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

      {isSuper && (
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Viewing:</span>
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All facilities</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isSuper && <FacilitiesSection />}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Admins</h2>
          <button
            onClick={() => {
              setShowAdminForm((v) => !v);
              if (!isSuper && me?.facilityId) setAdminFacility(me.facilityId);
            }}
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
                disabled={!isSuper}
                onChange={(e) => setAdminFacility(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 disabled:opacity-70"
              >
                <option value="" disabled>
                  Select a facility
                </option>
                {(isSuper ? facilities : facilities.filter((f) => f.id === me?.facilityId)).map(
                  (f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ),
                )}
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
          {visibleRequests.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted-foreground">
              No pending requests.
            </li>
          )}
          {visibleRequests.map((r) => {
            const f = facilities.find((x) => x.id === r.facility_id);
            return (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div>
                  <p className="font-medium">{r.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {f?.name ?? r.facility_id} · {new Date(r.created_at).toLocaleString()}
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
            );
          })}
        </ul>
      </section>

      <ResidentsSection
        residents={visibleResidents}
        facilities={facilities}
        defaultFacilityId={activeFacility || me?.facilityId || ""}
        isSuper={isSuper}
      />

      <Link
        to="/staff"
        className="mt-8 inline-block text-sm font-medium text-primary hover:underline"
      >
        Go to staff tools →
      </Link>
    </div>
  );
}

function FacilitiesSection() {
  const qc = useQueryClient();
  const { data: all = [] } = useQuery({
    queryKey: ["all-facilities"],
    queryFn: () => listAllFacilities(),
  });
  const [name, setName] = useState("");
  const add = useMutation({
    mutationFn: () => createFacility({ data: { name } }),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["all-facilities"] });
      qc.invalidateQueries({ queryKey: ["facilities"] });
      toast.success("Facility created.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteFacility({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-facilities"] });
      qc.invalidateQueries({ queryKey: ["facilities"] });
      toast.success("Facility removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="mt-8">
      <h2 className="text-xl">Facilities</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) add.mutate();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New facility name"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Add
        </button>
      </form>
      <ul className="mt-3 grid gap-2">
        {all.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 text-sm shadow-soft"
          >
            <span>{f.name}</span>
            <button
              onClick={() => {
                if (confirm(`Remove ${f.name}?`)) del.mutate(f.id);
              }}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResidentsSection({
  residents,
  facilities,
  defaultFacilityId,
  isSuper,
}: {
  residents: Array<{ id: string; name: string; dementia_type: string | null; facility_id: string }>;
  facilities: Array<{ id: string; name: string }>;
  defaultFacilityId: string;
  isSuper: boolean;
}) {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [dementia, setDementia] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () =>
      createResident({
        data: { name, date_of_birth: dob || undefined, dementia_type: dementia || undefined },
      }),
    onSuccess: (r) => {
      setName("");
      setDob("");
      setDementia("");
      qc.invalidateQueries({ queryKey: ["residents"] });
      if (r.inviteToken) {
        setInviteLink(`${window.location.origin}/auth/join-family?token=${r.inviteToken}`);
      }
      toast.success("Resident added.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Residents ({residents.length})</h2>
        {!isSuper && (
          <button
            onClick={() => setShow((v) => !v)}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            {show ? "Cancel" : "Add resident"}
          </button>
        )}
      </div>

      {show && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) create.mutate();
          }}
          className="mt-3 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Resident name"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            required
          />
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            value={dementia}
            onChange={(e) => setDementia(e.target.value)}
            placeholder="Dementia type (optional)"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Create resident
          </button>
        </form>
      )}

      {inviteLink && (
        <div className="mt-3 rounded-2xl border border-sky-soft bg-sky-soft/40 p-4 text-sm">
          <p className="font-medium">Family invite link:</p>
          <p className="mt-1 break-all font-mono text-xs">{inviteLink}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteLink);
              toast.success("Copied.");
            }}
            className="mt-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
          >
            Copy link
          </button>
        </div>
      )}

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {residents.map((r) => {
          const f = facilities.find((x) => x.id === r.facility_id);
          return (
            <li
              key={r.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <p className="font-medium">{r.name}</p>
              <p className="text-xs text-muted-foreground">
                {[f?.name, r.dementia_type].filter(Boolean).join(" · ")}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
