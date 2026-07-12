// Keyword categories

const passionKeywords = {
  Programming: [
    "code",
    "coding",
    "react",
    "javascript",
    "cpp",
    "leetcode",
    "project",
    "bug",
    "frontend",
    "backend",
  ],

  Reading: [
    "book",
    "reading",
    "novel",
    "article",
    "documentation",
  ],

  Fitness: [
    "gym",
    "exercise",
    "running",
    "workout",
    "walk",
  ],

  Football: [
    "football",
    "world cup",
    "match",
    "goal",
    "soccer",
  ],
};

const positiveWords = [
  "happy",
  "excited",
  "great",
  "love",
  "fun",
  "enjoy",
];

const stressedWords = [
  "tired",
  "sad",
  "stress",
  "angry",
  "frustrated",
];

export const analyzeByRules = (journalText) => {
  const text = journalText.toLowerCase();

  // Detect Passion
  let detectedPassion = "Personal Growth";

  for (const [passion, keywords] of Object.entries(passionKeywords)) {
    if (keywords.some((word) => text.includes(word))) {
      detectedPassion = passion;
      break;
    }
  }

  // Detect Mood
  let detectedMood = "Neutral";

  if (positiveWords.some((word) => text.includes(word))) {
    detectedMood = "Inspired";
  } else if (stressedWords.some((word) => text.includes(word))) {
    detectedMood = "Reflective";
  }

  // Calculate Score
  let score = 60;

  if (journalText.length > 100) score += 15;

  if (detectedMood === "Inspired") score += 10;

  if (detectedPassion !== "Personal Growth") score += 10;

  score = Math.min(score, 100);

  // Reflection
  const reflection = `You spent meaningful time on ${detectedPassion.toLowerCase()} today. Your journal reflects a ${detectedMood.toLowerCase()} mindset.`;

  // Goal
  const goal = `Spend another 30 minutes improving your ${detectedPassion.toLowerCase()} tomorrow.`;

  return {
    passion: detectedPassion,
    mood: detectedMood,
    score,
    reflection,
    goal,
  };
};
