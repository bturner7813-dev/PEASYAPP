// Shared between the API route and (for reference) anyone extending the prompt later.

export const PEDAGOGY_INSTRUCTIONS = [
  "You are the session-planning engine behind PEasy, a tool that helps UK primary school teachers deliver confident, games-based PE.",
  "Core principle: the session must be GAMES-BASED, not drill-based — children should have to read the game and make decisions, not just repeat a technique in isolation. This matters most for upper KS2 (Year 5/6), where sessions default to drills far too often.",
  "Always include: a short warm-up that primes the main game's movement pattern; THREE distinct main games with clear rules (genuinely different games, not the same game renamed — vary the mechanic, not just the theme) so the teacher has real choice or can chain them across a session; for EACH main game, one add-on — a twist or extra rule to introduce once the class has grasped the base game, to keep it evolving rather than repeating; an easier and a harder overall progression/variant for differentiation across ability; exactly three open-ended coaching questions a non-specialist teacher can ask mid-game to make children think (not yes/no questions); a kit list; and any safety notes relevant to the space and group size given.",
  "Write for a teacher who may not be a PE specialist and has only a couple of minutes to read this before teaching it. Be concrete and specific, never vague ('play a fun game') — name real rules.",
  "Reply with ONLY a single JSON object, no other text, matching exactly this shape:",
  '{"title": string, "warmup": {"title": string, "description": string}, "main_games": [{"title": string, "description": string, "add_on": string}, {"title": string, "description": string, "add_on": string}, {"title": string, "description": string, "add_on": string}], "progression": {"easier": string, "harder": string}, "open_questions": [string, string, string], "kit": [string], "safety": [string]}',
].join("\n");

export function buildScenario({ sport, objective, year, students, space, duration, weather, kit }) {
  return [
    `Sport/theme: ${sport || "PE"}`,
    objective ? `Objective: ${objective}` : null,
    `Year group: ${year || "Year 5"}`,
    `Group size: ${students || "?"} students`,
    `Space: ${space || "Sports hall"}`,
    `Session length: ${duration || "30"} minutes`,
    `Weather/setting: ${weather || "Dry, can go outdoors"}`,
    `Equipment note: ${kit || "No specialist kit"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildPrompt(fields) {
  return `${PEDAGOGY_INSTRUCTIONS}\n\nSCENARIO:\n${buildScenario(fields)}`;
}

// Tolerant JSON extraction — mirrors how the Claude artifact sample.json() reads a reply:
// the whole text as JSON; else a markdown code fence; else the first {.../[..] block.
export function extractJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {
    /* fall through */
  }
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch (_) {
      /* fall through */
    }
  }
  const start = text.search(/[[{]/);
  const endBrace = text.lastIndexOf("}");
  const endBracket = text.lastIndexOf("]");
  const end = Math.max(endBrace, endBracket);
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (_) {
      /* give up */
    }
  }
  return null;
}
