// Deterministic regex/keyword extraction that stands in for real NLU.
// Never guesses a field it can't find evidence for -- callers fall back
// to asking a clarifying question (or, after enough attempts, a default).

export interface PlanState {
  activity: string | null;
  location: string | null;
  date: string | null;
  duration: string | null;
  timeRange: string | null;
}

export const EMPTY_PLAN: PlanState = {
  activity: null,
  location: null,
  date: null,
  duration: null,
  timeRange: null,
};

export const FIELD_ORDER: (keyof PlanState)[] = ["activity", "location", "date", "duration", "timeRange"];

export const FIELD_LABELS: Record<keyof PlanState, string> = {
  activity: "activity",
  location: "location",
  date: "date",
  duration: "duration",
  timeRange: "time of day",
};

export const FIELD_DEFAULTS: Record<keyof PlanState, string> = {
  activity: "a walk",
  location: "your area",
  date: "this weekend",
  duration: "2 hours",
  timeRange: "afternoon",
};

const ACTIVITY_KEYWORDS: [RegExp, string][] = [
  [/\btrail\s*runn?ing\b/i, "trail running"],
  [/\brunn?ing\b|\bjog(ging)?\b/i, "running"],
  [/\bhik(e|ing)\b/i, "hiking"],
  [/\bcamp(ing|out)?\b/i, "camping"],
  [/\b(cycling|biking|bike ride|road bike)\b/i, "cycling"],
  [/\bclimb(ing)?\b/i, "climbing"],
  [/\bkayak(ing)?\b/i, "kayaking"],
  [/\bfish(ing)?\b/i, "fishing"],
  [/\b(outdoor )?yoga\b/i, "outdoor yoga"],
  [/\bgarden(ing)?\b/i, "gardening"],
  [/\btennis\b/i, "tennis"],
  [/\bgolf(ing)?\b/i, "golf"],
  [/\bdog walk(ing)?\b|\bwalk(ing)? (the|my) dog\b/i, "dog walking"],
  [/\bphoto(graphy)?\s*walk\b/i, "a photography walk"],
  [/\bpicnic(king)?\b/i, "a picnic"],
  [/\bwalk(ing)?\b|\bstroll(ing)?\b/i, "a walk"],
];

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function nextWeekday(from: Date, targetDay: number): Date {
  const result = new Date(from);
  const diff = (targetDay - from.getDay() + 7) % 7 || 7;
  result.setDate(from.getDate() + diff);
  return result;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function extractActivity(text: string): string | null {
  for (const [re, label] of ACTIVITY_KEYWORDS) {
    if (re.test(text)) return label;
  }
  return null;
}

export function extractLocation(text: string): string | null {
  const match = text.match(
    /(?:near|in|at|around)\s+([A-Z][\w'.\s]{1,32}?)(?=\s+(?:this|next|tomorrow|today|for|on)\b|[,.!?]|$)/i
  );
  if (match) return match[1].trim();

  // No preposition to anchor on (e.g. "Sturtevant Falls tomorrow") -- strip out
  // whatever reads as activity/date/duration/time-of-day and see if a place name
  // is left over.
  let remainder = text;
  for (const [re] of ACTIVITY_KEYWORDS) remainder = remainder.replace(re, " ");
  remainder = remainder
    .replace(/\b(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?\b/g, " ")
    .replace(/\b(tomorrow|today|this weekend|next week)\b/gi, " ")
    .replace(new RegExp(`\\b(this\\s+)?(${WEEKDAYS.join("|")})\\b`, "gi"), " ")
    .replace(/\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*(?:-|to|until|–)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, " ")
    .replace(/\b(morning|afternoon|evening|night|early)\b/gi, " ")
    .replace(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|h\b|minutes?|mins?)/gi, " ")
    .replace(/[,.!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (remainder.length >= 2) return remainder;
  return null;
}

export function extractDate(text: string, now: Date = new Date()): string | null {
  const lower = text.toLowerCase();
  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(now);
    d.setDate(now.getDate() + 1);
    return formatDate(d);
  }
  if (/\btoday\b/.test(lower)) return formatDate(now);
  if (/\bthis weekend\b/.test(lower)) return "this Saturday";
  if (/\bnext week\b/.test(lower)) {
    const d = new Date(now);
    d.setDate(now.getDate() + 7);
    return formatDate(d);
  }
  for (let i = 0; i < WEEKDAYS.length; i++) {
    const re = new RegExp(`\\b(this\\s+)?${WEEKDAYS[i]}\\b`, "i");
    if (re.test(lower)) return formatDate(nextWeekday(now, i));
  }
  const explicit = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?\b/);
  if (explicit) return `${explicit[1]}/${explicit[2]}`;
  return null;
}

export function extractDuration(text: string): string | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|h\b|minutes?|mins?)/i);
  if (!match) return null;
  const value = match[1];
  const unit = match[2].toLowerCase();
  const isHour = unit.startsWith("h");
  return `${value} ${isHour ? (parseFloat(value) === 1 ? "hour" : "hours") : parseFloat(value) === 1 ? "minute" : "minutes"}`;
}

export function extractTimeRange(text: string): string | null {
  const lower = text.toLowerCase();
  const explicit = text.match(
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*(?:-|to|until|–)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
  );
  if (explicit) return `${explicit[1]}–${explicit[2]}`;
  if (/\bmorning\b/.test(lower)) return "morning";
  if (/\bafternoon\b/.test(lower)) return "afternoon";
  if (/\bevening\b/.test(lower)) return "evening";
  if (/\bnight\b/.test(lower)) return "night";
  if (/\bearly\b/.test(lower)) return "early morning";
  return null;
}

export function extractAllFields(text: string, now: Date = new Date()): Partial<PlanState> {
  return {
    activity: extractActivity(text),
    location: extractLocation(text),
    date: extractDate(text, now),
    duration: extractDuration(text),
    timeRange: extractTimeRange(text),
  };
}

export function mergePlanFields(prev: PlanState, extracted: Partial<PlanState>): PlanState {
  const next = { ...prev };
  for (const key of FIELD_ORDER) {
    if (extracted[key] != null) next[key] = extracted[key] as string;
  }
  return next;
}

export function getNextMissingField(plan: PlanState): keyof PlanState | null {
  for (const key of FIELD_ORDER) {
    if (!plan[key]) return key;
  }
  return null;
}

export function isPlanComplete(plan: PlanState): boolean {
  return getNextMissingField(plan) === null;
}

export function planSeed(plan: PlanState): string {
  return `${plan.activity}|${plan.location}|${plan.date}|${plan.timeRange}`;
}
