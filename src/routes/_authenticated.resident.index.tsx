import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listResidentsForMe } from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/resident/")({
  component: ResidentSelector,
});

function ResidentSelector() {
  const navigate = useNavigate();
  const { data: residents = [], isLoading } = useQuery({
    queryKey: ["my-residents"],
    queryFn: () => listResidentsForMe(),
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Resident</p>
          <h1 className="mt-1 text-3xl">Choose a loved one</h1>
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

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {isLoading && <li className="text-sm text-muted-foreground">Loading…</li>}
        {!isLoading && residents.length === 0 && (
          <li className="col-span-full rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            You haven't been linked to any residents yet.
          </li>
        )}
        {residents.map((r) => (
          <li key={r.id}>
            <Link
              to="/resident/$residentId"
              params={{ residentId: r.id }}
              className="flex items-center gap-3 rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sky-soft">
                {r.photo_url ? (
                  <img src={r.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-primary">
                    {r.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-lg leading-tight">{r.name}</p>
                {r.dementia_type && (
                  <p className="text-xs text-muted-foreground">{r.dementia_type}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
