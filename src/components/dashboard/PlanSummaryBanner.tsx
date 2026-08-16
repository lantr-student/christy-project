import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { PlanState } from "@/lib/planParser";
import Button from "@/components/ui/Button";

interface PlanSummaryBannerProps {
  plan: PlanState;
  isSample: boolean;
}

export default function PlanSummaryBanner({ plan, isSample }: PlanSummaryBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {isSample && (
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Example data — start a plan in chat to see your own
          </div>
        )}
        <h1 className="text-lg font-semibold capitalize text-[var(--text-primary)]">
          {plan.activity} near {plan.location}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {plan.date} · {plan.timeRange} · {plan.duration}
        </p>
      </div>
      <Link href="/">
        <Button variant="secondary">
          <MessageCircle size={14} />
          Back to chat
        </Button>
      </Link>
    </div>
  );
}
