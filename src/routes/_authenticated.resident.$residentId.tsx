import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, Trash2, Pencil } from "lucide-react";
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
import {
  getResidentOverview,
  dismissAlert,
  deletePost,
  upsertDailyNote,
  logTodayMood,
  submitWeeklySurvey,
  uploadResidentPhoto,
  createPhotoPost,
} from "@/lib/app.functions";
import { VISIT_SUGGESTIONS } from "@/lib/visit-mode";
import { supabase } from "@/integrations/supabase/client";
import { FilePicker } from "@/components/file-picker";

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

type Rating = "improved" | "stable" | "declined";
type Behavior = "none" | "mild" | "significant";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

function ResidentFeed() {
  const { residentId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [visiting, setVisiting] = useState(false);
  const [editing, setEditing] = useState<"note" | "mood" | "survey" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["resident", residentId],
    queryFn: () => getResidentOverview({ data: { resident_id: residentId } }),
  });

  const dismiss = useMutation({
    mutationFn: (id: string) => dismissAlert({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resident", residentId] }),
  });

  const removePost = useMutation({
    mutationFn: (id: string) => deletePost({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resident", residentId] }),
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const { resident, todayMood, posts, surveys, alerts, notes, canEdit, latestSurvey } = data;
  const moodTone = todayMood ? MOOD_TONE[todayMood] : null;
  const todayNote = notes.find((n) => n.note.note_date === todayDate())?.note ?? null;

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

  const chartData = surveys.map((s) => ({
    week: s.week_of.slice(5),
    Eating: RATING_TO_NUM[s.eating],
    Mood: RATING_TO_NUM[s.mood],
    Social: RATING_TO_NUM[s.social],
    Mobility: RATING_TO_NUM[s.mobility],
    Behaviors: RATING_TO_NUM[s.behaviors],
  }));

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 pb-20">
      <div className="flex items-center justify-between">
        <Link
          to={canEdit ? "/staff" : "/resident"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {canEdit ? "All residents (staff)" : "All residents"}
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
          {!canEdit && (
            <button
              onClick={() => setVisiting(true)}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              I'm visiting today
            </button>
          )}
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
              {canEdit && (
                <button
                  onClick={() => dismiss.mutate(a.id)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Dismiss
                </button>
              )}
          </div>
        </div>
      ))}

      {/* Daily notes section — above graphs for the family view too */}
      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Daily notes from staff</h2>
          {canEdit && (
            <button
              onClick={() => setEditing(editing === "note" ? null : "note")}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              {todayNote ? "Edit today's note" : "Add today's note"}
            </button>
          )}
        </div>

        {canEdit && editing === "note" && (
          <DailyNoteForm
            residentId={residentId}
            existing={todayNote}
            onDone={() => setEditing(null)}
          />
        )}

        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No notes posted yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-2xl border border-border bg-surface/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    {new Date(n.note.note_date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {canEdit && (
                    <button
                      onClick={() => removePost.mutate(n.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <dl className="mt-2 grid gap-1.5 text-sm">
                  {n.note.activities && (
                    <NoteRow label="Activities" value={n.note.activities} />
                  )}
                  {n.note.food && <NoteRow label="Food" value={n.note.food} />}
                  {n.note.feelings && (
                    <NoteRow label="Feelings" value={n.note.feelings} />
                  )}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      {canEdit && (
        <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg">Staff form answers</h2>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setEditing(editing === "mood" ? null : "mood")}
                className="rounded-full border border-border px-3 py-1.5"
              >
                {todayMood ? "Change today's mood" : "Log today's mood"}
              </button>
              <button
                onClick={() => setEditing(editing === "survey" ? null : "survey")}
                className="rounded-full border border-border px-3 py-1.5"
              >
                {latestSurvey ? "Edit weekly survey" : "Submit weekly survey"}
              </button>
            </div>
          </div>
          {editing === "mood" && (
            <MoodEditor
              residentId={residentId}
              current={todayMood}
              onDone={() => setEditing(null)}
            />
          )}
          {editing === "survey" && (
            <SurveyEditor
              residentId={residentId}
              existing={latestSurvey}
              onDone={() => setEditing(null)}
            />
          )}
        </section>
      )}

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

      {canEdit && <InlinePhotoUploader residentId={residentId} />}

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
            <div className="flex items-start justify-between gap-3 p-4">
              <div>
                {p.caption && <p className="text-sm">{p.caption}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()}
                </p>
              </div>
              {canEdit && (
                <button
                  onClick={() => removePost.mutate(p.id)}
                  className="text-muted-foreground hover:text-destructive"
                  title="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
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
              Ideas tuned to {resident.name}'s recent trend ({trendTone.label.toLowerCase()}).
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

function NoteRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function DailyNoteForm({
  residentId,
  existing,
  onDone,
}: {
  residentId: string;
  existing: { activities: string; food: string; feelings: string } | null;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [activities, setActivities] = useState(existing?.activities ?? "");
  const [food, setFood] = useState(existing?.food ?? "");
  const [feelings, setFeelings] = useState(existing?.feelings ?? "");

  useEffect(() => {
    setActivities(existing?.activities ?? "");
    setFood(existing?.food ?? "");
    setFeelings(existing?.feelings ?? "");
  }, [existing]);

  const save = useMutation({
    mutationFn: () =>
      upsertDailyNote({
        data: {
          resident_id: residentId,
          note_date: todayDate(),
          activities,
          food,
          feelings,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resident", residentId] });
      onDone();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="mt-4 grid gap-3"
    >
      <NoteField label="Activities" value={activities} onChange={setActivities} placeholder="Walked the garden, painted with watercolors…" />
      <NoteField label="Food" value={food} onChange={setFood} placeholder="Ate most of breakfast, light lunch…" />
      <NoteField label="Feelings" value={feelings} onChange={setFeelings} placeholder="Calm in the morning, restless after dinner…" />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {save.isPending ? "Saving…" : "Save note"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function NoteField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function MoodEditor({
  residentId,
  current,
  onDone,
}: {
  residentId: string;
  current: "good" | "mixed" | "hard" | null;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: (m: "good" | "mixed" | "hard") =>
      logTodayMood({ data: { resident_id: residentId, mood: m } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resident", residentId] });
      onDone();
    },
  });
  return (
    <div className="mt-4 flex gap-2">
      {(["good", "mixed", "hard"] as const).map((m) => (
        <button
          key={m}
          onClick={() => save.mutate(m)}
          className={`flex-1 rounded-xl border px-3 py-2 text-sm capitalize ${
            current === m
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-surface"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function SurveyEditor({
  residentId,
  existing,
  onDone,
}: {
  residentId: string;
  existing: {
    eating: Rating;
    mood: Rating;
    social: Rating;
    mobility: Rating;
    behaviors: Behavior;
    notes: string | null;
  } | null;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [eating, setEating] = useState<Rating>(existing?.eating ?? "stable");
  const [moodR, setMoodR] = useState<Rating>(existing?.mood ?? "stable");
  const [social, setSocial] = useState<Rating>(existing?.social ?? "stable");
  const [mobility, setMobility] = useState<Rating>(existing?.mobility ?? "stable");
  const [behaviors, setBehaviors] = useState<Behavior>(existing?.behaviors ?? "none");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const submit = useMutation({
    mutationFn: () =>
      submitWeeklySurvey({
        data: {
          resident_id: residentId,
          week_of: weekStart(),
          eating,
          mood: moodR,
          social,
          mobility,
          behaviors,
          notes: notes || undefined,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resident", residentId] });
      onDone();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate();
      }}
      className="mt-4 grid gap-3"
    >
      {(
        [
          ["Eating", eating, setEating],
          ["Mood", moodR, setMoodR],
          ["Social", social, setSocial],
          ["Mobility", mobility, setMobility],
        ] as const
      ).map(([label, val, setter]) => (
        <SegRow key={label} label={label}>
          {(["improved", "stable", "declined"] as const).map((o) => (
            <Seg key={o} active={val === o} onClick={() => setter(o)}>
              {o}
            </Seg>
          ))}
        </SegRow>
      ))}
      <SegRow label="Behaviors">
        {(["none", "mild", "significant"] as const).map((o) => (
          <Seg key={o} active={behaviors === o} onClick={() => setBehaviors(o)}>
            {o}
          </Seg>
        ))}
      </SegRow>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
      <button
        disabled={submit.isPending}
        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {submit.isPending ? "Saving…" : "Save survey"}
      </button>
    </form>
  );
}

function SegRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-1 gap-1.5">{children}</div>
    </div>
  );
}

function Seg({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs capitalize transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
      }`}
    >
      {children}
    </button>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  });
}

function InlinePhotoUploader({ residentId }: { residentId: string }) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      const { url, path } = await uploadResidentPhoto({
        data: {
          resident_id: residentId,
          filename: file.name,
          contentType: file.type || "image/jpeg",
          base64,
        },
      });
      await createPhotoPost({
        data: { resident_id: residentId, photo_path: url || path, caption: caption || undefined },
      });
      setFile(null);
      setCaption("");
      qc.invalidateQueries({ queryKey: ["resident", residentId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-lg">Post a photo</h2>
      <form onSubmit={onSubmit} className="mt-3 grid gap-3">
        <FilePicker file={file} onChange={setFile} />
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          disabled={!file || loading}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Uploading…" : "Post"}
        </button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </form>
    </section>
  );
}
