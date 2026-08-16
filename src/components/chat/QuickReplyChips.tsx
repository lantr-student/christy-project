const EXAMPLES = [
  "Hiking near Boulder this Saturday afternoon for 3 hours",
  "Road cycling in Austin tomorrow morning for 90 minutes",
  "A picnic near Golden Gate Park next week in the evening for 2 hours",
];

interface QuickReplyChipsProps {
  onSelect: (text: string) => void;
}

export default function QuickReplyChips({ onSelect }: QuickReplyChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 pl-9">
      {EXAMPLES.map((example) => (
        <button
          key={example}
          onClick={() => onSelect(example)}
          className="cursor-pointer rounded-full border border-[var(--border-hairline)] bg-[var(--surface-1)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--series-1)] hover:text-[var(--text-primary)]"
        >
          {example}
        </button>
      ))}
    </div>
  );
}
