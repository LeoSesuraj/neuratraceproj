export type Stage = {
  slug: "early" | "middle" | "late";
  label: string;
  duration: string;
  summary: string;
  changes: string[];
  caregiverFocus: string[];
  selfCare: string[];
  faq: { q: string; a: string }[];
  reflectionPrompt: string;
};

export const stages: Stage[] = [
  {
    slug: "early",
    label: "Early stage",
    duration: "Often 2–4 years",
    summary:
      "Your loved one is still largely independent. Most changes are subtle, noticeable to family, easy to miss in passing.",
    changes: [
      "Mild memory loss, especially for recent conversations.",
      "Repetition of questions or stories.",
      "Difficulty finding the right word.",
      "Trouble with planning, budgets, or new technology.",
    ],
    caregiverFocus: [
      "Have important conversations about wishes, finances, and care preferences.",
      "Simplify routines and use reminders and shared calendars.",
      "Stay connected, social engagement protects brain health.",
    ],
    selfCare: [
      "Tell a few trusted people what's happening, you'll need them later.",
      "Start a simple notebook to track changes and questions for the doctor.",
      "Schedule one thing each week that's just for you.",
    ],
    faq: [
      {
        q: "Should we tell extended family and friends?",
        a: "Yes, selectively. Sharing early lets your loved one keep meaningful relationships, and gives you support before you're worn down. Let them help shape who to tell.",
      },
      {
        q: "Is it safe to keep driving?",
        a: "Often yes in the earliest stage, but it should be reassessed regularly. Ask the doctor about a formal driving evaluation when you start to worry.",
      },
      {
        q: "What legal documents matter most right now?",
        a: "Power of attorney (financial and medical), an updated will, and an advance healthcare directive, while your loved one can still participate in the decisions.",
      },
    ],
    reflectionPrompt:
      "What's one conversation I want to have with my loved one while they can still fully take part?",
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
      "Personality changes, anxiety, suspicion, sundowning.",
      "Possible wandering or sleep disruption.",
    ],
    caregiverFocus: [
      "Build a daily rhythm, predictable, slow, and gentle.",
      "Create a safe environment: locks, labels, lighting.",
      "Bring in help. You cannot do this alone, and you shouldn't try.",
    ],
    selfCare: [
      "Accept (or ask for) respite, even a few hours a week.",
      "Find a caregiver support group, online or in person.",
      "Protect your own sleep aggressively, it's the first thing to disappear.",
      "Move your body daily, even just a 10-minute walk.",
    ],
    faq: [
      {
        q: "How do I know when it's time for in-home help?",
        a: "When safety, hygiene, or your own health is slipping, not when you've already collapsed. Earlier is almost always better than later.",
      },
      {
        q: "What about memory care or assisted living?",
        a: "Tour places before you need them. Memory care is appropriate when safety needs exceed what's possible at home, even with help. It's not a failure, it's a different kind of love.",
      },
      {
        q: "How do I handle visits from friends and grandkids?",
        a: "Keep them short, calm, and low-stimulation. Brief their visitors: short sentences, no quizzing, comfortable with silence.",
      },
    ],
    reflectionPrompt:
      "What's one thing I'm carrying alone right now that I could ask for help with this week?",
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
      "Speak even when there's no response, they often still hear.",
      "Consider hospice support and lean on your team.",
    ],
    selfCare: [
      "Let hospice take on what they can, that's what they're for.",
      "Begin grieving openly. Anticipatory grief is real, not weakness.",
      "Spend time with people who knew your loved one before the disease.",
      "Plan small, restorative moments for yourself daily.",
    ],
    faq: [
      {
        q: "When should we consider hospice?",
        a: "Hospice is appropriate when the focus shifts from extending life to comfort and quality of remaining time. It can be added much earlier than most families realize, and brings significant support to you.",
      },
      {
        q: "They don't seem to respond anymore. Does my presence still matter?",
        a: "Yes. Hearing and emotional sensing often persist. A familiar voice, hand, and scent are still felt, even when there's no visible response.",
      },
      {
        q: "How do I take care of myself through this?",
        a: "Sleep, food, sunlight, and one person to talk to honestly. Grief counseling, even a few sessions, helps many families through this stage and afterward.",
      },
    ],
    reflectionPrompt:
      "What do I most want my loved one to know, that I can still tell them, in words or in presence?",
  },
];

export const getStage = (slug: Stage["slug"]) =>
  stages.find((s) => s.slug === slug)!;
