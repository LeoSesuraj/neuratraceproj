import { useState } from "react";

type Region = {
  id: string;
  name: string;
  role: string;
  alz: string;
  d: string;
  deep?: boolean;
};

/**
 * Simplified lateral (left-side) view of the brain, front facing left.
 * Lobe boundaries follow the central sulcus, lateral (Sylvian) fissure and
 * parieto-occipital line; the hippocampus sits deep in the medial temporal
 * lobe and is drawn as a dashed "seen through the surface" outline.
 */
const regions: Region[] = [
  {
    id: "frontal",
    name: "Frontal lobe",
    role: "Helps with planning, decisions, attention, personality, and controlling impulses. It also contains areas that start movement and produce speech.",
    alz: "Usually affected later. Changes here can make planning, judgment, and keeping track of steps harder, and may change how someone behaves socially.",
    d: "M330,50 C230,35 120,65 78,150 C55,205 75,252 135,262 C165,265 180,250 200,245 L290,230 L305,150 Z",
  },
  {
    id: "parietal",
    name: "Parietal lobe",
    role: "Combines touch and body sense, and helps you understand where things are in space: judging distance, finding your way, and using objects.",
    alz: "Often affected after memory areas. A person may misjudge steps or chairs, get lost in familiar places, or have trouble with dressing or numbers.",
    d: "M330,50 C400,50 450,65 480,95 L470,175 L455,225 L380,215 L290,230 L305,150 Z",
  },
  {
    id: "occipital",
    name: "Occipital lobe",
    role: "The main area for processing what you see: shapes, colors, and movement.",
    alz: "Basic vision areas are often affected later. Problems recognizing objects can happen even when eyesight itself is fine.",
    d: "M480,95 C520,125 545,175 535,230 C528,265 505,285 475,290 L455,225 L470,175 Z",
  },
  {
    id: "temporal",
    name: "Temporal lobe",
    role: "Helps with hearing, understanding language, recognizing faces and objects, and memory. Its inner part holds the hippocampus.",
    alz: "One of the earliest and most affected areas. Changes can make new memories, word-finding, and recognizing people harder.",
    d: "M135,262 C165,265 180,250 200,245 L290,230 L380,215 L455,225 L475,290 C440,305 400,312 360,308 C300,304 230,308 180,298 C150,290 128,280 135,262 Z",
  },
  {
    id: "cerebellum",
    name: "Cerebellum",
    role: "Coordinates balance, posture, and smooth, precise movement.",
    alz: "Generally affected late, if at all. Many people keep familiar physical skills, like walking a known route or folding laundry, for a long time.",
    d: "M375,320 C380,290 430,282 470,290 C505,297 520,320 512,345 C503,370 460,380 425,374 C392,368 372,348 375,320 Z",
  },
  {
    id: "hippocampus",
    name: "Hippocampus",
    role: "A small, curved structure deep inside the temporal lobe. It helps turn new experiences into lasting memories and helps with finding your way.",
    alz: "Usually among the first areas affected, along with the nearby entorhinal cortex. This is why recent memories often fade first while older ones remain.",
    d: "M248,268 C290,260 340,260 382,270 C398,276 395,291 380,291 C340,286 290,285 256,287 C238,286 234,273 248,268 Z",
    deep: true,
  },
];

export function BrainInteraction() {
  const [activeId, setActiveId] = useState("hippocampus");
  const active = regions.find((r) => r.id === activeId)!;

  return (
    <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-lavender via-secondary to-blush p-4 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-center">
        <div>
          <svg
            viewBox="40 20 520 420"
            role="img"
            aria-label={`Side view of the brain. ${active.name} highlighted.`}
            className="mx-auto w-full max-w-xl drop-shadow-[0_20px_30px_rgba(75,47,143,0.18)]"
          >
            {/* Brainstem */}
            <path d="M345,300 C350,340 356,380 360,428 L390,428 C390,388 394,348 402,305 Z" fill="#f2c7b4" stroke="#d9a28f" strokeWidth="2" />
            {regions
              .filter((r) => !r.deep)
              .map((r) => {
                const on = r.id === activeId;
                return (
                  <path
                    key={r.id}
                    d={r.d}
                    onClick={() => setActiveId(r.id)}
                    className="cursor-pointer transition-[fill] duration-300"
                    fill={on ? "#ef7c9a" : "#f6c9b9"}
                    stroke="#d99a8a"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  >
                    <title>{r.name}</title>
                  </path>
                );
              })}
            {/* Hippocampus: deep structure shown through the surface */}
            {regions
              .filter((r) => r.deep)
              .map((r) => {
                const on = r.id === activeId;
                return (
                  <path
                    key={r.id}
                    d={r.d}
                    onClick={() => setActiveId(r.id)}
                    className="cursor-pointer transition-[fill] duration-300"
                    fill={on ? "#4b2f8f" : "rgba(75,47,143,0.18)"}
                    stroke="#4b2f8f"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  >
                    <title>{r.name} (deep inside)</title>
                  </path>
                );
              })}
          </svg>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Simplified educational illustration. Front of the head is on the left. The dashed shape sits deep inside.
          </p>
        </div>

        <div className="rounded-3xl bg-card p-5 shadow-[0_12px_40px_-12px_rgba(75,47,143,0.25)]" aria-live="polite">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blush-strong" aria-hidden />
            <h3 className="text-xl font-semibold text-foreground">{active.name}</h3>
          </div>
          <p className="mt-3 text-base text-foreground">{active.role}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">In Alzheimer's</p>
          <p className="mt-1 text-base text-muted-foreground">{active.alz}</p>
        </div>
      </div>

      <div role="tablist" aria-label="Brain regions" className="mt-5 flex flex-wrap justify-center gap-2">
        {regions.map((r) => (
          <button
            key={r.id}
            role="tab"
            type="button"
            aria-selected={r.id === activeId}
            onClick={() => setActiveId(r.id)}
            className={`min-h-11 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              r.id === activeId ? "bg-primary text-primary-foreground" : "bg-card/80 text-primary hover:bg-card"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>
    </div>
  );
}
