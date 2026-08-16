"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import ChatWindow from "@/components/chat/ChatWindow";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import QuickReplyChips from "@/components/chat/QuickReplyChips";
import RecommendationCard from "@/components/chat/RecommendationCard";
import SavedPlansPanel from "@/components/chat/SavedPlansPanel";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import {
  EMPTY_PLAN,
  FIELD_DEFAULTS,
  extractAllFields,
  mergePlanFields,
  getNextMissingField,
  isPlanComplete,
  planSeed,
  type PlanState,
} from "@/lib/planParser";
import {
  greetingMessage,
  clarifyingQuestion,
  assumedDefaultNotice,
  buildRecommendation,
  type Recommendation,
} from "@/lib/responseTemplates";
import { generateMockEnvironmentalData, type EnvironmentalData } from "@/lib/mockWeather";
import { savePlan } from "@/lib/savedPlans";

type ChatMessage =
  | { id: string; role: "assistant"; kind: "text"; text: string }
  | { id: string; role: "assistant"; kind: "recommendation"; plan: PlanState; env: EnvironmentalData; recommendation: Recommendation }
  | { id: string; role: "user"; text: string };

let idCounter = 0;
function uid() {
  idCounter += 1;
  return `m${idCounter}-${Date.now()}`;
}

const MAX_ATTEMPTS_PER_FIELD = 2;

function dashboardHref(plan: PlanState): string {
  const params = new URLSearchParams({
    activity: plan.activity ?? "",
    location: plan.location ?? "",
    date: plan.date ?? "",
    duration: plan.duration ?? "",
    timeRange: plan.timeRange ?? "",
  });
  return `/dashboard?${params.toString()}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uid(), role: "assistant", kind: "text", text: greetingMessage() },
  ]);
  const [planState, setPlanState] = useState<PlanState>(EMPTY_PLAN);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [showChips, setShowChips] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());

  function pushAssistantText(text: string) {
    setMessages((m) => [...m, { id: uid(), role: "assistant", kind: "text", text }]);
  }

  function pushRecommendation(plan: PlanState, env: EnvironmentalData) {
    const recommendation = buildRecommendation(plan, env);
    setMessages((m) => [...m, { id: uid(), role: "assistant", kind: "recommendation", plan, env, recommendation }]);
  }

  function handleSend(rawText: string) {
    setShowChips(false);
    setMessages((m) => [...m, { id: uid(), role: "user", text: rawText }]);

    const startingNewRound = isPlanComplete(planState);
    const basePlan = startingNewRound ? EMPTY_PLAN : planState;
    const baseAttempts = startingNewRound ? {} : attempts;

    const extracted = extractAllFields(rawText);
    let merged = mergePlanFields(basePlan, extracted);
    const nextAttempts = { ...baseAttempts };

    const notices: string[] = [];
    let missing = getNextMissingField(merged);
    while (missing && (nextAttempts[missing] ?? 0) >= MAX_ATTEMPTS_PER_FIELD) {
      const value = FIELD_DEFAULTS[missing];
      merged = { ...merged, [missing]: value };
      notices.push(assumedDefaultNotice(missing, value));
      missing = getNextMissingField(merged);
    }

    setPlanState(merged);
    notices.forEach(pushAssistantText);

    if (missing) {
      nextAttempts[missing] = (nextAttempts[missing] ?? 0) + 1;
      setAttempts(nextAttempts);
      pushAssistantText(clarifyingQuestion(missing, merged));
      return;
    }

    setAttempts(nextAttempts);
    const env = generateMockEnvironmentalData(planSeed(merged));
    pushRecommendation(merged, env);
  }

  function handleSavePlan(messageId: string, plan: PlanState, env: EnvironmentalData) {
    savePlan(plan, env);
    setSavedMessageIds((prev) => new Set(prev).add(messageId));
    setToast("Plan saved!");
  }

  function handleNewPlan() {
    setMessages([{ id: uid(), role: "assistant", kind: "text", text: greetingMessage() }]);
    setPlanState(EMPTY_PLAN);
    setAttempts({});
    setShowChips(true);
  }

  return (
    <div className="flex flex-1">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-end border-b border-[var(--border-hairline)] px-4 py-2 sm:px-6">
          <Button variant="ghost" onClick={handleNewPlan}>
            <RotateCcw size={14} />
            Start a new plan
          </Button>
        </div>
        <ChatWindow scrollKey={messages.length}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role}>
              {msg.role === "assistant" && msg.kind === "recommendation" ? (
                <RecommendationCard
                  plan={msg.plan}
                  recommendation={msg.recommendation}
                  dashboardHref={dashboardHref(msg.plan)}
                  onSavePlan={() => handleSavePlan(msg.id, msg.plan, msg.env)}
                  saved={savedMessageIds.has(msg.id)}
                />
              ) : (
                msg.text
              )}
            </MessageBubble>
          ))}
          {showChips && <QuickReplyChips onSelect={handleSend} />}
        </ChatWindow>
        <ChatInput onSend={handleSend} />
      </div>
      <SavedPlansPanel />
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
