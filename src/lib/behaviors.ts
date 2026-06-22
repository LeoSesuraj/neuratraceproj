import { getSituation } from "@/lib/situations";

/**
 * Stable id stored in residents.behaviors. The label is what staff see
 * in the checklist. `slug` (when present) maps to a guide at
 * /learn/connect/[slug], keep in sync with src/lib/situations.ts.
 */
export type BehaviorOption = {
  id: string;
  label: string;
  slug: string | null;
};

export const BEHAVIOR_OPTIONS: BehaviorOption[] = [
  { id: "repeating-questions", label: "Repeating questions", slug: "repeating-questions" },
  { id: "agitation", label: "Agitation / mood changes", slug: "agitation" },
  { id: "wandering", label: "Wandering", slug: "wandering" },
  { id: "sundowning", label: "Sundowning", slug: "sundowning" },
  { id: "not-recognizing-family", label: "Not recognizing family", slug: "not-recognizing-family" },
  { id: "refusing-care", label: "Refusing care", slug: "refusing-care" },
  { id: "sleep-disturbances", label: "Sleep disturbances", slug: "sleep-disruption" },
  { id: "hallucinations", label: "Hallucinations", slug: null },
  { id: "anxiety-restlessness", label: "Anxiety / restlessness", slug: null },
  { id: "difficulty-communicating", label: "Difficulty communicating", slug: null },
  { id: "asking-for-deceased-relatives", label: "Asking for deceased relatives", slug: "asking-for-deceased-relatives" },
  { id: "suspicion-accusations", label: "Suspicion / accusations", slug: "suspicion-accusations" },
  { id: "mealtime-difficulty", label: "Mealtime difficulty", slug: "mealtime-difficulty" },
];

const BEHAVIOR_BY_ID = new Map(BEHAVIOR_OPTIONS.map((b) => [b.id, b]));

export const VALID_BEHAVIOR_IDS = BEHAVIOR_OPTIONS.map((b) => b.id);

export function getBehavior(id: string): BehaviorOption | undefined {
  return BEHAVIOR_BY_ID.get(id);
}

/** Resolve selected behavior ids to guide entries that exist in /learn/connect. */
export function suggestedGuidesFor(behaviorIds: string[]) {
  const seen = new Set<string>();
  const guides: Array<{
    behaviorId: string;
    behaviorLabel: string;
    slug: string;
    title: string;
    blurb: string;
    tags: string[];
  }> = [];
  for (const id of behaviorIds) {
    const b = BEHAVIOR_BY_ID.get(id);
    if (!b || !b.slug || seen.has(b.slug)) continue;
    const s = getSituation(b.slug);
    if (!s) continue;
    seen.add(b.slug);
    guides.push({
      behaviorId: b.id,
      behaviorLabel: b.label,
      slug: s.slug,
      title: s.title,
      blurb: s.blurb,
      tags: s.tags,
    });
  }
  return guides;
}
