import type { PlanState } from "./planParser";
import type { EnvironmentalData } from "./mockWeather";

// All copy here is canned/templated -- there is no real model in the loop.
// Templates just interpolate the parsed plan + generated mock data so the
// chat reply always agrees with whatever the dashboard ends up showing.

export function greetingMessage(): string {
  return "Hi! I'm the AirAware assistant. Tell me what outdoor plan you're thinking about — activity, where, when, and for how long — and I'll check the conditions for you.";
}

const CLARIFYING_QUESTIONS: Record<keyof PlanState, (plan: PlanState) => string> = {
  activity: () => "What are you hoping to do outdoors?",
  location: (plan) => `${plan.activity ? capitalize(plan.activity) : "Sounds fun"} — whereabouts are you thinking?`,
  date: (plan) => `Got it — ${plan.activity} near ${plan.location}. What day are you planning this for?`,
  duration: (plan) => `${capitalize(plan.date ?? "That day")} works. About how long do you want to be out there?`,
  timeRange: () => "And roughly what time of day — morning, afternoon, evening?",
};

export function clarifyingQuestion(field: keyof PlanState, plan: PlanState): string {
  return CLARIFYING_QUESTIONS[field](plan);
}

export function assumedDefaultNotice(field: keyof PlanState, value: string): string {
  const labels: Record<keyof PlanState, string> = {
    activity: "activity",
    location: "location",
    date: "date",
    duration: "duration",
    timeRange: "time of day",
  };
  return `No worries, I'll assume ${labels[field]}: ${value}.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function rainOutlook(chanceMax: number): string {
  if (chanceMax >= 60) return "Good chance of rain — plan for wet conditions or have a backup";
  if (chanceMax >= 30) return "Decent chance of a passing shower — bring a light rain shell";
  if (chanceMax >= 10) return "Small chance of a stray sprinkle, mostly dry";
  return "Should stay dry the whole time";
}

function uvTip(category: string): string {
  switch (category) {
    case "Low":
      return "minimal sun protection needed";
    case "Moderate":
      return "sunscreen is a good idea";
    case "High":
      return "sunscreen, a hat, and shade breaks recommended";
    case "Very High":
      return "sunscreen, sunglasses, and a hat strongly recommended";
    default:
      return "minimize direct midday sun exposure";
  }
}

function aqiTip(category: string): string {
  if (category === "Good") return "no respiratory concerns";
  if (category === "Moderate") return "fine unless you're especially sensitive";
  return "sensitive groups may want to take it easier";
}

export type RecommendationPointKey = "temperature" | "rain" | "uv" | "airQuality" | "daylight";

export interface RecommendationPoint {
  key: RecommendationPointKey;
  label: string;
  detail: string;
}

export interface Recommendation {
  intro: string;
  points: RecommendationPoint[];
  closing: string;
}

export function buildRecommendation(plan: PlanState, env: EnvironmentalData): Recommendation {
  const chanceMax = Math.max(...env.hourly.map((h) => h.precipitationChancePct));
  return {
    intro: `${capitalize(plan.date ?? "That day")} ${plan.timeRange ?? ""} near ${plan.location} is looking like a solid window for ${plan.activity}.`,
    points: [
      {
        key: "temperature",
        label: "Temperature",
        detail: `High ${env.tempHighF}°F, low ${env.tempLowF}°F over your ${plan.duration}`,
      },
      {
        key: "rain",
        label: "Rain",
        detail: rainOutlook(chanceMax),
      },
      {
        key: "uv",
        label: "UV",
        detail: `${env.uv.category} (peak index ${env.uv.peak}) — ${uvTip(env.uv.category)}`,
      },
      {
        key: "airQuality",
        label: "Air quality",
        detail: `${env.airQuality.category} (AQI ${env.airQuality.aqi}) — ${aqiTip(env.airQuality.category)}`,
      },
      {
        key: "daylight",
        label: "Daylight",
        detail: `Sunrise ${env.sun.sunrise}, sunset ${env.sun.sunset}`,
      },
    ],
    closing: "Overall, this looks like a good plan — have fun out there!",
  };
}

export function planSummaryLine(plan: PlanState): string {
  return `${capitalize(plan.activity ?? "Plan")} near ${plan.location}, ${plan.date}, ${plan.timeRange}, for ${plan.duration}`;
}
