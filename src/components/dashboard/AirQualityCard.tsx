import { Wind } from "lucide-react";
import type { AqiCategory } from "@/lib/mockWeather";

const MAX_AQI = 200;

const STATUS_BY_CATEGORY: Record<AqiCategory, string> = {
  Good: "var(--status-good)",
  Moderate: "var(--status-warning)",
  "Unhealthy for Sensitive Groups": "var(--status-warning)",
  Unhealthy: "var(--status-serious)",
  "Very Unhealthy": "var(--status-critical)",
};

interface AirQualityCardProps {
  aqi: number;
  category: AqiCategory;
  dominantPollutant: string;
}

export default function AirQualityCard({ aqi, category, dominantPollutant }: AirQualityCardProps) {
  const color = STATUS_BY_CATEGORY[category];
  const pct = Math.min(100, (aqi / MAX_AQI) * 100);

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">Air Quality</h3>
        <Wind size={16} className="text-[var(--text-muted)]" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-[var(--text-primary)]">{aqi}</span>
        <span className="text-xs text-[var(--text-muted)]">AQI</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--gridline)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {category} · dominant: {dominantPollutant}
      </div>
    </div>
  );
}
