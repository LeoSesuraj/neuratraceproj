import { situations, type Situation } from "@/lib/situations";

// Keyword → situation slug. Matched against lowercased text from notes,
// alert categories, and survey notes. Each keyword is checked as a
// substring (word-ish via simple regex) so common variants hit.
const KEYWORD_TO_SLUG: Record<string, string> = {
  // repeating-questions
  repeat: "repeating-questions",
  repetition: "repeating-questions",
  "asks again": "repeating-questions",
  "same question": "repeating-questions",

  // not-recognizing-family
  "not recogniz": "not-recognizing-family",
  "doesn't recogniz": "not-recognizing-family",
  "didn't recogniz": "not-recognizing-family",
  "who are you": "not-recognizing-family",
  recognition: "not-recognizing-family",

  // asking-for-deceased-relatives
  "asking for mom": "asking-for-deceased-relatives",
  "asking for mother": "asking-for-deceased-relatives",
  "asking for dad": "asking-for-deceased-relatives",
  "where is my": "asking-for-deceased-relatives",
  deceased: "asking-for-deceased-relatives",

  // agitation
  agitation: "agitation",
  agitated: "agitation",
  restless: "agitation",
  upset: "agitation",
  frustrated: "agitation",
  angry: "agitation",
  behavior: "agitation",
  behaviors: "agitation",

  // sundowning
  sundown: "sundowning",
  evening: "sundowning",
  "late afternoon": "sundowning",

  // refusing-care
  refus: "refusing-care",
  "won't bathe": "refusing-care",
  "won't take": "refusing-care",
  bath: "refusing-care",
  bathing: "refusing-care",
  medication: "refusing-care",

  // wandering
  wander: "wandering",
  "trying to leave": "wandering",
  "go home": "wandering",
  exit: "wandering",

  // suspicion-accusations
  suspicion: "suspicion-accusations",
  suspicious: "suspicion-accusations",
  paranoi: "suspicion-accusations",
  accusation: "suspicion-accusations",
  stealing: "suspicion-accusations",
  hiding: "suspicion-accusations",

  // sleep-disruption
  sleep: "sleep-disruption",
  "up at night": "sleep-disruption",
  insomnia: "sleep-disruption",
  napping: "sleep-disruption",

  // mealtime-difficulty
  eating: "mealtime-difficulty",
  mealtime: "mealtime-difficulty",
  appetite: "mealtime-difficulty",
  "not eating": "mealtime-difficulty",
  swallow: "mealtime-difficulty",
  choking: "mealtime-difficulty",
};

export type MatchedSituation = Situation & { matchedOn: string[] };

/**
 * Scan free-text resident signals and return matched Connect guides,
 * ordered by number of distinct keyword hits. Limited to `max` results.
 */
export function matchSituations(signals: string[], max = 5): MatchedSituation[] {
  const haystack = signals
    .filter(Boolean)
    .map((s) => s.toLowerCase())
    .join(" \n ");
  if (!haystack.trim()) return [];

  const hitsBySlug = new Map<string, Set<string>>();
  for (const [keyword, slug] of Object.entries(KEYWORD_TO_SLUG)) {
    if (haystack.includes(keyword)) {
      const set = hitsBySlug.get(slug) ?? new Set<string>();
      set.add(keyword);
      hitsBySlug.set(slug, set);
    }
  }

  const matches: MatchedSituation[] = [];
  for (const [slug, keywords] of hitsBySlug) {
    const sit = situations.find((s) => s.slug === slug);
    if (sit) matches.push({ ...sit, matchedOn: Array.from(keywords) });
  }

  matches.sort((a, b) => b.matchedOn.length - a.matchedOn.length);
  return matches.slice(0, max);
}
