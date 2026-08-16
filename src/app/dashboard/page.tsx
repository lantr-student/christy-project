"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PlanSummaryBanner from "@/components/dashboard/PlanSummaryBanner";
import PrecipitationChart from "@/components/dashboard/PrecipitationChart";
import TemperatureChart from "@/components/dashboard/TemperatureChart";
import UvMeter from "@/components/dashboard/UvMeter";
import AirQualityCard from "@/components/dashboard/AirQualityCard";
import SunriseSunsetCard from "@/components/dashboard/SunriseSunsetCard";
import { planSeed, type PlanState } from "@/lib/planParser";
import { generateMockEnvironmentalData } from "@/lib/mockWeather";

const SAMPLE_PLAN: PlanState = {
  activity: "hiking",
  location: "Boulder",
  date: "Saturday, August 22",
  duration: "3 hours",
  timeRange: "afternoon",
};

function DashboardContent() {
  const searchParams = useSearchParams();

  const fromParams: PlanState = {
    activity: searchParams.get("activity") || null,
    location: searchParams.get("location") || null,
    date: searchParams.get("date") || null,
    duration: searchParams.get("duration") || null,
    timeRange: searchParams.get("timeRange") || null,
  };
  const hasParams = Object.values(fromParams).some(Boolean);
  const plan = hasParams ? { ...SAMPLE_PLAN, ...fromParams } : SAMPLE_PLAN;

  const env = generateMockEnvironmentalData(planSeed(plan));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6">
      <PlanSummaryBanner plan={plan} isSample={!hasParams} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
          <h2 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">Precipitation (mm)</h2>
          <PrecipitationChart hourly={env.hourly} />
        </div>
        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
          <h2 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">Temperature (°F)</h2>
          <TemperatureChart hourly={env.hourly} />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            High {env.tempHighF}°F · Low {env.tempLowF}°F
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <UvMeter current={env.uv.current} peak={env.uv.peak} category={env.uv.category} />
        <AirQualityCard aqi={env.airQuality.aqi} category={env.airQuality.category} dominantPollutant={env.airQuality.dominantPollutant} />
        <SunriseSunsetCard sunrise={env.sun.sunrise} sunset={env.sun.sunset} daylightHours={env.sun.daylightHours} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
