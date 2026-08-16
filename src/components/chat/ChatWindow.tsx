"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ChatWindowProps {
  children: ReactNode;
  scrollKey: unknown;
}

export default function ChatWindow({ children, scrollKey }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [scrollKey]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
        {children}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
