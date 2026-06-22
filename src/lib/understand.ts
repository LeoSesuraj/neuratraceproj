export type MythCard = { myth: string; reality: string };
export type QuizQuestion = {
  question: string;
  choices: { text: string; correct: boolean; explain: string }[];
};

export type UnderstandTopic = {
  slug: string;
  title: string;
  blurb: string;
  why: string;
  howCommon: string;
  expect: string[];
  myths?: MythCard[];
  quiz?: QuizQuestion;
};

export const understandTopics: UnderstandTopic[] = [
  {
    slug: "memory-loss",
    title: "Memory loss",
    blurb: "Why short-term memory fades first.",
    why: "Dementia damages the hippocampus early, the part of the brain that turns new experiences into lasting memories. Older memories often stay intact long after recent ones become hard to hold onto. That's why a loved one may recall a wedding from 50 years ago but not what they ate an hour ago.",
    howCommon:
      "Memory loss that disrupts daily life is the most common early sign, present in nearly everyone with Alzheimer's disease.",
    expect: [
      "Forgotten conversations and repeated questions.",
      "Misplaced objects in unusual places.",
      "Relying more on notes, calendars, or family members.",
    ],
    myths: [
      {
        myth: "Memory loss is just part of getting older.",
        reality:
          "Forgetting a name and remembering it later is normal aging. Forgetting that the conversation happened at all is not.",
      },
      {
        myth: "If they remember old things, their memory is fine.",
        reality:
          "Long-term memories are stored differently and stay intact longer. Strong old memories don't rule out dementia.",
      },
    ],
    quiz: {
      question: "Your loved one asks the same question every few minutes. What's most likely going on?",
      choices: [
        {
          text: "They're not really paying attention to your answer.",
          correct: false,
          explain: "They are. The answer just isn't being stored as a memory.",
        },
        {
          text: "Each time, it genuinely feels like the first time they've asked.",
          correct: true,
          explain:
            "Exactly, short-term memory can't hold the exchange, so the question (and the worry behind it) keeps surfacing fresh.",
        },
        {
          text: "They're testing whether you're paying attention.",
          correct: false,
          explain: "Repetition in dementia is not strategic, it's the brain looping for reassurance.",
        },
      ],
    },
  },
  {
    slug: "disease-progression",
    title: "How dementia progresses",
    blurb: "From early changes to needing full-time care.",
    why: "Most dementias are progressive, the underlying brain changes slowly accumulate. Progression isn't linear: people often plateau for months, then shift. The pace and pattern differ for every person.",
    howCommon:
      "Alzheimer's typically progresses over 8–12 years, though it ranges widely. Vascular dementia can change in stair-steps after small strokes.",
    expect: [
      "Early: subtle memory and word-finding changes.",
      "Middle: more help with daily tasks, mood and personality shifts.",
      "Late: full assistance with eating, mobility, and personal care.",
    ],
    myths: [
      {
        myth: "Decline is steady and predictable.",
        reality:
          "It's usually uneven, long stretches of stability, then a noticeable shift. Sudden drops often have a reversible cause (infection, dehydration, new medication).",
      },
    ],
  },
  {
    slug: "behavioral-changes",
    title: "Behavioral changes",
    blurb: "Why a familiar personality can seem unfamiliar.",
    why: "Damage to the frontal lobes can affect impulse control, judgment, and social filters. New behaviors, suspicion, restlessness, even aggression, are symptoms of the disease, not choices. The person you love is still in there.",
    howCommon:
      "Around 90% of people with dementia experience behavioral or psychological symptoms at some point.",
    expect: [
      "Suspicion or accusations (\"someone is stealing from me\").",
      "Restlessness, pacing, or wandering.",
      "Mood swings that arrive without warning.",
    ],
    myths: [
      {
        myth: "If they get angry, they mean it.",
        reality:
          "Behavior is communication. Anger usually points to fear, pain, or overwhelm, not a real grievance with you.",
      },
      {
        myth: "Personality changes mean the person is gone.",
        reality:
          "The core self often shines through in flashes, a laugh, a song, a tender look. The disease overlays the personality; it doesn't erase it.",
      },
    ],
    quiz: {
      question: "Your dad suddenly accuses you of stealing his wallet. The kindest first response is:",
      choices: [
        {
          text: "\"I would never steal from you. Why would you say that?\"",
          correct: false,
          explain: "Self-defense fuels the accusation. He's not really making a case against you.",
        },
        {
          text: "\"That sounds really frustrating. Let's look together.\"",
          correct: true,
          explain:
            "Validates the feeling without arguing about facts, and turns it into a joint task.",
        },
      ],
    },
  },
  {
    slug: "cognitive-decline",
    title: "Cognitive decline",
    blurb: "Thinking, planning, and language become harder.",
    why: "Beyond memory, dementia affects executive function, the brain's ability to plan, sequence steps, and shift attention. Familiar tasks like cooking a meal or following a conversation can become surprisingly complex.",
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
    why: "Awareness of one's own changing abilities can be deeply distressing, especially in early stages. People with dementia also become more attuned to the emotional tone around them, even when words are lost.",
    howCommon:
      "Depression affects about 40% of people with Alzheimer's, and anxiety is also very common.",
    expect: [
      "Withdrawal from social activities or hobbies.",
      "Tears or fear in unfamiliar settings.",
      "Mirroring your mood, your calm becomes their calm.",
    ],
  },
  {
    slug: "daily-living",
    title: "Daily living",
    blurb: "Why dressing, cooking, and grooming get harder.",
    why: "Activities we take for granted require dozens of small decisions. As the brain's planning systems decline, these tasks become overwhelming, not because the person doesn't want to, but because the steps no longer arrive in order.",
    howCommon:
      "Difficulty with daily living is a defining marker of mid-stage dementia.",
    expect: [
      "Wearing the same clothes repeatedly or layering oddly.",
      "Skipping meals or eating the same thing.",
      "Needing prompts to start or finish a task.",
    ],
  },
  {
    slug: "types-of-dementia",
    title: "Types of dementia",
    blurb: "Alzheimer's, vascular, Lewy body, frontotemporal, and why it matters.",
    why: "Dementia is an umbrella term. The underlying disease shapes which symptoms appear first, how progression looks, and which treatments and approaches help. A clear diagnosis lets families plan instead of guess.",
    howCommon:
      "Alzheimer's accounts for 60–80% of dementia cases. Vascular is second; Lewy body and frontotemporal each affect smaller but significant populations.",
    expect: [
      "Alzheimer's: memory loss is usually the leading symptom.",
      "Vascular: stair-step changes, often after small strokes.",
      "Lewy body: visual hallucinations, sleep disturbance, parkinsonian movement.",
      "Frontotemporal: personality and language changes before memory.",
    ],
    myths: [
      {
        myth: "Alzheimer's and dementia are the same thing.",
        reality:
          "Dementia describes the symptoms. Alzheimer's is one disease that causes those symptoms. There are many others.",
      },
    ],
  },
  {
    slug: "communication",
    title: "Communication",
    blurb: "Connection when words start to fail.",
    why: "As language pathways are affected, the brain works harder to find words, follow long sentences, and keep up with rapid speech. Tone, facial expression, touch, and music remain accessible long after fluent conversation does.",
    howCommon:
      "Some degree of language change happens in nearly everyone with dementia, becoming central by middle stage.",
    expect: [
      "Pauses, word substitutions, or losing the thread mid-sentence.",
      "Stronger response to a calm tone than to the actual words.",
      "Deep responsiveness to music, eye contact, and gentle touch.",
    ],
    myths: [
      {
        myth: "If they can't talk, they can't understand.",
        reality:
          "Comprehension and feeling usually outlast expressive speech. Assume they hear you. Speak with warmth.",
      },
    ],
    quiz: {
      question: "What helps most when a loved one struggles to find a word?",
      choices: [
        {
          text: "Quickly finish the sentence for them.",
          correct: false,
          explain: "Sometimes helpful, often frustrating. Give space first.",
        },
        {
          text: "Wait, smile, and let them try, offer a gentle guess only if they ask.",
          correct: true,
          explain: "Preserves dignity and keeps the conversation theirs.",
        },
      ],
    },
  },
  {
    slug: "sleep-and-rest",
    title: "Sleep and rest",
    blurb: "Why nights get hard, and what actually helps.",
    why: "Dementia disrupts the brain's circadian clock and the chemistry that signals sleep. Daytime under-stimulation, evening overstimulation, pain, and medications all stack on top.",
    howCommon:
      "More than half of people with Alzheimer's experience significant sleep disturbance at some point.",
    expect: [
      "Difficulty falling or staying asleep.",
      "Daytime napping that pushes nighttime sleep later.",
      "Confusion at night that mimics sundowning.",
    ],
    myths: [
      {
        myth: "Over-the-counter sleep aids are a safe fix.",
        reality:
          "Many (especially diphenhydramine) worsen confusion and fall risk in dementia. Always check with the doctor.",
      },
    ],
  },
];

export const getUnderstandTopic = (slug: string) =>
  understandTopics.find((t) => t.slug === slug);
