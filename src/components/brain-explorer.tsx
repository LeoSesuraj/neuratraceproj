import { useState } from "react";

type Region = {
  id: string;
  name: string;
  tagline: string;
  explanation: string;
};

const regions: Region[] = [
  {
    id: "hippocampus",
    name: "Hippocampus",
    tagline: "The memory gateway",
    explanation:
      "The hippocampus helps turn new experiences into lasting memories. In Alzheimer's disease it is often one of the first structures affected, which is why recent conversations fade while older memories can stay vivid.",
  },
  {
    id: "amygdala",
    name: "Amygdala",
    tagline: "The emotional core",
    explanation:
      "The amygdala processes emotion. Feelings often outlast facts: a person may forget a visit happened, yet still carry the warmth of how it made them feel.",
  },
  {
    id: "prefrontal",
    name: "Prefrontal cortex",
    tagline: "Planning and judgment",
    explanation:
      "The prefrontal cortex supports planning, judgment, and impulse control. Changes here can affect decision-making, social behavior, and the ability to multi-step tasks.",
  },
  {
    id: "temporal",
    name: "Temporal lobe",
    tagline: "Language and recognition",
    explanation:
      "The temporal lobes help with language and recognizing faces and objects. Changes can make words hard to find, or familiar faces hard to place.",
  },
  {
    id: "occipital",
    name: "Occipital lobe",
    tagline: "Vision",
    explanation:
      "The occipital lobe processes what we see. In some dementias, changes here affect depth perception and recognizing objects, even when eyesight itself is fine.",
  },
];

/**
 * Stylized sagittal brain with selectable regions.
 * Educational illustration: region positions are simplified, not anatomically exact.
 */
export function BrainExplorer() {
  const [activeId, setActiveId] = useState<string>("hippocampus");
  const active = regions.find((r) => r.id === activeId)!;

  const regionFill = (id: string) =>
    id === activeId ? "fill-sage" : "fill-ink-soft hover:fill-sage/40";

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <svg
          viewBox="0 0 560 420"
          role="img"
          aria-label="Simplified illustration of the human brain with selectable regions"
          className="mx-auto w-full max-w-xl"
        >
          {/* Brain silhouette */}
          <path
            d="M96 210 C80 130 150 62 250 56 C340 51 430 84 462 150 C486 200 478 258 446 296 C420 327 380 344 330 348 L322 384 C320 396 306 400 298 392 L270 360 C190 356 110 300 96 210 Z"
            className="fill-ink-soft/60 stroke-sage/30"
            strokeWidth="2"
          />
          {/* Cortical fold hints */}
          <path d="M150 140 C190 110 250 100 300 112" className="fill-none stroke-sage/20" strokeWidth="2" />
          <path d="M130 200 C180 170 260 160 330 176" className="fill-none stroke-sage/20" strokeWidth="2" />
          <path d="M150 260 C210 236 300 230 370 246" className="fill-none stroke-sage/20" strokeWidth="2" />
          <path d="M330 120 C380 130 420 160 436 200" className="fill-none stroke-sage/20" strokeWidth="2" />

          {/* Prefrontal cortex (front, left side of image) */}
          <button
            type="button"
            aria-label="Prefrontal cortex"
            aria-pressed={activeId === "prefrontal"}
            onClick={() => setActiveId("prefrontal")}
          >
            <ellipse cx="150" cy="170" rx="52" ry="62" className={`${regionFill("prefrontal")} cursor-pointer transition-colors`} opacity="0.85" />
          </button>
          {/* Temporal lobe (lower middle) */}
          <button
            type="button"
            aria-label="Temporal lobe"
            aria-pressed={activeId === "temporal"}
            onClick={() => setActiveId("temporal")}
          >
            <ellipse cx="250" cy="300" rx="70" ry="42" className={`${regionFill("temporal")} cursor-pointer transition-colors`} opacity="0.85" />
          </button>
          {/* Hippocampus (deep center) */}
          <button
            type="button"
            aria-label="Hippocampus"
            aria-pressed={activeId === "hippocampus"}
            onClick={() => setActiveId("hippocampus")}
          >
            <path
              d="M255 235 C275 215 315 215 330 235 C340 250 330 268 308 272 C282 276 248 262 255 235 Z"
              className={`${regionFill("hippocampus")} cursor-pointer transition-colors`}
            />
          </button>
          {/* Amygdala (front of hippocampus) */}
          <button
            type="button"
            aria-label="Amygdala"
            aria-pressed={activeId === "amygdala"}
            onClick={() => setActiveId("amygdala")}
          >
            <circle cx="228" cy="252" r="20" className={`${regionFill("amygdala")} cursor-pointer transition-colors`} opacity="0.9" />
          </button>
          {/* Occipital lobe (rear) */}
          <button
            type="button"
            aria-label="Occipital lobe"
            aria-pressed={activeId === "occipital"}
            onClick={() => setActiveId("occipital")}
          >
            <ellipse cx="420" cy="210" rx="46" ry="66" className={`${regionFill("occipital")} cursor-pointer transition-colors`} opacity="0.85" />
          </button>
        </svg>
        <p className="mt-3 text-center text-xs text-ink-muted">
          Educational illustration. Region positions are simplified.
        </p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Brain regions">
          {regions.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={r.id === activeId}
              onClick={() => setActiveId(r.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                r.id === activeId
                  ? "border-sage bg-sage text-ink"
                  : "border-ink-muted/30 text-ink-muted hover:border-sage/60 hover:text-ink-foreground"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div key={active.id} className="mt-6">
          <p className="text-sm font-medium uppercase tracking-widest text-sage">{active.tagline}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-ink-foreground">{active.name}</h3>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">{active.explanation}</p>
        </div>
      </div>
    </div>
  );
}
