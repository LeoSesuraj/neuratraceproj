export type VisitSuggestion = {
  title: string;
  description: string;
  link?: {
    to: "/learn/connect/$situation" | "/learn/understand/$topic";
    params: { situation?: string; topic?: string };
  };
};

export const VISIT_SUGGESTIONS: Record<"good" | "mixed" | "hard", VisitSuggestion[]> = {
  good: [
    {
      title: "Look through old photos together",
      description:
        "Familiar faces and places can spark long-term memories and joyful conversation.",
    },
    {
      title: "Play a simple card game",
      description: "Choose something easy with short rounds — Go Fish, matching pairs.",
    },
    {
      title: "Talk about a favorite memory",
      description:
        "Use open prompts like 'Tell me about the day you got married.'",
    },
  ],
  mixed: [
    {
      title: "Listen to favorite music",
      description:
        "Music from your loved one's teens and twenties is often the most evocative.",
    },
    {
      title: "Do a simple craft together",
      description: "Folding, sorting, coloring — gentle hands-on activities.",
    },
    {
      title: "Sit outside together",
      description:
        "Fresh air and a change of scene without any pressure to converse.",
    },
  ],
  hard: [
    {
      title: "Sit quietly together",
      description:
        "Your presence is the gift today — no agenda, no expectations.",
    },
    {
      title: "Hold their hand",
      description:
        "Gentle touch can be calming when words are too much.",
    },
    {
      title: "Play soft background music",
      description:
        "Low, familiar music can soothe without demanding engagement.",
    },
  ],
};
