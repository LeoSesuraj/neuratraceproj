import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

export function FilePicker({
  file,
  onChange,
  accept = "image/*",
  label = "Choose a photo",
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function set(f: File | null) {
    onChange(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  if (file && preview) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
        <img src={preview} alt="" className="max-h-72 w-full object-cover" />
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="truncate text-xs text-muted-foreground">
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </p>
          <button
            type="button"
            onClick={() => set(null)}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:bg-background"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) set(f);
      }}
      onClick={() => inputRef.current?.click()}
      className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
        dragging
          ? "border-primary bg-primary/5"
          : "border-border bg-surface/60 hover:border-primary/60 hover:bg-surface"
      }`}
    >
      <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20">
        <ImagePlus className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">
        Drag & drop or click to browse
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => set(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
