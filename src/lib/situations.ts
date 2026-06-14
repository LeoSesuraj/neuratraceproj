export type Situation = {
  slug: string;
  title: string;
  blurb: string;
  whatsHappening: string;
  whatToSay: string[];
  whatToAvoid: string[];
  tips: string[];
};

export const situations: Situation[] = [
  {
    slug: "repeating-questions",
    title: "Repeating questions",
    blurb: "When the same question comes again and again.",
    whatsHappening:
      "Short-term memory is no longer reliably storing new information. Each time the question is asked, it genuinely feels like the first time. The emotion driving the question — uncertainty, anxiety, the need for reassurance — is what's repeating, not the question itself.",
    whatToSay: [
      "Answer warmly, as if it's the first time you've heard it.",
      "Keep your reply short and consistent — the same words each time.",
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
      "Notice the underlying feeling — often the question is really \"am I safe?\"",
    ],
  },
  {
    slug: "not-recognizing-family",
    title: "Not recognizing family",
    blurb: "When a loved one looks at you and doesn't know who you are.",
    whatsHappening:
      "The disease can erase recent decades first. They may still recognize you as someone safe and familiar even if they can't place the name or relationship. This is one of the most painful parts of dementia for families — and it isn't personal.",
    whatToSay: [
      "Greet them by name and gently say yours: \"Hi Mom, it's me, Sarah.\"",
      "Speak about shared memories in a warm, calm tone.",
      "Let them lead — if they think you're someone else, you can simply be present.",
    ],
    whatToAvoid: [
      "Quizzing them: \"Do you know who I am?\"",
      "Correcting them sharply or appearing hurt.",
      "Insisting they remember.",
    ],
    tips: [
      "Sit at eye level and approach slowly from the front.",
      "Bring a familiar object — a photo, a song, a scent.",
      "Give yourself space to grieve afterward. This is a real loss.",
    ],
  },
  {
    slug: "asking-for-deceased-relatives",
    title: "Asking for someone who has died",
    blurb: "\"Where's my mother?\" — when the person they're asking for is gone.",
    whatsHappening:
      "They may be living, emotionally, in an earlier decade of their life. Telling them a loved one has died can cause them to grieve the loss freshly — sometimes again and again. They are searching for safety and connection.",
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
  },
  {
    slug: "agitation",
    title: "Agitation",
    blurb: "Restlessness, frustration, or sudden distress.",
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
      "Reduce noise — turn off the TV, dim the lights.",
      "Familiar music or a soft hand on theirs can often reset the moment.",
    ],
  },
  {
    slug: "sundowning",
    title: "Sundowning",
    blurb: "Increased confusion or agitation in late afternoon and evening.",
    whatsHappening:
      "As daylight fades, internal cues become harder to read. Fatigue accumulates, and shadows can become disorienting. This is one of the most common patterns in mid-stage dementia.",
    whatToSay: [
      "Use a calm, even tone — your voice helps regulate theirs.",
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
      "Keep an early-evening routine — same time, same order.",
      "Protect daytime light exposure and a consistent bedtime.",
    ],
  },
  {
    slug: "refusing-care",
    title: "Refusing care",
    blurb: "When bathing, dressing, or medication becomes a battle.",
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
      "Warm the room and the towels — comfort matters.",
      "Tie the task to a pleasant cue: music, a favorite scent.",
    ],
  },
];

export const getSituation = (slug: string) =>
  situations.find((s) => s.slug === slug);
