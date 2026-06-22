export type SupportResource = {
  slug: string;
  title: string;
  blurb: string;
  body: string;
  tips: string[];
};

export const supportResources: SupportResource[] = [
  {
    slug: "burnout",
    title: "Caregiver burnout",
    blurb: "Recognize it. Take it seriously.",
    body: "Burnout isn't weakness, it's the predictable result of giving more than is sustainable. It can show up as exhaustion that sleep doesn't fix, irritability, hopelessness, or feeling numb. Catching it early matters: untreated burnout harms your health and shortens how long you can keep caring.",
    tips: [
      "Name it out loud, to a friend, doctor, or support group.",
      "Take micro-breaks: ten minutes outside counts.",
      "Accept any offer of help, even when it isn't perfect.",
    ],
  },
  {
    slug: "stress",
    title: "Stress management",
    blurb: "Small practices that compound.",
    body: "You can't eliminate the stress of caregiving, but you can soften your response to it. Tiny daily practices, used consistently, change your baseline more than occasional big efforts.",
    tips: [
      "Three slow breaths before walking into your loved one's room.",
      "A five-minute walk after a hard moment, before the next task.",
      "Protect one part of the day that is just yours.",
    ],
  },
  {
    slug: "support-groups",
    title: "Support groups",
    blurb: "You are not the only one.",
    body: "Talking to other caregivers, especially those a step ahead of you, is one of the most validating experiences in this journey. Groups exist in person, online, and by phone, free of charge, in most regions.",
    tips: [
      "Try one meeting before deciding. The first time is the hardest.",
      "Online groups are great if leaving the house is difficult.",
      "Look for dementia-specific groups, the issues are unique.",
    ],
  },
  {
    slug: "caregiving-tips",
    title: "Caregiving tips",
    blurb: "Small things that often help.",
    body: "Caregiving is a thousand small skills that no one taught you. Most caregivers learn the hard way. These are the ones families wish they'd known earlier.",
    tips: [
      "Approach from the front, at eye level, and speak slowly.",
      "Offer two choices, not open-ended questions.",
      "Music from their teens and twenties often reaches when words can't.",
      "When a moment goes badly, step out. Reset. Try again later.",
    ],
  },
  {
    slug: "organizations",
    title: "Helpful organizations",
    blurb: "Where to find real help.",
    body: "You don't need to figure this out alone. These organizations offer free 24/7 helplines, local resources, and detailed guides for every stage.",
    tips: [
      "Alzheimer's Association, 24/7 helpline at 800-272-3900 (US).",
      "Family Caregiver Alliance, caregiver.org",
      "Alzheimer's Society (UK), alzheimers.org.uk",
      "Eldercare Locator (US), eldercare.acl.gov for local services.",
    ],
  },
  {
    slug: "faq",
    title: "Frequently asked questions",
    blurb: "Honest answers to the hardest questions.",
    body: "There are no perfect answers, but families ask the same questions over and over. You're not alone in wondering.",
    tips: [
      "\"Should I correct them?\", Usually no. Meet them where they are.",
      "\"Will they remember I visited?\", Maybe not the visit, but they'll feel the warmth afterward.",
      "\"When is it time for more care?\", When safety, your health, or theirs is at risk.",
      "\"Am I doing enough?\", If you're asking, you are.",
    ],
  },
];

export const getSupportResource = (slug: string) =>
  supportResources.find((r) => r.slug === slug);
