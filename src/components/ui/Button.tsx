import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--series-1)] text-white hover:opacity-90 disabled:opacity-50",
  secondary:
    "bg-transparent text-[var(--text-primary)] border border-[var(--border-hairline)] hover:bg-[var(--gridline)]/40",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
};

export default function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
