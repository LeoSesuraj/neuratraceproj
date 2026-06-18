import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check } from "lucide-react";
import {
  listResidentsForMe,
  createResident,
  logTodayMood,
  submitWeeklySurvey,
  uploadResidentPhoto,
  createPhotoPost,
  getResidentDailyKey,
  getMyRole,
} from "@/lib/app.functions";
import { KeyCard } from "@/components/key-card";
import { FilePicker } from "@/components/file-picker";

export const Route = createFileRoute("/_authenticated/staff")({
  component: StaffPage,
});

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

function StaffPage() {
  const qc = useQueryClient();
  const { data: residents = [] } = useQuery({
    queryKey: ["residents"],
    queryFn: () => listResidentsForMe(),
  });
  const { data: roleInfo, isLoading: roleLoading } = useQuery({
    queryKey: ["my-role"],
    queryFn: () => getMyRole(),
  });
  const [name, setName] = useState("");

  const create = useMutation({
    mutationFn: () => createResident({ data: { name } }),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["residents"] });
    },
  });

  if (roleLoading) {
    return <div className="mx-auto max-w-3xl px-5 py-8 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!roleInfo || !["staff", "admin", "super_admin"].includes(roleInfo.role ?? "")) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-3xl">Family access</h1>
        <p className="mt-2 text-sm text-muted-foreground">Staff tools are only available to care team accounts.</p>
        <Link to="/resident" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Go to your loved ones →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header>
        <p className="text-sm font-medium text-primary">Staff</p>
        <h1 className="mt-1 text-3xl">Your residents</h1>
      </header>


      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-lg">Add a resident</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) create.mutate();
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Resident's name"
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
          />
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Add
          </button>
        </form>
      </section>

      <section className="mt-6 grid gap-4">
        {residents.map((r) => (
          <ResidentCard key={r.id} resident={r} />
        ))}
        {residents.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No residents yet — add your first above.
          </p>
        )}
      </section>
    </div>
  );
}

type Resident = { id: string; name: string; photo_url: string | null };
type Rating = "improved" | "stable" | "declined";
type Behavior = "none" | "mild" | "significant";

function ResidentCard({ resident }: { resident: Resident }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState<"mood" | "survey" | "photo" | null>(null);
  const [savedMood, setSavedMood] = useState<"good" | "mixed" | "hard" | null>(null);

  const mood = useMutation({
    mutationFn: (m: "good" | "mixed" | "hard") =>
      logTodayMood({ data: { resident_id: resident.id, mood: m } }),
    onSuccess: (_d, m) => {
      setSavedMood(m);
      qc.invalidateQueries({ queryKey: ["resident", resident.id] });
    },
  });

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/resident/$residentId"
            params={{ residentId: resident.id }}
            className="text-lg font-medium hover:underline"
          >
            {resident.name}
          </Link>
          <div className="mt-2 max-w-xs">
            <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              {resident.name.split(" ")[0]}'s family key (today)
            </p>
            <KeyCard
              queryKey={["family-key", resident.id]}
              fetch={() => getResidentDailyKey({ data: { resident_id: resident.id } })}
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={() => setOpen(open === "mood" ? null : "mood")}
            className="rounded-full border border-border px-3 py-1.5 hover:bg-surface"
          >
            Today's mood
          </button>
          <button
            type="button"
            onClick={() => setOpen(open === "survey" ? null : "survey")}
            className="rounded-full border border-border px-3 py-1.5 hover:bg-surface"
          >
            Weekly survey
          </button>
          <button
            type="button"
            onClick={() => setOpen(open === "photo" ? null : "photo")}
            className="rounded-full border border-border px-3 py-1.5 hover:bg-surface"
          >
            Post photo
          </button>
          <Link
            to="/resident/$residentId"
            params={{ residentId: resident.id }}
            className="rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground"
          >
            Open page
          </Link>
        </div>
      </div>

      {open === "mood" && (
        <div className="mt-4">
          <div className="flex gap-2">
            {(["good", "mixed", "hard"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => mood.mutate(m)}
                disabled={mood.isPending}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm capitalize transition-colors ${
                  savedMood === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-surface"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {savedMood && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary" /> Saved
            </p>
          )}
        </div>
      )}

      {open === "survey" && <SurveyForm residentId={resident.id} onDone={() => setOpen(null)} />}
      {open === "photo" && <PhotoForm residentId={resident.id} onDone={() => setOpen(null)} />}
    </div>
  );
}

function SurveyForm({ residentId, onDone }: { residentId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [eating, setEating] = useState<Rating>("stable");
  const [moodR, setMoodR] = useState<Rating>("stable");
  const [social, setSocial] = useState<Rating>("stable");
  const [mobility, setMobility] = useState<Rating>("stable");
  const [behaviors, setBehaviors] = useState<Behavior>("none");
  const [notes, setNotes] = useState("");

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
      <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        Submit
      </button>
    </form>
  );
}

function PhotoForm({ residentId, onDone }: { residentId: string; onDone: () => void }) {
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
      qc.invalidateQueries({ queryKey: ["resident", residentId] });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3">
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

function Seg({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function weekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}
