import { Sun } from "lucide-react";
import type { UvCategory } from "@/lib/mockWeather";

const MAX_UV = 11;

const STATUS_BY_CATEGORY: Record<UvCategory, string> = {
  Low: "var(--status-good)",
  Moderate: "var(--status-warning)",
  High: "var(--status-warning)",
  "Very High": "var(--status-serious)",
  Extreme: "var(--status-critical)",
};

interface UvMeterProps {
  current: number;
  peak: number;
  category: UvCategory;
}

export default function UvMeter({ current, peak, category }: UvMeterProps) {
  const color = STATUS_BY_CATEGORY[category];
  const pct = Math.min(100, (peak / MAX_UV) * 100);

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">UV Index</h3>
        <Sun size={16} className="text-[var(--text-muted)]" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-[var(--text-primary)]">{peak}</span>
        <span className="text-xs text-[var(--text-muted)]">peak · now {current}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--gridline)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {category}
      </div>
    </div>
  );
}
