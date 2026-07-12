export const createJournalEntry = (
  journalText,
  analysis
) => {
  return {
    id: Date.now(),

    createdAt: new Date().toISOString(),

    journal: journalText,

    analysis: {
      passion: analysis.passion,
      mood: analysis.mood,
      score: analysis.score,
      reflection: analysis.reflection,
      goal: analysis.goal,
    },
  };
};