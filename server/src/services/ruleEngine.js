// Deterministic fallback used whenever the AI provider is unavailable.
// Keeping this means the product degrades gracefully instead of breaking.

const passionKeywords = {
  Programming: ["code","coding","react","javascript","cpp","leetcode","project","bug","frontend","backend"],
  Reading: ["book","reading","novel","article","documentation"],
  Fitness: ["gym","exercise","running","workout","walk"],
  Football: ["football","world cup","match","goal","soccer"],
  Career: ["work","job","meeting","boss","promotion","office","team"],
  Learning: ["learn","study","course","practice","tutorial"],
};

const positiveWords = ["happy","excited","great","love","fun","enjoy","proud","grateful","calm"];
const stressedWords = ["tired","sad","stress","angry","frustrated","anxious","overwhelmed","exhausted","lonely"];

const countHits = (text, words) => words.filter((w) => text.includes(w)).length;

export const analyzeByRules = (journalText) => {
  const text = String(journalText).toLowerCase();

  let detectedPassion = "Personal Growth";
  for (const [passion, keywords] of Object.entries(passionKeywords)) {
    if (keywords.some((w) => text.includes(w))) { detectedPassion = passion; break; }
  }

  const pos = countHits(text, positiveWords);
  const neg = countHits(text, stressedWords);

  let mood = "Neutral", emotion = "Reflective";
  if (pos > neg) { mood = "Positive"; emotion = "Content"; }
  else if (neg > pos) { mood = "Low"; emotion = "Contemplative"; }

  let score = 60;
  if (journalText.length > 100) score += 10;
  if (pos > neg) score += 15;
  if (neg > pos) score -= 10;
  score = Math.max(0, Math.min(100, score));

  const len = journalText.length;
  const depth = len > 400 ? "Deep" : len > 150 ? "Medium" : "Light";
  const depthScore = Math.min(100, Math.round((len / 500) * 100));
  const stress = Math.max(0, Math.min(100, 30 + neg * 15 - pos * 5));
  const energy = Math.max(0, Math.min(100, 50 + pos * 12 - neg * 10));

  return {
    passion: detectedPassion,
    mood, emotion, depth, depthScore, stress, energy,
    score,
    reflection: `You wrote about ${detectedPassion.toLowerCase()} today, and your words carry a ${emotion.toLowerCase()} tone.`,
    goal: "Take one small, kind step toward what matters to you tomorrow.",
    quote: "Showing up to reflect is itself a form of progress.",
  };
};

// Conversational fallback so chat still works with no AI available.
export const replyByRules = (userText) => {
  const analysis = analyzeByRules(userText);
  const reply =
    `Thank you for sharing that. I hear a ${analysis.emotion.toLowerCase()} tone in what you wrote, ` +
    `and it sounds like ${analysis.passion.toLowerCase()} is on your mind.\n\n` +
    `What feels most important about this for you right now?`;
  return { reply, analysis };
};
