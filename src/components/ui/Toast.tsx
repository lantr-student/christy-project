"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export default function Toast({ message, onDismiss, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[var(--border-hairline)] bg-[var(--surface-1)] px-5 py-3 shadow-lg"
    >
      <CheckCircle2 size={18} className="shrink-0 text-[var(--status-good)]" />
      <span className="text-sm font-medium text-[var(--text-primary)]">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <X size={16} />
      </button>
    </div>
  );
}
