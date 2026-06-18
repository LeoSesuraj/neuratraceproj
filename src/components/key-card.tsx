import { useQuery } from "@tanstack/react-query";
import { Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

export function KeyCard({
  queryKey,
  fetch,
}: {
  queryKey: readonly unknown[];
  fetch: () => Promise<{ code: string; valid_date: string }>;
}) {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: fetch,
  });
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!data?.code) return;
    await navigator.clipboard.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-2xl tracking-widest">
            {isLoading ? "••••-••••" : (data?.code ?? "—")}
          </p>
          {data?.valid_date && (
            <p className="mt-1 text-xs text-muted-foreground">
              Valid for {data.valid_date} (UTC)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copy}
            disabled={!data}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive">{(error as Error).message}</p>
      )}
    </div>
  );
}
