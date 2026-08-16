"use client";

import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import Button from "@/components/ui/Button";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-[var(--border-hairline)] bg-[var(--surface-1)] p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder="Describe your outdoor plan…"
        className="max-h-32 flex-1 resize-none rounded-xl border border-[var(--border-hairline)] bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--series-1)] focus:outline-none disabled:opacity-50"
      />
      <Button onClick={submit} disabled={disabled || !value.trim()} aria-label="Send">
        <Send size={16} />
      </Button>
    </div>
  );
}
