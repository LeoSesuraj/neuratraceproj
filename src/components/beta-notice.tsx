import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { acknowledgePhi, getMyPhiAck } from "@/lib/phi-ack.functions";

export function NonPhiWarningBar() {
  return (
    <div
      role="note"
      className="mb-4 flex items-start gap-2 rounded-2xl border border-warm/70 bg-warm/30 px-4 py-3 text-sm text-foreground"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden="true" />
      <p>
        <span aria-hidden="true">⚠️ </span>
        This app is for education and coordination only. Do not enter real patient information,
        diagnoses, room numbers, or any medical details.
      </p>
    </div>
  );
}

/** Persistent non-dismissible banner shown on every authenticated page. */
export function NonPhiTopBanner() {
  return (
    <div
      role="note"
      aria-label="Non-PHI environment notice"
      className="w-full bg-amber-500/95 px-4 py-1.5 text-center text-xs font-medium text-black"
    >
      Non-PHI pilot: do not enter real names, diagnoses, room numbers, or medical details.
    </div>
  );
}

/**
 * Blocking acknowledgment. Users must check the box to continue. Ack is
 * persisted per-user in the DB so it follows them across devices.
 */
export function NonPhiWelcomeModal() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["phi-ack"],
    queryFn: () => getMyPhiAck(),
    staleTime: 5 * 60 * 1000,
  });
  const [checked, setChecked] = useState(false);
  const ack = useMutation({
    mutationFn: () => acknowledgePhi(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["phi-ack"] });
    },
  });

  // Reset check state when a new user session loads.
  useEffect(() => {
    setChecked(false);
  }, [data?.acknowledged]);

  if (isLoading || data?.acknowledged) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nonphi-welcome-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 id="nonphi-welcome-title" className="text-xl font-semibold text-foreground">
            Before you start
          </h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          NeuroTrace is an educational and communication support tool, not a medical record
          system. This environment is not HIPAA-compliant.
        </p>
        <p className="mt-3 text-sm text-foreground font-medium">You agree not to enter:</p>
        <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>Real resident full names (use initials or a nickname)</li>
          <li>Dates of birth, SSNs, or medical record numbers</li>
          <li>Diagnoses, medications, or clinical notes</li>
          <li>Room numbers, phone numbers, or email addresses</li>
        </ul>
        <label className="mt-5 flex items-start gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border"
          />
          <span>
            I understand and agree not to enter Protected Health Information (PHI) into this app.
          </span>
        </label>
        {ack.isError && (
          <p className="mt-3 text-xs text-destructive">
            Couldn't save your acknowledgment. Please try again.
          </p>
        )}
        <div className="mt-5 flex justify-end">
          <button
            disabled={!checked || ack.isPending}
            onClick={() => ack.mutate()}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
          >
            {ack.isPending ? "Saving…" : "I agree"}
          </button>
        </div>
      </div>
    </div>
  );
}
