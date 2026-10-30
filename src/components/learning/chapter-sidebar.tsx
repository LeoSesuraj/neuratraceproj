import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, Circle, Lock, PlayCircle } from "lucide-react";
import { chapters, allLessons } from "@/lib/curriculum";
import { percentComplete } from "@/lib/learning-progress";
import logo from "@/assets/neuratrace-logo.png";

export function ChapterProgress({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-card"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ChapterSidebar({
  currentId,
  completed,
  onSelect,
}: {
  currentId: string;
  completed: string[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState<Record<number, boolean>>({ 1: true });
  const overall = percentComplete(completed, allLessons.map((l) => l.id));

  return (
    <nav aria-label="Chapters" className="flex h-full flex-col">
      <div className="px-5 pt-5">
        <Link to="/" className="flex items-center gap-2.5" aria-label="NeuraTrace home">
          <img src={logo} alt="" width={32} height={32} className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight text-foreground">NeuraTrace</span>
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your learning journey
        </p>
        <div className="mt-3">
          <ChapterProgress value={overall} label="Overall progress" />
        </div>
      </div>

      <ol className="mt-5 flex-1 space-y-1.5 overflow-y-auto px-3 pb-6">
        {chapters.map((c) => {
          const available = c.lessons.length > 0;
          const isOpen = !!open[c.n] && available;
          const pct = percentComplete(completed, c.lessons.map((l) => l.id));
          return (
            <li key={c.n}>
              <button
                type="button"
                disabled={!available}
                aria-expanded={available ? isOpen : undefined}
                onClick={() => setOpen((o) => ({ ...o, [c.n]: !o[c.n] }))}
                className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isOpen ? "bg-card" : available ? "hover:bg-card/60" : "cursor-default"
                }`}
              >
                <span className={`mt-0.5 text-sm font-bold ${available ? "text-primary" : "text-muted-foreground/70"}`}>
                  {String(c.n).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className={`block text-[15px] font-semibold leading-snug ${available ? "text-foreground" : "text-muted-foreground"}`}>
                    {c.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {available ? `${c.lessons.length} lessons · ${pct}% done` : "Coming soon"}
                  </span>
                </span>
                {available ? (
                  <ChevronDown className={`mt-1 h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                ) : (
                  <Lock className="mt-1 h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
                )}
              </button>
              {isOpen && (
                <ol className="mt-1 space-y-0.5 pb-2 pl-3">
                  {c.lessons.map((l) => {
                    const done = completed.includes(l.id);
                    const current = l.id === currentId;
                    const Icon = current ? PlayCircle : done ? CheckCircle2 : Circle;
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(l.id)}
                          aria-current={current ? "page" : undefined}
                          className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            current ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-card/70"
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${current ? "" : done ? "text-primary" : "text-muted-foreground/60"}`} aria-hidden />
                          <span className="flex-1">
                            <span className="sr-only">{done ? "Completed: " : ""}</span>
                            {l.id} {l.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
