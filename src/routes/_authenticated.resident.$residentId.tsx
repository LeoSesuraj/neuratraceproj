import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getResidentOverview, dismissAlert } from "@/lib/app.functions";
import { VISIT_SUGGESTIONS } from "@/lib/visit-mode";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/resident/$residentId")({
  component: ResidentFeed,
});

const MOOD_TONE: Record<string, { label: string; bg: string; text: string }> = {
  good: { label: "Good day", bg: "bg-sage/50", text: "text-foreground" },
  mixed: { label: "Mixed day", bg: "bg-warm/70", text: "text-foreground" },
  hard: { label: "Hard day", bg: "bg-destructive/15", text: "text-destructive" },
};

const RATING_TO_NUM: Record<string, number> = {
  improved: 3,
  stable: 2,
  declined: 1,
  none: 3,
  mild: 2,
  significant: 1,
};

function ResidentFeed() {
  const { residentId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [visiting, setVisiting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["resident", residentId],
    queryFn: () => getResidentOverview({ data: { resident_id: residentId } }),
  });

  const dismiss = useMutation({
    mutationFn: (id: string) => dismissAlert({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resident", residentId] }),
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const { resident, todayMood, posts, surveys, alerts } = data;
  const moodTone = todayMood ? MOOD_TONE[todayMood] : null;

  // Derive a "trend mood" from the most recent weekly surveys so the
  // visit suggestions reflect the graphical trend, not just today's note.
  const trendMood: "good" | "mixed" | "hard" = (() => {
    if (surveys.length === 0) return todayMood ?? "mixed";
    const recent = surveys.slice(-2);
    const scores = recent.flatMap((s) => [
      RATING_TO_NUM[s.eating],
      RATING_TO_NUM[s.mood],
      RATING_TO_NUM[s.social],
      RATING_TO_NUM[s.mobility],
      RATING_TO_NUM[s.behaviors],
    ]);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg >= 2.5) return "good";
    if (avg >= 1.75) return "mixed";
    return "hard";
  })();
  const trendTone = MOOD_TONE[trendMood];
  const suggestions = VISIT_SUGGESTIONS[trendMood];


  return (
    <div className="mx-auto max-w-3xl px-5 py-6 pb-20">
      <div className="flex items-center justify-between">
        <Link
          to="/resident"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All residents
        </Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      <header className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sky-soft">
            {resident.photo_url ? (
              <img src={resident.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-semibold text-primary">
                {resident.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl">{resident.name}</h1>
            {moodTone && (
              <span
                className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${moodTone.bg} ${moodTone.text}`}
              >
                {moodTone.label}
              </span>
            )}
          </div>
          <button
            onClick={() => setVisiting(true)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            I'm visiting today
          </button>
        </div>
      </header>

      {alerts.map((a) => (
        <div
          key={a.id}
          className="mt-4 rounded-3xl border border-warm bg-warm/30 p-5"
        >
          <p className="font-medium">
            We've noticed some changes in {a.category} lately.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what this can look like and a few things that may help.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Link
              to="/learn/understand"
              className="text-sm font-medium text-primary hover:underline"
            >
              Learn more →
            </Link>
            <button
              onClick={() => dismiss.mutate(a.id)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}

      {chartData.length > 0 && (
        <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-lg">Last {chartData.length} weeks</h2>
          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" fontSize={11} />
                <YAxis domain={[0.5, 3.5]} ticks={[1, 2, 3]} fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Eating" stroke="#3b82f6" />
                <Line type="monotone" dataKey="Mood" stroke="#10b981" />
                <Line type="monotone" dataKey="Social" stroke="#f59e0b" />
                <Line type="monotone" dataKey="Mobility" stroke="#8b5cf6" />
                <Line type="monotone" dataKey="Behaviors" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="mt-4 space-y-3">
        {posts.length === 0 && (
          <p className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            No photos posted yet.
          </p>
        )}
        {posts.map((p) => (
          <article
            key={p.id}
            className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
          >
            {p.photo_url && (
              <img src={p.photo_url} alt="" className="w-full object-cover" />
            )}
            <div className="p-4">
              {p.caption && <p className="text-sm">{p.caption}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(p.created_at).toLocaleString()}
              </p>
            </div>
          </article>
        ))}
      </section>

      {visiting && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-lift">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Visit suggestions</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Ideas tuned to {resident.name}'s {moodTone?.label.toLowerCase() ?? "day"}.
            </p>
            <ul className="mt-4 space-y-3">
              {suggestions.map((s) => (
                <li key={s.title} className="rounded-2xl border border-border p-3">
                  <p className="font-medium">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setVisiting(false)}
              className="mt-5 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
