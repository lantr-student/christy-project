import { CloudSun } from "lucide-react";

interface MessageBubbleProps {
  role: "assistant" | "user";
  children: React.ReactNode;
}

export default function MessageBubble({ role, children }: MessageBubbleProps) {
  const isAssistant = role === "assistant";
  return (
    <div className={`flex items-start gap-2.5 ${isAssistant ? "" : "flex-row-reverse"}`}>
      {isAssistant && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--series-1)] text-white">
          <CloudSun size={16} />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isAssistant
            ? "rounded-tl-sm bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border-hairline)]"
            : "rounded-tr-sm bg-[var(--series-1)] text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
