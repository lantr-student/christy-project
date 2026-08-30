"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import ChatWindow from "@/components/chat/ChatWindow";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import QuickReplyChips from "@/components/chat/QuickReplyChips";
import Button from "@/components/ui/Button";
import { greetingMessage } from "@/lib/responseTemplates";

const BACKEND_URL = "https://christy-project-production.up.railway.app/message";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

let idCounter = 0;
function uid() {
  idCounter += 1;
  return `m${idCounter}-${Date.now()}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uid(), role: "assistant", text: greetingMessage() },
  ]);
  const [showChips, setShowChips] = useState(true);
  const [pending, setPending] = useState(false);

  async function handleSend(rawText: string) {
    setShowChips(false);
    setMessages((m) => [...m, { id: uid(), role: "user", text: rawText }]);
    setPending(true);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: rawText }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: { reply: string } = await res.json();
      setMessages((m) => [...m, { id: uid(), role: "assistant", text: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          text: "Sorry, I couldn't reach AirAware right now. Please try again.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function handleNewConversation() {
    setMessages([{ id: uid(), role: "assistant", text: greetingMessage() }]);
    setShowChips(true);
  }

  return (
    <div className="flex flex-1">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-end border-b border-[var(--border-hairline)] px-4 py-2 sm:px-6">
          <Button variant="ghost" onClick={handleNewConversation}>
            <RotateCcw size={14} />
            New conversation
          </Button>
        </div>
        <ChatWindow scrollKey={messages.length + (pending ? 1 : 0)}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role}>
              {msg.text}
            </MessageBubble>
          ))}
          {pending && (
            <MessageBubble role="assistant">
              <span className="text-[var(--text-muted)]">AirAware is thinking…</span>
            </MessageBubble>
          )}
          {showChips && <QuickReplyChips onSelect={handleSend} />}
        </ChatWindow>
        <ChatInput onSend={handleSend} disabled={pending} />
      </div>
    </div>
  );
}
