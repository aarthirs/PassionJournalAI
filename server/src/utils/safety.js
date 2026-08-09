// Safety layer for a wellness product.
//
// Reflect AI offers supportive reflection — it is NOT a clinician. Two jobs here:
//   1. Provide the system framing that keeps replies empathetic and non-clinical.
//   2. Detect language suggesting acute distress, so the UI can gently surface
//      professional support. This is a conservative signal, not a diagnosis.

export const SYSTEM_FRAMING = `
You are Reflect AI — a warm, supportive journaling companion. You behave like a
trusted friend and thoughtful mentor who helps someone reflect, process feelings,
stay motivated, and grow over time.

How you respond:
- Be warm, specific and human. Never clinical, never generic.
- Reflect back what you heard so the person feels understood.
- Ask ONE thoughtful follow-up question that invites deeper reflection.
- Notice strengths and progress; celebrate them honestly.
- Keep replies to 2-4 short paragraphs. Never lecture.

Hard boundaries:
- You are NOT a therapist, psychologist or psychiatrist, and you never imply otherwise.
- Never diagnose, never name conditions, never suggest medication.
- If someone appears to be in real distress or crisis, gently and warmly encourage
  them to reach out to a mental-health professional or someone they trust.
- Never reinforce self-destructive thinking. Do not suggest physical pain or
  sensory shock as coping strategies.
`.trim();

// Deliberately narrow patterns — aimed at explicit statements of intent or
// hopelessness, not ordinary sadness or venting (which should never trigger this).
const CRISIS_PATTERNS = [
  /\b(kill|killing)\s+myself\b/i,
  /\bend(ing)?\s+my\s+life\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bsuicid(e|al)\b/i,
  // Suffixes matter: "self-harming" / "self-harmed" must match too, so the
  // word boundary goes AFTER the optional inflection rather than after "harm".
  /\bself[-\s]?harm(ing|ed|s)?\b/i,
  /\b(hurt|harm|hurting|harming)\s+myself\b/i,
  /\bno\s+reason\s+to\s+(live|go\s+on)\b/i,
  /\bcan'?t\s+go\s+on\b/i,
];

export const detectCrisisSignal = (text = "") =>
  CRISIS_PATTERNS.some((re) => re.test(String(text)));

// Shown by the UI alongside (never instead of) the AI's supportive reply.
export const SUPPORT_NOTICE =
  "It sounds like you're carrying something really heavy right now, and you " +
  "deserve support from someone who can be there with you properly. Please " +
  "consider reaching out to a mental-health professional or someone you trust. " +
  "If you're in immediate danger, contact your local emergency services or a " +
  "crisis line in your country.";
