import { Sunrise, Sunset } from "lucide-react";

interface SunriseSunsetCardProps {
  sunrise: string;
  sunset: string;
  daylightHours: number;
}

export default function SunriseSunsetCard({ sunrise, sunset, daylightHours }: SunriseSunsetCardProps) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">Sunrise &amp; Sunset</h3>
        <span className="text-xs text-[var(--text-muted)]">{daylightHours}h daylight</span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-[var(--gridline)] via-[var(--series-1)] to-[var(--gridline)]" />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
          <Sunrise size={16} className="text-[var(--series-1)]" />
          {sunrise}
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
          <Sunset size={16} className="text-[var(--series-1)]" />
          {sunset}
        </div>
      </div>
    </div>
  );
}
