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
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-lg font-semibold tracking-[0.2em]">
          {isLoading ? "••••••••" : (data?.code ?? "—")}
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={copy}
            disabled={!data}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] hover:bg-surface disabled:opacity-50"
          >
            <Copy className="h-3 w-3" />
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center rounded-full border border-border p-1.5 hover:bg-surface disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      {data?.valid_date && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Valid for {data.valid_date} (UTC)
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs text-destructive">{(error as Error).message}</p>
      )}
    </div>
  );
}

