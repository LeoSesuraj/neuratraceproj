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
};

export type Lesson = {
  id: string; // e.g. "1.3"
  title: string;
  minutes: number;
  steps: Step[];
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
];

export const chapters: Chapter[] = [
  {
    n: 1,
    title: "Understanding Alzheimer's",
    lessons: [
      {
        id: "1.1",
        title: "What is Alzheimer's?",
        minutes: 4,
        steps: [
          {
            id: "intro",
            heading: "A disease of the brain, not a personal failing",
            body: [
              "Alzheimer's disease is a condition that slowly damages brain cells and the connections between them.",
              "Over time, this makes it harder to remember, think, find words, and manage everyday tasks. The changes are gradual and usually unfold over many years.",
              "When your loved one forgets or struggles, it is the disease at work. It is not stubbornness, and it is not something they can try harder to fix.",
            ],
          },
          {
            id: "dementia",
            heading: "Alzheimer's and dementia",
            body: [
              "Dementia is a general word for a group of symptoms: memory loss and changes in thinking that are serious enough to affect daily life.",
              "Alzheimer's is one disease that causes dementia. It is the most common cause, responsible for about 60 to 80 percent of cases. Other causes include vascular dementia and Lewy body dementia.",
            ],
            interaction: {
              kind: "quiz",
              quiz: {
                question: "Which sentence is accurate?",
                options: [
                  { label: "Everyone with dementia has Alzheimer's", correct: false, feedback: "Not quite. Dementia has several possible causes. Alzheimer's is the most common, but not the only one." },
                  { label: "Alzheimer's is one of several causes of dementia", correct: true, feedback: "That's it. Dementia is the umbrella; Alzheimer's sits under it alongside other conditions." },
                  { label: "Dementia is just normal aging", correct: false, feedback: "Dementia is not a normal part of aging, even though it becomes more common in older age." },
                ],
              },
            },
          },
          {
            id: "aging",
            heading: "Everyday forgetfulness, or something more?",
            body: [
              "Everyone forgets things now and then, and some slowing down is common with age. The difference is whether the changes disrupt daily life.",
              "Sort each example below. There is no grade here, just a chance to notice the difference.",
            ],
            interaction: { kind: "forgetfulness" },
          },
          {
            id: "wrap",
            heading: "What to remember",
            body: [
              "Alzheimer's is a brain disease that gradually affects memory and thinking. It is the most common cause of dementia, and it is not a normal part of aging.",
              "Next, we'll look at how memories are made, which helps explain why recent memories are often the first to fade.",
            ],
          },
        ],
      },
      {
        id: "1.2",
        title: "How memory works",
        minutes: 5,
        steps: [
          {
            id: "neurons",
            heading: "Billions of cells, talking all the time",
            body: [
              "Your brain contains roughly 86 billion nerve cells called neurons. Each one can connect with thousands of others.",
              "Neurons that work together form networks. Every thought, feeling, and memory is a pattern of activity running through these networks.",
            ],
          },
          {
            id: "sequence",
            heading: "From a moment to a memory",
            body: ["Step through how an everyday moment, like a grandchild's visit, can become a memory."],
            interaction: { kind: "memory" },
            deeper:
              "Scientists call the strengthening of memories over time consolidation. The hippocampus, in the inner part of the temporal lobe, helps bind together details stored across the cortex (sights, sounds, emotions). With repetition and sleep, memories become less dependent on the hippocampus and more spread across cortical networks.",
          },
          {
            id: "hippocampus",
            heading: "Why recent memories fade first",
            body: [
              "The hippocampus is one of the first areas affected by Alzheimer's. When it struggles, new experiences have trouble being saved.",
              "Older memories that were formed long ago and revisited many times are stored more widely across the brain, so they often last longer. This is why someone may vividly describe their childhood home but not remember lunch.",
            ],
            interaction: {
              kind: "quiz",
              quiz: {
                question: "Your mother asks the same question several times in an hour. What's the most likely reason?",
                options: [
                  { label: "She isn't listening to the answer", correct: false, feedback: "She is likely listening. The answer just isn't being stored as a new memory." },
                  { label: "New information isn't being saved the way it used to be", correct: true, feedback: "Yes. Answering gently each time, as if it were the first, can help her feel safe." },
                  { label: "She is testing your patience", correct: false, feedback: "Repeated questions are a symptom, not a test. They often come from uncertainty or worry." },
                ],
              },
            },
          },
        ],
      },
      {
        id: "1.3",
        title: "Explore the brain",
        minutes: 5,
        steps: [
          {
            id: "explore",
            heading: "A map of the brain",
            body: [
              "Select a region to see what it does and how Alzheimer's may affect it. The view below shows the left side of the brain, with the front on the left.",
            ],
            interaction: { kind: "brain" },
            deeper:
              "Alzheimer's changes usually begin in the medial temporal lobe, including the entorhinal cortex and hippocampus. They tend to spread next to other parts of the temporal and parietal lobes, and later to the frontal lobes. Areas for basic vision, movement, and the cerebellum are often affected later. Every person's pattern is a little different.",
          },
          {
            id: "pattern",
            heading: "Changes follow a pattern, loosely",
            body: [
              "Because Alzheimer's often starts in memory areas and spreads outward, memory changes usually come first. Later, language, planning, judgment, and recognizing places or faces may become harder.",
              "Even late in the disease, many people still respond to music, touch, a warm tone of voice, and familiar routines.",
            ],
          },
        ],
      },
      {
        id: "1.4",
        title: "What happens to neurons?",
        minutes: 4,
        steps: [
          {
            id: "anatomy",
            heading: "Meet the neuron",
            body: ["Select each part of the neuron to see its job."],
            interaction: { kind: "neuron" },
          },
          {
            id: "synapse",
            heading: "Connections are everything",
            body: [
              "A single neuron can't hold a memory. Memories and skills live in the connections between many neurons.",
              "At each synapse, one neuron releases chemical messengers that the next neuron picks up. The more a connection is used, the stronger it tends to become.",
            ],
            deeper:
              "Chemical messengers are called neurotransmitters. Acetylcholine, one neurotransmitter important for memory and attention, is reduced in Alzheimer's. Some approved medicines (cholinesterase inhibitors) work by helping preserve acetylcholine levels; they can ease symptoms for some people but do not stop the disease.",
          },
          {
            id: "disrupt",
            heading: "When the network is disrupted",
            body: [
              "In Alzheimer's, synapses stop working properly and are lost, and over time neurons themselves are damaged and die.",
              "Think of it like a city's roads closing one by one. Messages still try to get through, but they take longer, get lost, or don't arrive at all.",
            ],
          },
        ],
      },
      {
        id: "1.5",
        title: "How Alzheimer's changes the brain",
        minutes: 6,
        steps: [
          {
            id: "changes",
            heading: "Four connected changes",
            body: [
              "Researchers have identified several changes that work together in Alzheimer's. Select each one to compare a healthy area with an affected one.",
            ],
            interaction: { kind: "changes" },
          },
          {
            id: "watch",
            heading: "Watch it unfold",
            body: [
              "This short video from the National Institute on Aging shows how these changes develop in the brain over time.",
            ],
            video: {
              title: "How Alzheimer's Changes the Brain",
              source: "National Institute on Aging (NIA), National Institutes of Health",
              embedUrl: "https://www.youtube-nocookie.com/embed/hEw1Yq_4PaA",
            },
          },
          {
            id: "symptoms",
            heading: "From brain changes to everyday symptoms",
            body: [
              "No single change explains every symptom. Plaques, tangles, inflammation, lost connections, and lost neurons build on one another over many years, often starting a decade or more before symptoms appear.",
              "Which symptoms show up depends partly on which areas are most affected. That's why two people with Alzheimer's can look quite different.",
            ],
            deeper:
              "Tau tangles tend to track more closely with symptoms and with where neurons are lost than amyloid plaques do. Some people have significant amyloid without obvious symptoms. Research on how these changes interact, and why they happen, is ongoing.",
            interaction: {
              kind: "quiz",
              quiz: {
                question: "Which statement best describes how Alzheimer's causes symptoms?",
                options: [
                  { label: "A single plaque causes all the symptoms", correct: false, feedback: "Plaques are only one part of the picture." },
                  { label: "Several changes build together over years and affect different brain areas", correct: true, feedback: "Yes. It's a gradual combination of changes, which is why each person's experience differs." },
                  { label: "Symptoms appear the moment the disease starts", correct: false, feedback: "Brain changes often begin many years before symptoms are noticed." },
                ],
              },
            },
          },
        ],
      },
      {
        id: "1.6",
        title: "Chapter review",
        minutes: 5,
        steps: [
          {
            id: "review",
            heading: "Let's bring it together",
            body: ["Five gentle questions to help it stick. You can try again as many times as you like."],
            interaction: { kind: "review" },
          },
        ],
      },
    ],
  },
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
  return chapters.find((c) => c.lessons.some((l) => l.id === lessonId))!;
}

export function nextLesson(id: string) {
  const i = allLessons.findIndex((l) => l.id === id);
  return i >= 0 ? allLessons[i + 1] : undefined;
}

export function prevLesson(id: string) {
  const i = allLessons.findIndex((l) => l.id === id);
  return i > 0 ? allLessons[i - 1] : undefined;
}
