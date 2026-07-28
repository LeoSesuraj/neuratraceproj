import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

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

const STORAGE_KEY = "neurotrace.nonPhiWelcomeDismissed.v1";

export function NonPhiWelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (!window.localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // ignore
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nonphi-welcome-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
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
          system. Do not enter real resident names, diagnoses, room numbers, medications, or any
          Protected Health Information (PHI). Use first names, initials, or anonymous identifiers
          if your facility permits it.
        </p>
        <div className="mt-5 flex justify-end">
          <button
            onClick={dismiss}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}

