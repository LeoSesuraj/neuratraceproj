import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export function BetaWarningBar() {
  return (
    <div
      role="note"
      className="mb-4 flex items-start gap-2 rounded-2xl border border-yellow-300/70 bg-yellow-50 px-4 py-3 text-sm text-yellow-900"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>
        <span aria-hidden="true">⚠️ </span>
        Beta version, do not enter real patient information. Use placeholder data only until the
        full release.
      </p>
    </div>
  );
}

const STORAGE_KEY = "neurotrace.betaWelcomeDismissed.v1";

export function BetaWelcomeModal() {
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
      aria-labelledby="beta-welcome-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-soft">
        <h2 id="beta-welcome-title" className="text-xl font-semibold text-foreground">
          Welcome to NeuroTrace Beta
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This is a beta version of NeuroTrace. Please do not enter real resident names, diagnoses,
          room numbers, or any personal medical information. The app is for testing and feedback
          purposes only.
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
