import Link from "next/link";
import { BarChart3, Bookmark, Thermometer, CloudRain, Sun, Wind, Sunrise } from "lucide-react";
import type { PlanState } from "@/lib/planParser";
import { planSummaryLine, type Recommendation, type RecommendationPointKey } from "@/lib/responseTemplates";
import Button from "@/components/ui/Button";

const ICONS: Record<RecommendationPointKey, typeof Thermometer> = {
  temperature: Thermometer,
  rain: CloudRain,
  uv: Sun,
  airQuality: Wind,
  daylight: Sunrise,
};

interface RecommendationCardProps {
  plan: PlanState;
  recommendation: Recommendation;
  dashboardHref: string;
  onSavePlan: () => void;
  saved: boolean;
}

export default function RecommendationCard({ plan, recommendation, dashboardHref, onSavePlan, saved }: RecommendationCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <p>{recommendation.intro}</p>

      <ul className="flex flex-col gap-2">
        {recommendation.points.map((point) => {
          const Icon = ICONS[point.key];
          return (
            <li key={point.key} className="flex items-start gap-2.5 rounded-lg bg-[var(--surface-page)] px-3 py-2">
              <Icon size={15} className="mt-0.5 shrink-0 text-[var(--series-1)]" />
              <div>
                <div className="text-xs font-medium text-[var(--text-muted)]">{point.label}</div>
                <div>{point.detail}</div>
              </div>
            </li>
          );
        })}
      </ul>

      <p>{recommendation.closing}</p>

      <div className="rounded-lg bg-[var(--surface-page)] px-3 py-2 text-xs text-[var(--text-secondary)]">
        {planSummaryLine(plan)}
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="primary" onClick={onSavePlan} disabled={saved}>
          <Bookmark size={14} />
          {saved ? "Plan saved" : "Save Plan"}
        </Button>
        <Link href={dashboardHref}>
          <Button variant="secondary">
            <BarChart3 size={14} />
            View environmental data
          </Button>
        </Link>
      </div>
    </div>
  );
}
