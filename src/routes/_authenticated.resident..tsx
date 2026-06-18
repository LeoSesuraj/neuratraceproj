
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
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
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
