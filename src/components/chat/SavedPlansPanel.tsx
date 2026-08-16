"use client";

import { useState, useSyncExternalStore } from "react";
import { Bookmark, ChevronDown, Thermometer, CloudRain, Sun, Wind } from "lucide-react";
import { getSavedPlansSnapshot, getSavedPlansServerSnapshot, subscribeSavedPlans, type SavedPlan } from "@/lib/savedPlans";
import { buildRecommendation } from "@/lib/responseTemplates";
import type { HourlyPoint } from "@/lib/mockWeather";

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function peakBy(hourly: HourlyPoint[], key: "tempF" | "precipitationChancePct"): HourlyPoint {
  return hourly.reduce((max, h) => (h[key] > max[key] ? h : max), hourly[0]);
}

// UV has no hourly series in the mock data; it tracks the same midday curve
// as temperature, so the temp peak hour is a realistic stand-in for "when."
function dataTrail(env: SavedPlan["env"]) {
  const peakTemp = peakBy(env.hourly, "tempF");
  const peakRain = peakBy(env.hourly, "precipitationChancePct");
  return [
    { icon: Thermometer, label: "Peak temperature", value: `${peakTemp.tempF}°F at ${peakTemp.time}` },
    { icon: CloudRain, label: "Peak rain chance", value: `${peakRain.precipitationChancePct}% at ${peakRain.time}` },
    { icon: Sun, label: "Peak UV", value: `${env.uv.category} (index ${env.uv.peak}) around ${peakTemp.time}` },
    { icon: Wind, label: "Air quality", value: `${env.airQuality.category} (AQI ${env.airQuality.aqi}) — ${env.airQuality.dominantPollutant}` },
  ];
}

function SavedPlanItem({ p }: { p: SavedPlan }) {
  const [open, setOpen] = useState(false);
  const recommendation = buildRecommendation(p.plan, p.env);
  const rainChanceMax = Math.max(...p.env.hourly.map((h) => h.precipitationChancePct));

  return (
    <li className="rounded-lg bg-[var(--surface-page)] text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer flex-col gap-1.5 px-3 py-2 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium text-[var(--text-primary)]">
            {p.plan.location} · {p.plan.activity}
          </div>
          <ChevronDown
            size={13}
            className={`mt-0.5 shrink-0 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
        <div className="text-[var(--text-muted)]">
          {p.plan.date}, {p.plan.timeRange} — saved {timeAgo(p.savedAt)}
        </div>
        <p className="text-[var(--text-secondary)]">{recommendation.closing}</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Thermometer size={12} className="text-[var(--series-1)]" />
            {p.env.tempHighF}° / {p.env.tempLowF}°F
          </span>
          <span className="flex items-center gap-1">
            <CloudRain size={12} className="text-[var(--series-1)]" />
            {rainChanceMax}% rain
          </span>
          <span className="flex items-center gap-1">
            <Sun size={12} className="text-[var(--series-1)]" />
            {p.env.uv.category} UV
          </span>
          <span className="flex items-center gap-1">
            <Wind size={12} className="text-[var(--series-1)]" />
            {p.env.airQuality.category} air
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--border-hairline)] px-3 py-2">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Why this recommendation
          </div>
          <dl className="flex flex-col gap-1.5">
            {dataTrail(p.env).map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2">
                <Icon size={12} className="mt-0.5 shrink-0 text-[var(--series-1)]" />
                <div>
                  <dt className="text-[var(--text-muted)]">{label}</dt>
                  <dd className="text-[var(--text-secondary)]">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      )}
    </li>
  );
}

export default function SavedPlansPanel() {
  const plans = useSyncExternalStore(subscribeSavedPlans, getSavedPlansSnapshot, getSavedPlansServerSnapshot);

  if (plans.length === 0) return null;

  return (
    <aside className="hidden w-64 shrink-0 border-l border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 lg:block">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        <Bookmark size={13} />
        Saved plans
      </h2>
      <ul className="flex flex-col gap-2">
        {plans.map((p) => (
          <SavedPlanItem key={p.id} p={p} />
        ))}
      </ul>
    </aside>
  );
}
