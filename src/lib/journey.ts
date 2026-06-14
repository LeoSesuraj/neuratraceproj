export type Stage = {
  slug: "early" | "middle" | "late";
  label: string;
  duration: string;
  summary: string;
  changes: string[];
  caregiverFocus: string[];
};

export const stages: Stage[] = [
  {
    slug: "early",
    label: "Early stage",
    duration: "Often 2–4 years",
    summary:
      "Your loved one is still largely independent. Most changes are subtle — noticeable to family, easy to miss in passing.",
    changes: [
      "Mild memory loss, especially for recent conversations.",
      "Repetition of questions or stories.",
      "Difficulty finding the right word.",
      "Trouble with planning, budgets, or new technology.",
    ],
    caregiverFocus: [
      "Have important conversations about wishes, finances, and care preferences.",
      "Simplify routines and use reminders and shared calendars.",
      "Stay connected — social engagement protects brain health.",
    ],
  },
  {
    slug: "middle",
    label: "Middle stage",
    duration: "Often 2–10 years",
    summary:
      "The longest stage. More help is needed with everyday tasks, and behaviors can shift. This is when families often begin to feel the weight.",
    changes: [
      "Increased confusion about time, place, or familiar people.",
      "Help needed with bathing, dressing, and meals.",
      "Personality changes — anxiety, suspicion, sundowning.",
      "Possible wandering or sleep disruption.",
    ],
    caregiverFocus: [
      "Build a daily rhythm — predictable, slow, and gentle.",
      "Create a safe environment: locks, labels, lighting.",
      "Bring in help. You cannot do this alone, and you shouldn't try.",
    ],
  },
  {
    slug: "late",
    label: "Late stage",
    duration: "Often 1–3 years",
    summary:
      "Full assistance is needed for daily care. Communication shifts away from words and toward presence, touch, and tone.",
    changes: [
      "Limited speech; communication through expression and sound.",
      "Significant help with eating, mobility, and personal care.",
      "Increased sleep and reduced awareness of surroundings.",
      "Greater vulnerability to infections and other illness.",
    ],
    caregiverFocus: [
      "Comfort care: warmth, soft music, familiar scents, gentle touch.",
      "Speak even when there's no response — they often still hear.",
      "Consider hospice support and lean on your team.",
    ],
  },
];
