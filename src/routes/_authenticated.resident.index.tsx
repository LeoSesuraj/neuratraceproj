import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listFamilyResidentsForMe, redeemFamilyKey } from "@/lib/app.functions";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/resident/")({
  component: ResidentSelector,
});

function ResidentSelector() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: residents = [], isLoading } = useQuery({
    queryKey: ["family-residents"],
    queryFn: () => listFamilyResidentsForMe(),
  });
  const [adding, setAdding] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = useMutation({
    mutationFn: () => redeemFamilyKey({ data: { code } }),
    onSuccess: (r) => {
      setCode("");
      setAdding(false);
      setError(null);
      qc.invalidateQueries({ queryKey: ["family-residents"] });
      if (r.kind === "family" && r.resident_id) {
        navigate({ to: "/resident/$residentId", params: { residentId: r.resident_id } });
      }
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">Resident</p>
          <h1 className="mt-1 text-2xl sm:text-3xl">Choose a loved one</h1>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
          className="shrink-0 text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </header>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {isLoading && <li className="text-sm text-muted-foreground">Loading…</li>}
        {!isLoading && residents.length === 0 && (
          <li className="col-span-full rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            You haven't been linked to any residents yet. Use the "Add another
            resident" button below with a family key.
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

      <section className="mt-8 rounded-3xl border border-dashed border-border bg-surface/60 p-5">
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add another resident
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) add.mutate();
            }}
            className="grid gap-3"
          >
            <p className="text-sm font-medium">Enter today's family key</p>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD-EFGH"
              className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-center font-mono text-lg tracking-widest shadow-soft"
            />
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={add.isPending}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {add.isPending ? "Linking…" : "Link resident"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setError(null);
                }}
                className="rounded-full border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
