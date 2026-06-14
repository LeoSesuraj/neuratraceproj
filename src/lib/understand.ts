export type UnderstandTopic = {
  slug: string;
  title: string;
  blurb: string;
  why: string;
  howCommon: string;
  expect: string[];
};

export const understandTopics: UnderstandTopic[] = [
  {
    slug: "memory-loss",
    title: "Memory loss",
    blurb: "Why short-term memory fades first.",
    why: "Dementia damages the hippocampus early, the part of the brain that turns new experiences into lasting memories. Older memories often stay intact long after recent ones become hard to hold onto. That's why a loved one may recall a wedding from 50 years ago but not what they ate an hour ago.",
    howCommon:
      "Memory loss that disrupts daily life is the most common early sign — present in nearly everyone with Alzheimer's disease.",
    expect: [
      "Forgotten conversations and repeated questions.",
      "Misplaced objects in unusual places.",
      "Relying more on notes, calendars, or family members.",
    ],
  },
  {
    slug: "disease-progression",
    title: "How dementia progresses",
    blurb: "From early changes to needing full-time care.",
    why: "Most dementias are progressive — the underlying brain changes slowly accumulate. Progression isn't linear: people often plateau for months, then shift. The pace and pattern differ for every person.",
    howCommon:
      "Alzheimer's typically progresses over 8–12 years, though it ranges widely. Vascular dementia can change in stair-steps after small strokes.",
    expect: [
      "Early: subtle memory and word-finding changes.",
      "Middle: more help with daily tasks, mood and personality shifts.",
      "Late: full assistance with eating, mobility, and personal care.",
    ],
  },
  {
    slug: "behavioral-changes",
    title: "Behavioral changes",
    blurb: "Why a familiar personality can seem unfamiliar.",
    why: "Damage to the frontal lobes can affect impulse control, judgment, and social filters. New behaviors — suspicion, restlessness, even aggression — are symptoms of the disease, not choices. The person you love is still in there.",
    howCommon:
      "Around 90% of people with dementia experience behavioral or psychological symptoms at some point.",
    expect: [
      "Suspicion or accusations (\"someone is stealing from me\").",
      "Restlessness, pacing, or wandering.",
      "Mood swings that arrive without warning.",
    ],
  },
  {
    slug: "cognitive-decline",
    title: "Cognitive decline",
    blurb: "Thinking, planning, and language become harder.",
    why: "Beyond memory, dementia affects executive function — the brain's ability to plan, sequence steps, and shift attention. Familiar tasks like cooking a meal or following a conversation can become surprisingly complex.",
    howCommon:
      "Universal in dementia, though the specific abilities affected depend on which regions of the brain are involved.",
    expect: [
      "Difficulty finding the right word.",
      "Trouble following multi-step directions.",
      "Loss of sense of time, place, or familiar routes.",
    ],
  },
  {
    slug: "emotional-changes",
    title: "Emotional changes",
    blurb: "Anxiety, sadness, and sensitivity to mood.",
    why: "Awareness of one's own changing abilities can be deeply distressing — especially in early stages. People with dementia also become more attuned to the emotional tone around them, even when words are lost.",
    howCommon:
      "Depression affects about 40% of people with Alzheimer's, and anxiety is also very common.",
    expect: [
      "Withdrawal from social activities or hobbies.",
      "Tears or fear in unfamiliar settings.",
      "Mirroring your mood — your calm becomes their calm.",
    ],
  },
  {
    slug: "daily-living",
    title: "Daily living",
    blurb: "Why dressing, cooking, and grooming get harder.",
    why: "Activities we take for granted require dozens of small decisions. As the brain's planning systems decline, these tasks become overwhelming — not because the person doesn't want to, but because the steps no longer arrive in order.",
    howCommon:
      "Difficulty with daily living is a defining marker of mid-stage dementia.",
    expect: [
      "Wearing the same clothes repeatedly or layering oddly.",
      "Skipping meals or eating the same thing.",
      "Needing prompts to start or finish a task.",
    ],
  },
];

export const getUnderstandTopic = (slug: string) =>
  understandTopics.find((t) => t.slug === slug);
