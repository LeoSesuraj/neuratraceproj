import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Users,
  ScrollText,
  HeartHandshake,
  KeyRound,
  Trash2,
  UserMinus,
  UserPlus,
  Plus,
  Pause,
  Play,
  Link2Off,
} from "lucide-react";
import { getFacilityStaffKey, getMyRole } from "@/lib/app.functions";
import {
  listFacilityUsers,
  listAccessLog,
  listFacilityResidents,
  deactivateUser,
  reactivateUser,
  removeUser,
  adminCreateResident,
  deactivateResident,
  reactivateResident,
  linkFamilyByEmail,
  unlinkFamilyFromResident,
} from "@/lib/admin.functions";
import { KeyCard } from "@/components/key-card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BetaWarningBar } from "@/components/beta-notice";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminPage,
});

type Tab = "overview" | "users" | "access" | "residents";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const { data: roleInfo } = useQuery({
    queryKey: ["my-role"],
    queryFn: () => getMyRole(),
  });
  const facilityId = roleInfo?.facilityId ?? null;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <header>
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="mt-1 text-3xl">Facility dashboard</h1>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Admin sections">
        {(
          [
            ["overview", "Overview", KeyRound],
            ["users", "Active users", Users],
            ["access", "Access log", ScrollText],
            ["residents", "Residents", HeartHandshake],
          ] as const
        ).map(([k, label, Icon]) => {
          const active = tab === k;
          return (
            <button
              key={k}
              onClick={() => setTab(k)}
              aria-pressed={active}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-surface"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6">
        {tab === "overview" && <OverviewTab facilityId={facilityId} />}
        {tab === "users" && <UsersTab />}
        {tab === "access" && <AccessLogTab />}
        {tab === "residents" && <ResidentsTab />}
      </div>

      <Link
        to="/staff"
        className="mt-10 inline-block text-sm font-medium text-primary hover:underline"
      >
        Go to staff tools →
      </Link>
    </div>
  );
}

function OverviewTab({ facilityId }: { facilityId: string | null }) {
  if (!facilityId) {
    return (
      <p className="text-sm text-muted-foreground">
        No facility is linked to your admin account.
      </p>
    );
  }
  return (
    <section>
      <h2 className="text-xl">Today's join key</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This key resets at midnight UTC. Share it only with authorized family
        members or staff.
      </p>
      <div className="mt-3 max-w-md">
        <KeyCard
          queryKey={["staff-key", facilityId]}
          fetch={() => getFacilityStaffKey({ data: { facility_id: facilityId } })}
        />
      </div>
    </section>
  );
}

function relTime(iso: string | null): string {
  if (!iso) return "-";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function UsersTab() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listFacilityUsers(),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  const deactivate = useMutation({
    mutationFn: (user_id: string) => deactivateUser({ data: { user_id } }),
    onSuccess: () => {
      toast.success("User deactivated.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reactivate = useMutation({
    mutationFn: (user_id: string) => reactivateUser({ data: { user_id } }),
    onSuccess: () => {
      toast.success("User reactivated.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (user_id: string) => removeUser({ data: { user_id } }),
    onSuccess: (res) => {
      toast.success(res.unlinked ? "User unlinked from facility." : "User removed.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading users…</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  const users = data?.users ?? [];

  return (
    <section>
      <h2 className="text-xl">Active users</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Everyone with access to this facility.
      </p>

      {users.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No users yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Last active</th>
                <th className="px-4 py-2">Linked resident</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const allDeactivated =
                  u.roles.length > 0 && u.roles.every((r) => r.deactivated_at);
                return (
                  <tr key={u.user_id} className="border-t border-border align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name ?? "-"}</div>
                      <div className="text-xs text-muted-foreground">{u.email ?? "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r, i) => (
                          <span
                            key={i}
                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                              r.deactivated_at
                                ? "bg-muted text-muted-foreground line-through"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {r.role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {relTime(u.last_active_at)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {u.family_residents.length === 0
                        ? "-"
                        : u.family_residents.map((r) => r.name).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {allDeactivated ? (
                          <button
                            onClick={() => reactivate.mutate(u.user_id)}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] hover:bg-surface"
                          >
                            <Play className="h-3 w-3" aria-hidden="true" /> Reactivate
                          </button>
                        ) : (
                          <ConfirmDialog
                            title="Deactivate this user?"
                            description="This action cannot be undone. Are you sure? They will lose access immediately but their record is kept."
                            confirmLabel="Deactivate"
                            destructive
                            onConfirm={() => deactivate.mutateAsync(u.user_id)}
                            trigger={
                              <button
                                aria-label={`Deactivate ${u.email ?? "user"}`}
                                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] hover:bg-surface"
                              >
                                <Pause className="h-3 w-3" aria-hidden="true" /> Deactivate
                              </button>
                            }
                          />
                        )}
                        <ConfirmDialog
                          title="Remove this user?"
                          description="This action cannot be undone. Are you sure? Their account and all access will be permanently removed."
                          confirmLabel="Remove"
                          destructive
                          onConfirm={() => remove.mutateAsync(u.user_id)}
                          trigger={
                            <button
                              aria-label={`Remove ${u.email ?? "user"}`}
                              className="inline-flex items-center gap-1 rounded-full border border-destructive/30 px-2.5 py-1 text-[11px] text-destructive hover:bg-destructive/10"
                            >
                              <UserMinus className="h-3 w-3" aria-hidden="true" /> Remove
                            </button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AccessLogTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-access-log"],
    queryFn: () => listAccessLog(),
  });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  const events = data ?? [];

  return (
    <section>
      <h2 className="text-xl">Access log</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Last 50 sign-ins for this facility.
      </p>

      {events.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No sign-ins recorded yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-2">{e.email ?? "-"}</td>
                  <td className="px-4 py-2 text-xs">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                      {e.role ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {e.ip ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ResidentsTab() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-residents"],
    queryFn: () => listFacilityResidents(),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-residents"] });

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [stage, setStage] = useState<"" | "early" | "middle" | "late">("");

  const create = useMutation({
    mutationFn: () =>
      adminCreateResident({
        data: { name, room_number: room, care_stage: stage || undefined },
      }),
    onSuccess: () => {
      toast.success("Resident added.");
      setName("");
      setRoom("");
      setStage("");
      setCreating(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const deact = useMutation({
    mutationFn: (id: string) => deactivateResident({ data: { id } }),
    onSuccess: () => {
      toast.success("Resident deactivated.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const react = useMutation({
    mutationFn: (id: string) => reactivateResident({ data: { id } }),
    onSuccess: () => {
      toast.success("Resident reactivated.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const linkFam = useMutation({
    mutationFn: (vars: { resident_id: string; email: string }) =>
      linkFamilyByEmail({ data: vars }),
    onSuccess: () => {
      toast.success("Family member linked.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const unlinkFam = useMutation({
    mutationFn: (vars: { resident_id: string; user_id: string }) =>
      unlinkFamilyFromResident({ data: vars }),
    onSuccess: () => {
      toast.success("Family link removed.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  const residents = data ?? [];

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl">Residents</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add residents, link family, deactivate on discharge.
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add resident
          </button>
        )}
      </div>

      {creating && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) create.mutate();
          }}
          className="rounded-2xl border border-dashed border-border bg-surface/60 p-4"
        >
          <BetaWarningBar />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="font-medium">Name</span>
              <input
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Room #</span>
              <input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Care stage</span>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as typeof stage)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">-</option>
                <option value="early">Early</option>
                <option value="middle">Middle</option>
                <option value="late">Late</option>
              </select>
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={!name.trim() || create.isPending}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {create.isPending ? "Adding…" : "Add resident"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setName("");
                setRoom("");
                setStage("");
              }}
              className="rounded-full border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="grid gap-3">
        {residents.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
            No residents yet.
          </li>
        )}
        {residents.map((r) => (
          <ResidentCard
            key={r.id}
            resident={r}
            onDeactivate={() => deact.mutateAsync(r.id)}
            onReactivate={() => react.mutateAsync(r.id)}
            onLinkFamily={(email) => linkFam.mutateAsync({ resident_id: r.id, email })}
            onUnlinkFamily={(user_id) =>
              unlinkFam.mutateAsync({ resident_id: r.id, user_id })
            }
          />
        ))}
      </ul>
    </section>
  );
}

type ResidentRow = {
  id: string;
  name: string;
  room_number: string | null;
  care_stage: string | null;
  dementia_type: string | null;
  deactivated_at: string | null;
  deactivated_reason: string | null;
  family: { user_id: string; email: string | null; name: string | null }[];
};

function ResidentCard({
  resident,
  onDeactivate,
  onReactivate,
  onLinkFamily,
  onUnlinkFamily,
}: {
  resident: ResidentRow;
  onDeactivate: () => Promise<unknown>;
  onReactivate: () => Promise<unknown>;
  onLinkFamily: (email: string) => Promise<unknown>;
  onUnlinkFamily: (user_id: string) => Promise<unknown>;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const inactive = !!resident.deactivated_at;

  return (
    <li
      className={`rounded-2xl border bg-card p-4 shadow-soft ${
        inactive ? "border-dashed opacity-70" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {resident.name}
            {inactive && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                Inactive
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {resident.room_number ? `Room ${resident.room_number}` : "No room"} ·{" "}
            {resident.care_stage ? `${resident.care_stage} stage` : "Stage -"}
            {resident.dementia_type && ` · ${resident.dementia_type}`}
          </p>
        </div>
        <div className="flex gap-1.5">
          {inactive ? (
            <button
              onClick={() => void onReactivate()}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] hover:bg-surface"
            >
              <Play className="h-3 w-3" aria-hidden="true" /> Reactivate
            </button>
          ) : (
            <ConfirmDialog
              title="Deactivate this resident?"
              description="This action cannot be undone. Are you sure? Use this when a patient is discharged or has passed away."
              confirmLabel="Deactivate"
              destructive
              onConfirm={onDeactivate}
              trigger={
                <button
                  aria-label={`Deactivate ${resident.name}`}
                  className="inline-flex items-center gap-1 rounded-full border border-destructive/30 px-2.5 py-1 text-[11px] text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" /> Deactivate
                </button>
              }
            />
          )}
        </div>
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Family ({resident.family.length})
          </p>
          {!linkOpen && (
            <button
              onClick={() => setLinkOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] hover:bg-surface"
            >
              <UserPlus className="h-3 w-3" aria-hidden="true" /> Link family
            </button>
          )}
        </div>
        {linkOpen && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!linkEmail.trim()) return;
              await onLinkFamily(linkEmail.trim());
              setLinkEmail("");
              setLinkOpen(false);
            }}
            className="mt-2 flex flex-wrap gap-2"
          >
            <input
              type="email"
              required
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="family@example.com"
              className="flex-1 min-w-[200px] rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkOpen(false);
                setLinkEmail("");
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
          </form>
        )}
        {resident.family.length > 0 && (
          <ul className="mt-2 grid gap-1.5">
            {resident.family.map((f) => (
              <li
                key={f.user_id}
                className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-1.5 text-xs"
              >
                <span>
                  {f.name && <span className="font-medium">{f.name} · </span>}
                  <span className="text-muted-foreground">{f.email ?? "-"}</span>
                </span>
                <ConfirmDialog
                  title="Remove this family link?"
                  description="This action cannot be undone. Are you sure?"
                  confirmLabel="Unlink"
                  destructive
                  onConfirm={() => onUnlinkFamily(f.user_id)}
                  trigger={
                    <button
                      aria-label={`Unlink ${f.email ?? "family member"}`}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive"
                    >
                      <Link2Off className="h-3 w-3" aria-hidden="true" />
                    </button>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
