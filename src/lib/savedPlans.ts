import type { PlanState } from "./planParser";
import type { EnvironmentalData } from "./mockWeather";

export interface SavedPlan {
  id: string;
  plan: PlanState;
  env: EnvironmentalData;
  savedAt: number;
}

const STORAGE_KEY = "airaware:savedPlans";
const MAX_SAVED = 10;

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedSnapshot: SavedPlan[] = [];
let cachedSorted: SavedPlan[] = [];

function readAll(): SavedPlan[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  try {
    cachedSnapshot = raw ? (JSON.parse(raw) as SavedPlan[]) : [];
  } catch {
    cachedSnapshot = [];
  }
  cachedSorted = cachedSnapshot.slice().sort((a, b) => b.savedAt - a.savedAt);
  return cachedSnapshot;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeSavedPlans(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getSavedPlansSnapshot(): SavedPlan[] {
  readAll();
  return cachedSorted;
}

const EMPTY_SNAPSHOT: SavedPlan[] = [];

export function getSavedPlansServerSnapshot(): SavedPlan[] {
  return EMPTY_SNAPSHOT;
}

export function savePlan(plan: PlanState, env: EnvironmentalData): SavedPlan {
  const entry: SavedPlan = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    plan,
    env,
    savedAt: Date.now(),
  };
  const all = [entry, ...readAll()].slice(0, MAX_SAVED);
  if (typeof window !== "undefined") {
    const raw = JSON.stringify(all);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedSnapshot = all;
    cachedSorted = all.slice().sort((a, b) => b.savedAt - a.savedAt);
  }
  notify();
  return entry;
}
