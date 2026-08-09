/*
 * Settings validation.
 *
 * A strict ALLOW-LIST: every accepted path is declared with its type and legal
 * values. Anything not listed is rejected, so a client cannot patch userId,
 * inject unknown keys, or set a value the schema enum would later reject.
 *
 * Output is flat dot-notation paths, ready for Mongo's $set (see settingsRepo).
 */

const ENUMS = {
  theme: ["light", "dark", "system"],
  language: ["en", "hi", "es", "fr", "de"],
  "ai.tone": ["warm", "direct", "gentle"],
  "ai.replyLength": ["short", "medium", "long"],
};

const BOOLEANS = [
  "ai.followUpQuestions",
  "ai.memoryEnabled",
  "ai.referencePastEntries",
  "notifications.dailyReminder",
  "notifications.weeklySummary",
  "notifications.achievementAlerts",
  "analysis.trackStress",
  "analysis.trackEnergy",
  "analysis.detectPatterns",
  "privacy.allowAnonymousInsights",
  "privacy.storeConversationHistory",
];

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/*
 * Reads "a.b" out of a nested object using OWN properties only.
 *
 * Plain `acc[k]` would walk the prototype chain, so a polluted
 * Object.prototype (or a crafted `__proto__` payload) could make an absent
 * setting appear present. Object.hasOwn confines us to data the client actually
 * sent. The output object is also built from our own literal key constants, so
 * no client-supplied string ever becomes a key.
 */
const getPath = (obj, path) =>
  path.split(".").reduce(
    (acc, k) =>
      acc && typeof acc === "object" && Object.hasOwn(acc, k) ? acc[k] : undefined,
    obj
  );

export const validateSettingsUpdate = (body = {}) => {
  const set = {};

  for (const [path, allowed] of Object.entries(ENUMS)) {
    const v = getPath(body, path);
    if (v === undefined) continue;
    if (typeof v !== "string" || !allowed.includes(v)) {
      return { error: `${path} must be one of: ${allowed.join(", ")}` };
    }
    set[path] = v;
  }

  for (const path of BOOLEANS) {
    const v = getPath(body, path);
    if (v === undefined) continue;
    if (typeof v !== "boolean") return { error: `${path} must be true or false` };
    set[path] = v;
  }

  const time = getPath(body, "notifications.reminderTime");
  if (time !== undefined) {
    if (typeof time !== "string" || !TIME_RE.test(time)) {
      return { error: "notifications.reminderTime must be in HH:mm 24-hour format" };
    }
    set["notifications.reminderTime"] = time;
  }

  if (Object.keys(set).length === 0) return { error: "No valid settings to update." };
  return { set };
};
