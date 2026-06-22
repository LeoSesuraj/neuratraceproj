import { Check } from "lucide-react";
import { BEHAVIOR_OPTIONS } from "@/lib/behaviors";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

/**
 * Multi-select checklist for resident behaviors. Used in the resident
 * create form and the "Edit behaviors" dialog on the resident page.
 */
export function BehaviorChecklist({ value, onChange, disabled }: Props) {
  const selected = new Set(value);
  const toggle = (id: string) => {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(BEHAVIOR_OPTIONS.filter((b) => next.has(b.id)).map((b) => b.id));
  };
  return (
    <ul role="group" aria-label="Current behaviors" className="grid gap-2 sm:grid-cols-2">
      {BEHAVIOR_OPTIONS.map((b) => {
        const isOn = selected.has(b.id);
        return (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => toggle(b.id)}
              aria-pressed={isOn}
              disabled={disabled}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-60 ${
                isOn
                  ? "border-primary bg-sky-soft text-foreground"
                  : "border-border bg-card hover:bg-surface"
              }`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${
                  isOn ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                }`}
                aria-hidden
              >
                {isOn && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className="flex-1">{b.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
