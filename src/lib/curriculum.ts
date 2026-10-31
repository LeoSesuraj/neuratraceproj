import { chapterOneLessons } from "./chapter-one";

/**
 * Learning curriculum. Add a chapter by giving it `lessons`; chapters without
 * lessons render as "Coming soon" in the sidebar.
 */

export type QuizOption = { label: string; correct: boolean; feedback: string };
export type Quiz = { question: string; options: QuizOption[] };

export type Interaction =
  | { kind: "quiz"; quiz: Quiz }
  | { kind: "forgetfulness" }
  | { kind: "memory" }
  | { kind: "brain" }
  | { kind: "neuron" }
  | { kind: "changes" }
  | { kind: "review" };

export type StepVideo = {
  title: string;
  source: string;
  /** Privacy-enhanced YouTube embed URL. */
  embedUrl: string;
};

export type Step = {
  id: string;
  heading: string;
  body: string[];
  /** Optional "go deeper" science, revealed on request. */
  deeper?: string;
  interaction?: Interaction;
  video?: StepVideo;
  panels?: { title: string; body: string[] }[];
};

export type Lesson = {
  id: string; // e.g. "1.3"
  title: string;
  minutes: number;
  steps: Step[];
  sourceIds?: string[];
};

export type Chapter = {
  n: number;
  title: string;
  lessons: Lesson[];
};

export const reviewQuiz: Quiz[] = [
  {
    question: "How are Alzheimer's disease and dementia related?",
    options: [
      { label: "They are two words for the same thing", correct: false, feedback: "Close, but dementia is the broader term for a group of symptoms." },
      { label: "Alzheimer's is the most common cause of dementia", correct: true, feedback: "Right. Dementia describes the symptoms; Alzheimer's is one disease that causes them, and the most common one." },
      { label: "Dementia is a normal part of aging", correct: false, feedback: "Not quite. Some forgetfulness is common with age, but dementia is not a normal part of aging." },
    ],
  },
  {
    question: "Which brain structure plays a key role in forming new memories?",
    options: [
      { label: "Cerebellum", correct: false, feedback: "The cerebellum mainly helps with balance and coordination." },
      { label: "Occipital lobe", correct: false, feedback: "The occipital lobe mainly processes vision." },
      { label: "Hippocampus", correct: true, feedback: "Yes. The hippocampus helps turn new experiences into lasting memories, and it is often affected early." },
    ],
  },
  {
    question: "Neurons pass messages to each other at small gaps called...",
    options: [
      { label: "Synapses", correct: true, feedback: "Exactly. Chemical messengers cross the synapse to carry the signal to the next neuron." },
      { label: "Plaques", correct: false, feedback: "Plaques are protein clumps that build up in Alzheimer's, not normal connection points." },
      { label: "Lobes", correct: false, feedback: "Lobes are large areas of the brain, not the tiny gaps between neurons." },
    ],
  },
  {
    question: "Which two proteins are hallmarks of Alzheimer's disease?",
    options: [
      { label: "Insulin and collagen", correct: false, feedback: "Not these. Look for the proteins that form plaques and tangles." },
      { label: "Amyloid-beta and tau", correct: true, feedback: "Right. Amyloid-beta builds up between neurons; tau forms tangles inside them." },
      { label: "Dopamine and serotonin", correct: false, feedback: "Those are chemical messengers, not the proteins that clump in Alzheimer's." },
    ],
  },
  {
    question: "Why might your loved one remember their wedding day but not this morning's visit?",
    options: [
      { label: "They are choosing what to remember", correct: false, feedback: "It is not a choice. Changes in the brain make new memories hard to form." },
      { label: "Older memories are stored more widely and were formed before the hippocampus was affected", correct: true, feedback: "Yes. New memories depend heavily on the hippocampus, which is often affected early. Long-held memories can last longer." },
      { label: "Their eyesight has gotten worse", correct: false, feedback: "Eyesight does not explain this pattern. It comes from how memory forms in the brain." },
    ],
  },
  {
    question: "Your father becomes much more confused over a few hours. What should you do?",
    options: [
      { label: "Assume this is the next stage of Alzheimer's", correct: false, feedback: "A sudden change is not typical gradual progression. Delirium or another illness may be involved." },
      { label: "Seek prompt medical assessment", correct: true, feedback: "Yes. A sudden change needs assessment; new weakness or difficulty speaking requires emergency help." },
      { label: "Wait a few weeks to see if it passes", correct: false, feedback: "Waiting could delay treatment of an urgent or treatable problem." },
    ],
  },
  {
    question: "A relative has MCI. Does this mean they will definitely develop Alzheimer's?",
    options: [
      { label: "Yes, MCI always becomes Alzheimer's", correct: false, feedback: "MCI has different causes and outcomes. Some people remain stable or improve." },
      { label: "No. Follow-up is needed, but progression is not certain", correct: true, feedback: "Right. MCI raises concern, but it is not a guaranteed path to dementia." },
    ],
  },
  {
    question: "A positive Alzheimer's biomarker result arrives. What is the next step?",
    options: [
      { label: "Interpret it together with symptoms and a full clinical evaluation", correct: true, feedback: "Yes. Biomarkers add information; they do not replace medical history, examination, and assessment of daily function." },
      { label: "Use it to predict the exact date independence will be lost", correct: false, feedback: "A biomarker cannot give a reliable personal countdown." },
    ],
  },
  {
    question: "A friend says amyloid-targeting medicines restore lost memories. How would you respond?",
    options: [
      { label: "They can slow decline in selected early-stage patients, but do not restore lost cognition", correct: true, feedback: "Correct. Eligibility and risks, including brain swelling or bleeding, require specialist discussion and monitoring." },
      { label: "They cure Alzheimer's for everyone", correct: false, feedback: "There is no cure. These medicines are not appropriate for every patient or disease stage." },
    ],
  },
];

export const chapters: Chapter[] = [
  { n: 1, title: "Understanding Alzheimer's", lessons: chapterOneLessons },
  { n: 2, title: "Experiencing Their World", lessons: [] },
  { n: 3, title: "Communication and Connection", lessons: [] },
  { n: 4, title: "Understanding Behaviors", lessons: [] },
  { n: 5, title: "Everyday Care", lessons: [] },
  { n: 6, title: "Meaningful Connection", lessons: [] },
  { n: 7, title: "The Caregiver Journey", lessons: [] },
];

export const allLessons: Lesson[] = chapters.flatMap((c) => c.lessons);

export function findLesson(id: string | undefined) {
  return allLessons.find((l) => l.id === id);
}

export function chapterOf(lessonId: string) {
  return chapters.find((c) => c.lessons.some((l) => l.id === lessonId)) ?? chapters[0];
}

export function nextLesson(id: string) {
  const i = allLessons.findIndex((l) => l.id === id);
  return i >= 0 ? allLessons[i + 1] : undefined;
}

export function prevLesson(id: string) {
  const i = allLessons.findIndex((l) => l.id === id);
  return i > 0 ? allLessons[i - 1] : undefined;
}
