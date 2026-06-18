import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  listResidentsForMe,
  getFacilityStaffKey,
  getMyRole,
} from "@/lib/app.functions";
import { KeyCard } from "@/components/key-card";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { data: residents = [] } = useQuery({
    queryKey: ["residents"],
    queryFn: () => listResidentsForMe(),
  });
  const { data: roleInfo } = useQuery({
    queryKey: ["my-role"],
    queryFn: () => getMyRole(),
  });

  const facilityId = roleInfo?.facilityId ?? null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header>
        <p className="text-sm font-medium text-primary">Admin</p>
        <h1 className="mt-1 text-3xl">Facility dashboard</h1>
      </header>

      {facilityId && (
        <section className="mt-8">
          <h2 className="text-xl">Today's staff signup key</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share this with anyone joining as staff. It refreshes daily at midnight UTC.
          </p>
          <div className="mt-3">
            <KeyCard
              queryKey={["staff-key", facilityId]}
              fetch={() => getFacilityStaffKey({ data: { facility_id: facilityId } })}
            />
          </div>
        </section>
      )}

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
