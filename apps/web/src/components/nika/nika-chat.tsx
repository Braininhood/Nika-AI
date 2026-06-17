"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { saveGeneratedAssessment } from "@/lib/assessment/generated-store";
import { buildNikaContext } from "@/lib/nika/context";
import {
  loadNikaChatHistory,
  saveNikaChatMessages,
  welcomeMessage,
  type NikaChatMessage,
} from "@/lib/nika/chat-history";
import { fetchNikaQuota, fetchNikaStudyPlan, sendNikaMessage } from "@/lib/nika/chat";
import { REFUSAL_HINT, classifyQuestion } from "@/lib/nika/topic-guard";
import type { UserProfile } from "@/lib/domain/types";
import { saveVocabularyEntry } from "@/lib/vocabulary/service";
import { NikaMessageText } from "./nika-message-text";
import { NikaChatLink } from "./nika-chat-link";
import { NikaSourceList } from "./nika-source-list";

interface NikaChatProps {
  profile: UserProfile | null;
  accessToken?: string;
  /** `page` = full /nika route; `panel` = floating companion sheet. */
  variant?: "page" | "panel";
  /** Close companion + navigate (required for reliable links from the portal). */
  onNavigate?: (href: string) => void;
}

/** Chat body — panel 14px (2px below typical 16px body); full page stays sm. */
const CHAT_TEXT_PANEL = "text-[14px] leading-[1.45]";
const CHAT_TEXT_PAGE = "text-sm leading-relaxed";

export function NikaChat({ profile, accessToken, variant = "page", onNavigate }: NikaChatProps) {
  const textSize = variant === "panel" ? CHAT_TEXT_PANEL : CHAT_TEXT_PAGE;
  const userId = profile?.id;
  const [messages, setMessages] = useState<NikaChatMessage[]>([welcomeMessage()]);
  const [historyReady, setHistoryReady] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [planPreview, setPlanPreview] = useState<
    { title: string; route: string; durationMinutes: number }[] | null
  >(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const ctx = buildNikaContext(profile);

  useEffect(() => {
    if (!userId) {
      setMessages([welcomeMessage()]);
      setHistoryReady(true);
      return;
    }
    let cancelled = false;
    void loadNikaChatHistory(userId).then((stored) => {
      if (cancelled) return;
      setMessages(stored.length > 0 ? stored : [welcomeMessage()]);
      setHistoryReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, historyReady]);

  useEffect(() => {
    if (!accessToken || !ctx.skillMap) return;
    void fetchNikaStudyPlan(accessToken, ctx).then((plan) => {
      if (plan?.daily_plan?.items?.length) {
        setPlanPreview(plan.daily_plan.items.slice(0, 4));
      }
    });
  }, [accessToken, ctx.skillMap, ctx.profession, ctx.country]);

  useEffect(() => {
    if (!accessToken) return;
    void fetchNikaQuota(accessToken).then((q) => {
      if (q) setQuota({ used: q.used, limit: q.limit });
    });
  }, [accessToken, messages]);

  const persistExchange = useCallback(
    async (userMsg: NikaChatMessage, nikaMsg: NikaChatMessage) => {
      if (!userId) return;
      await saveNikaChatMessages(userId, [userMsg, nikaMsg]);
    },
    [userId],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const guard = classifyQuestion(trimmed);
      if (guard.verdict === "refused" && guard.reason === "out_of_scope") {
        setHint(REFUSAL_HINT);
      } else {
        setHint(null);
      }

      const now = Date.now();
      const userMsg: NikaChatMessage = {
        id: `u-${now}`,
        role: "user",
        text: trimmed,
        createdAt: now,
      };
      setMessages((m) => [...m.filter((x) => x.id !== "welcome"), userMsg]);
      setInput("");
      setSending(true);

      try {
        const res = await sendNikaMessage({
          message: trimmed,
          accessToken,
          context: ctx,
        });
        if (res.assessment) {
          await saveGeneratedAssessment({
            id: res.assessment.id,
            title: res.assessment.title,
            skill: res.assessment.skill,
            questions: res.assessment.questions,
          });
        }
        if (res.vocabulary) {
          await saveVocabularyEntry({
            id: res.vocabulary.id,
            word: res.vocabulary.word,
            englishExplanation: res.vocabulary.englishExplanation,
            nativeTranslation: res.vocabulary.nativeTranslation ?? undefined,
            nativeLanguage: res.vocabulary.nativeLanguage,
            source: "nika",
            tags: ["oet", "chat"],
          });
        }
        const nikaMsg: NikaChatMessage = {
          id: `n-${Date.now()}`,
          role: "nika",
          text: res.reply,
          refused: res.refused,
          sources: res.sources,
          tasks: res.tasks,
          provider: res.provider,
          createdAt: Date.now(),
        };
        setMessages((m) => [...m, nikaMsg]);
        void persistExchange(userMsg, nikaMsg);
        if (res.quota) setQuota({ used: res.quota.used, limit: res.quota.limit });
      } finally {
        setSending(false);
      }
    },
    [accessToken, ctx, sending, persistExchange],
  );

  return (
    <div
      className={
        variant === "panel"
          ? "flex min-h-0 flex-1 flex-col"
          : "flex h-[calc(100dvh-8rem)] flex-col"
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
        {ctx.professionLabel && (
          <span className="rounded-full bg-surface-muted px-2 py-0.5">
            {ctx.professionLabel}
          </span>
        )}
        {ctx.regulatorLabel && (
          <span className="rounded-full bg-surface-muted px-2 py-0.5">
            {ctx.regulatorLabel}
          </span>
        )}
        {ctx.targetGradesSummary && (
          <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-brand-primary">
            Target {ctx.targetGradesSummary}
          </span>
        )}
        {quota && (
          <span className="ml-auto">
            AI today: {quota.used}/{quota.limit}
          </span>
        )}
      </div>

      {planPreview && planPreview.length > 0 && (
        <section className="mb-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase text-brand-primary">Today&apos;s plan</p>
            <NikaChatLink
              href="/dashboard"
              onNavigate={onNavigate}
              className="text-[10px] font-medium text-brand-primary hover:underline"
            >
              Home →
            </NikaChatLink>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-ink-soft">
            {planPreview.map((item) => (
              <li key={item.route}>
                <NikaChatLink
                  href={item.route}
                  onNavigate={onNavigate}
                  className="text-ink hover:text-brand-primary hover:underline"
                >
                  {item.title}
                </NikaChatLink>
                <span className="text-ink-soft/70"> · {item.durationMinutes} min</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-surface-muted/50 p-4">
        {historyReady &&
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 ${textSize} ${
                  msg.role === "user"
                    ? "bg-brand-primary text-white"
                    : msg.refused
                      ? "border border-amber-500/30 bg-amber-500/5 text-ink"
                      : "border border-border bg-surface text-ink"
                }`}
              >
                <p className="whitespace-pre-wrap">
                  <NikaMessageText
                    text={msg.text}
                    variant={msg.role === "user" ? "user" : "nika"}
                    onInternalNavigate={onNavigate}
                  />
                </p>
                {msg.tasks && msg.tasks.length > 0 && (
                  <ul className="mt-3 space-y-2 border-t border-border/50 pt-2">
                    {msg.tasks.map((t) => (
                      <li key={`${msg.id}-${t.route}-${t.title}`}>
                        <NikaChatLink
                          href={t.route}
                          onNavigate={onNavigate}
                          className={`font-medium text-brand-primary hover:underline ${textSize}`}
                        >
                          {t.title}
                        </NikaChatLink>
                        <span className="text-xs text-ink-soft"> · {t.durationMinutes} min</span>
                      </li>
                    ))}
                  </ul>
                )}
                {msg.sources && msg.sources.length > 0 && !msg.tasks?.length && (
                  <NikaSourceList sources={msg.sources} />
                )}
              </div>
            </div>
          ))}
        {sending && (
          <p className={`${textSize} text-ink-soft`} aria-live="polite">
            Nika is thinking…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 space-y-3">
        {hint && <p className="text-xs text-amber-700">{hint}</p>}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about OET, your regulator, or study plan…"
            className={`flex-1 rounded-xl border border-border bg-surface px-4 py-3 ${textSize} text-ink placeholder:text-ink-soft focus:border-brand-primary focus:outline-none`}
            maxLength={2000}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className={`rounded-xl bg-brand-primary px-4 py-3 ${textSize} font-semibold text-white disabled:opacity-50`}
          >
            Send
          </button>
        </form>
        <p className="text-[10px] text-ink-soft">
          AI study coach for OET preparation — not medical advice. Chat saved 7 days on this device.{" "}
          <Link href="/materials" className="text-brand-primary hover:underline">
            Study materials →
          </Link>
        </p>
      </div>
    </div>
  );
}
