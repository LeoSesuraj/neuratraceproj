export type PracticeExample = {
  prompt: string;
  good: string;
  goodWhy: string;
  poor: string;
  poorWhy: string;
};

export type Situation = {
  slug: string;
  title: string;
  blurb: string;
  tags: string[];
  whatsHappening: string;
  whatToSay: string[];
  whatToAvoid: string[];
  tips: string[];
  practice?: PracticeExample;
};

export const situations: Situation[] = [
  {
    slug: "repeating-questions",
    title: "Repeating questions",
    blurb: "When the same question comes again and again.",
    tags: ["memory", "anxiety", "everyday"],
    whatsHappening:
      "Short-term memory is no longer reliably storing new information. Each time the question is asked, it genuinely feels like the first time. The emotion driving the question, uncertainty, anxiety, the need for reassurance, is what's repeating, not the question itself.",
    whatToSay: [
      "Answer warmly, as if it's the first time you've heard it.",
      "Keep your reply short and consistent, the same words each time.",
      "Pair the answer with reassurance: \"We've got time. Nothing to worry about.\"",
    ],
    whatToAvoid: [
      "\"I just told you that.\"",
      "\"Don't you remember?\"",
      "Sighing, rolling eyes, or sounding frustrated.",
    ],
    tips: [
      "Write the answer on a notepad or whiteboard they can glance at.",
      "Gently redirect to a calming activity after answering.",
      "Notice the underlying feeling, often the question is really \"am I safe?\"",
    ],
    practice: {
      prompt: "Your loved one asks \"What time is the doctor's appointment?\" for the fifth time in an hour.",
      good: "\"It's at 2 o'clock, we've got plenty of time. Want to sit with me for a minute?\"",
      goodWhy: "Short, warm, the same answer each time, and shifts focus to something calming.",
      poor: "\"You just asked me that. It's at 2, I've told you a hundred times.\"",
      poorWhy: "Shames the memory loss and feeds the anxiety driving the question.",
    },
  },
  {
    slug: "not-recognizing-family",
    title: "Not recognizing family",
    blurb: "When a loved one looks at you and doesn't know who you are.",
    tags: ["memory", "emotional", "identity"],
    whatsHappening:
      "The disease can erase recent decades first. They may still recognize you as someone safe and familiar even if they can't place the name or relationship. This is one of the most painful parts of dementia for families, and it isn't personal.",
    whatToSay: [
      "Greet them by name and gently say yours: \"Hi Mom, it's me, Sarah.\"",
      "Speak about shared memories in a warm, calm tone.",
      "Let them lead, if they think you're someone else, you can simply be present.",
    ],
    whatToAvoid: [
      "Quizzing them: \"Do you know who I am?\"",
      "Correcting them sharply or appearing hurt.",
      "Insisting they remember.",
    ],
    tips: [
      "Sit at eye level and approach slowly from the front.",
      "Bring a familiar object, a photo, a song, a scent.",
      "Give yourself space to grieve afterward. This is a real loss.",
    ],
    practice: {
      prompt: "You walk into the room and your dad asks, \"Who are you?\"",
      good: "\"Hi Dad, it's me, your daughter Jen. I came by to sit with you for a while.\"",
      goodWhy: "Gives the name, the relationship, and a calm reason for being there, no quiz.",
      poor: "\"Dad, come on. You really don't know me? It's Jen.\"",
      poorWhy: "Turns a tender moment into a test he can't pass.",
    },
  },
  {
    slug: "asking-for-deceased-relatives",
    title: "Asking for someone who has died",
    blurb: "\"Where's my mother?\", when the person they're asking for is gone.",
    tags: ["emotional", "memory", "grief"],
    whatsHappening:
      "They may be living, emotionally, in an earlier decade of their life. Telling them a loved one has died can cause them to grieve the loss freshly, sometimes again and again. They are searching for safety and connection.",
    whatToSay: [
      "Acknowledge the feeling: \"It sounds like you really miss her.\"",
      "Ask about the person: \"Tell me about your mother.\"",
      "Offer to look at a photo together.",
    ],
    whatToAvoid: [
      "\"She passed away years ago.\"",
      "Arguing about the year or what's real.",
      "Forcing them to face the loss repeatedly.",
    ],
    tips: [
      "Step into their reality rather than pulling them into yours.",
      "Use \"therapeutic fibs\" only when honesty would cause harm.",
      "Redirect with a comforting activity after acknowledging the feeling.",
    ],
    practice: {
      prompt: "Your mother, who lost her own mom 30 years ago, asks repeatedly, \"When is Mama coming?\"",
      good: "\"You're really missing her today, aren't you? Tell me about her, what did she love to cook?\"",
      goodWhy: "Honors the feeling and gently moves toward warm memory instead of fresh grief.",
      poor: "\"Mom, your mother died in 1994. Please stop asking.\"",
      poorWhy: "Forces her to relive a devastating loss every time she asks.",
    },
  },
  {
    slug: "agitation",
    title: "Agitation",
    blurb: "Restlessness, frustration, or sudden distress.",
    tags: ["behavior", "communication", "urgent"],
    whatsHappening:
      "Agitation is almost always communication. It can signal pain, hunger, fatigue, overstimulation, a full bladder, or feeling overwhelmed. The brain is no longer able to clearly say \"I'm uncomfortable.\"",
    whatToSay: [
      "Lower your voice and slow your pace.",
      "\"I'm right here with you. Let's take a breath together.\"",
      "Offer a simple choice: \"Would you like to sit, or walk a bit?\"",
    ],
    whatToAvoid: [
      "Raising your voice or matching their energy.",
      "Asking many questions at once.",
      "Physical restraint unless safety requires it.",
    ],
    tips: [
      "Check basics first: pain, hunger, thirst, bathroom, temperature.",
      "Reduce noise, turn off the TV, dim the lights.",
      "Familiar music or a soft hand on theirs can often reset the moment.",
    ],
    practice: {
      prompt: "Your loved one is pacing, fists clenched, saying \"I need to go, I need to go\" but can't explain where.",
      good: "(softly) \"I'm here. Let's walk together for a minute. Are you hurting anywhere?\"",
      goodWhy: "Joins them instead of blocking, lowers the room's energy, and checks for unmet needs.",
      poor: "\"Sit down! There's nowhere to go. Stop it.\"",
      poorWhy: "Adds confrontation to an already overloaded nervous system.",
    },
  },
  {
    slug: "sundowning",
    title: "Sundowning",
    blurb: "Increased confusion or agitation in late afternoon and evening.",
    tags: ["behavior", "routine", "everyday"],
    whatsHappening:
      "As daylight fades, internal cues become harder to read. Fatigue accumulates, and shadows can become disorienting. This is one of the most common patterns in mid-stage dementia.",
    whatToSay: [
      "Use a calm, even tone, your voice helps regulate theirs.",
      "Name what is real and safe: \"You're home. I'm here.\"",
      "Suggest a quiet, predictable activity.",
    ],
    whatToAvoid: [
      "Starting new or complex tasks in the late afternoon.",
      "Bright overhead lights that create harsh shadows.",
      "Caffeine or sugar later in the day.",
    ],
    tips: [
      "Close curtains and turn on warm, even lighting before dusk.",
      "Keep an early-evening routine, same time, same order.",
      "Protect daytime light exposure and a consistent bedtime.",
    ],
  },
  {
    slug: "refusing-care",
    title: "Refusing care",
    blurb: "When bathing, dressing, or medication becomes a battle.",
    tags: ["behavior", "dignity", "everyday"],
    whatsHappening:
      "Care tasks can feel confusing, exposing, or even frightening when the brain can't make sense of what's happening or why. Refusal is often fear or loss of control, not stubbornness.",
    whatToSay: [
      "Explain one small step at a time: \"I'm going to help you with your sleeve.\"",
      "Offer choices: \"Bath now, or after we have tea?\"",
      "Affirm dignity: \"You're doing so well.\"",
    ],
    whatToAvoid: [
      "Forcing the task in the moment.",
      "Long explanations or rationalizing.",
      "Taking the refusal personally.",
    ],
    tips: [
      "Step away and try again in 15–20 minutes.",
      "Warm the room and the towels, comfort matters.",
      "Tie the task to a pleasant cue: music, a favorite scent.",
    ],
    practice: {
      prompt: "Your father refuses to take his evening medication and pushes the cup away.",
      good: "\"Okay, no rush. Let's sit a minute. Would you like the pill with applesauce or with juice?\"",
      goodWhy: "Removes the standoff, offers a small choice, and restores a sense of control.",
      poor: "\"You have to take this. The doctor said so. Open your mouth.\"",
      poorWhy: "Triggers fear and resistance, the refusal will get bigger.",
    },
  },
  {
    slug: "wandering",
    title: "Wandering or trying to leave",
    blurb: "\"I have to go home\", even when they are home.",
    tags: ["safety", "behavior", "urgent"],
    whatsHappening:
      "\"Home\" is often less a place than a feeling, safety, family, a familiar self. When the present moment feels strange, the brain reaches for the most settled memory of belonging. Wandering can also be driven by restlessness, boredom, or unmet physical needs.",
    whatToSay: [
      "Validate the feeling: \"You want to be somewhere that feels like home. I understand.\"",
      "Walk with them a little, then gently redirect.",
      "Offer a comforting anchor: tea, a favorite blanket, a familiar song.",
    ],
    whatToAvoid: [
      "Blocking the door or arguing \"You ARE home.\"",
      "Locking them in a room, it escalates panic.",
      "Trying to reason them out of the feeling.",
    ],
    tips: [
      "Use door chimes or motion alerts so you know if they leave.",
      "Place a dark mat in front of exits, it can look like a hole and discourage stepping over.",
      "Enroll in a wandering safety program (MedicAlert + Alzheimer's Association) for ID and quick response.",
    ],
    practice: {
      prompt: "At 7pm your mom puts on her coat and says, \"I need to go home now. The children are waiting.\"",
      good: "\"It's a little late to head out, let's have some tea first. Tell me about the kids.\"",
      goodWhy: "Doesn't argue with the reality, buys time, and shifts to warm memory.",
      poor: "\"Mom, this IS your home. Your kids are grown. Take off your coat.\"",
      poorWhy: "Strips away her sense of purpose and identity in one sentence.",
    },
  },
  {
    slug: "suspicion-accusations",
    title: "Suspicion or accusations",
    blurb: "\"Someone is stealing from me.\" \"You're hiding things.\"",
    tags: ["behavior", "emotional", "communication"],
    whatsHappening:
      "When the brain can't find a missing item or remember putting it somewhere, it fills the gap with a story that makes sense, often: \"someone took it.\" These accusations come from confusion and fear, not from real beliefs about you.",
    whatToSay: [
      "Stay calm. \"That sounds frustrating. Let's look together.\"",
      "Validate the feeling, not the accusation: \"I'd be upset too if I couldn't find it.\"",
      "Shift focus once the moment passes, don't relitigate.",
    ],
    whatToAvoid: [
      "Defending yourself or arguing about who took what.",
      "Saying \"You're being paranoid.\"",
      "Laughing it off in front of them.",
    ],
    tips: [
      "Keep duplicates of frequently \"lost\" items (glasses, wallet, keys).",
      "Note common hiding spots, they often repeat.",
      "If accusations are new or intense, mention to the doctor: infection or medication can amplify them.",
    ],
  },
  {
    slug: "sleep-disruption",
    title: "Sleep disruption",
    blurb: "Up in the night, napping all day, sleep-wake reversed.",
    tags: ["routine", "everyday", "self-care"],
    whatsHappening:
      "Dementia damages the brain's circadian regulator. The internal clock drifts, and the cues that used to anchor day-and-night, light, activity, hunger, register less clearly. Caregivers often lose sleep too, which makes everything harder.",
    whatToSay: [
      "If they wake at night: keep your voice soft. \"It's still nighttime, I'm here.\"",
      "Avoid bright overhead lights; use a small lamp.",
      "Offer water and a bathroom trip before suggesting they lie down again.",
    ],
    whatToAvoid: [
      "Turning on the TV or starting a conversation.",
      "Long daytime naps (cap at 30 minutes, before mid-afternoon).",
      "Caffeine after noon.",
    ],
    tips: [
      "Get morning sunlight on their face for 20 minutes, it resets the clock.",
      "Build a wind-down routine: dim lights, warm drink, same time every night.",
      "Talk to the doctor before using over-the-counter sleep aids, many worsen confusion.",
    ],
  },
  {
    slug: "mealtime-difficulty",
    title: "Mealtime difficulty",
    blurb: "Refusing food, forgetting how to eat, or eating too little.",
    tags: ["everyday", "dignity", "safety"],
    whatsHappening:
      "Eating is more complex than it looks: recognizing food, using utensils, chewing, swallowing, and sustaining attention. Any step can falter. Appetite changes, taste shifts, and dental discomfort are also common.",
    whatToSay: [
      "Name the food simply: \"This is your favorite, chicken and rice.\"",
      "Sit with them and eat too, modeling helps.",
      "Offer one item at a time instead of a full plate.",
    ],
    whatToAvoid: [
      "Rushing them or hovering with the next bite.",
      "Patterned plates or busy placemats, they can confuse the eye.",
      "Forcing food when they're clearly not interested.",
    ],
    tips: [
      "Use contrasting plate colors so food stands out.",
      "Finger foods preserve independence when utensils get hard.",
      "If swallowing seems unsafe (coughing, choking), ask for a speech-therapy swallow evaluation.",
    ],
  },
];

export const getSituation = (slug: string) =>
  situations.find((s) => s.slug === slug);

export const allSituationTags = Array.from(
  new Set(situations.flatMap((s) => s.tags)),
).sort();
