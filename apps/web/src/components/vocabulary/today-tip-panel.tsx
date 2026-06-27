"use client";

import { useCallback, useState } from "react";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { SecondaryActionButton } from "@/components/ui/secondary-action-button";
import { speakTranscript, stopSpeaking } from "@/lib/media/browser-tts";
import { useAuth } from "@/lib/auth/auth-provider";
import { explainWord, translateWord } from "@/lib/vocabulary/api";
import { saveVocabularyEntry, findVocabularyByWord } from "@/lib/vocabulary/service";
import type { TodayTip } from "@/lib/vocabulary/today-tip-types";

interface TodayTipPanelProps {
  tip: TodayTip;
}

function PhraseBlock({
  label,
  lines,
}: {
  label: string;
  lines: string[];
}) {
  if (!lines.length) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">{label}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-ink">
        {lines.map((line) => (
          <li key={line} className="break-words rounded-lg bg-surface-muted/40 px-3 py-2">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TodayTipPanel({ tip }: TodayTipPanelProps) {
  const { session } = useAuth();
  const [adding, setAdding] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);

  const pronounce = (text: string) => {
    stopSpeaking();
    void speakTranscript(text, { rate: 0.88, voiceProfile: "nika" });
  };

  const addToVocabulary = useCallback(
    async (phrase: string, meaning: string, example: string) => {
      const key = phrase.toLowerCase();
      if (saved.has(key)) return;
      setAdding(key);
      setMessage(null);
      try {
        const existing = await findVocabularyByWord(phrase);
        if (existing) {
          setSaved((prev) => new Set(prev).add(key));
          setMessage(`"${phrase}" is already in your list.`);
          return;
        }
        let explanation = meaning;
        if (session?.access_token) {
          const explained = await explainWord(
            phrase,
            session.access_token,
            example,
            tip.profession,
          );
          explanation = explained.explanation;
        }
        await saveVocabularyEntry({
          word: phrase,
          context: example,
          englishExplanation: explanation,
          nativeLanguage: "EN",
          phoneticHint: phrase === tip.term ? tip.phonetic : undefined,
          tags: ["vocab:today-tip", `profession:${tip.profession}`],
          source: "today_tip",
        });
        setSaved((prev) => new Set(prev).add(key));
        setMessage(`Added "${phrase}" to your vocabulary.`);
      } catch {
        setMessage("Could not save — try again.");
      } finally {
        setAdding(null);
      }
    },
    [saved, session?.access_token, tip.phonetic, tip.profession, tip.term],
  );

  const speaking = tip.speaking;

  return (
    <div className="flex flex-col gap-5 pb-8">
      <CollapsibleSection
        title={tip.headline}
        subtitle={tip.term}
        defaultOpen
        variant="accent"
        badge="Today"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-ink">{tip.term}</p>
              {tip.phonetic ? (
                <p className="mt-1 font-mono text-sm text-brand-primary">{tip.phonetic}</p>
              ) : null}
              <p className="mt-2 text-sm text-ink-soft">{tip.definition}</p>
            </div>
            <button
              type="button"
              onClick={() => pronounce(tip.term)}
              className="inline-flex min-h-10 shrink-0 items-center rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-brand-primary"
              aria-label={`Hear ${tip.term} with Nika voice`}
            >
              🔊 Nika
            </button>
          </div>

          <p className="rounded-xl bg-surface-muted/50 px-3 py-2 text-sm italic text-ink">
            {tip.example}
          </p>

          <SecondaryActionButton
            disabled={adding === tip.term.toLowerCase() || saved.has(tip.term.toLowerCase())}
            onClick={() => void addToVocabulary(tip.term, tip.definition, tip.example)}
          >
            {saved.has(tip.term.toLowerCase()) ? "In your vocabulary ✓" : "Add to vocabulary"}
          </SecondaryActionButton>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Speaking — OET phrases"
        subtitle="Opening, questions, empathy, explanation, advice"
        defaultOpen={false}
      >
        <div className="space-y-4">
          <PhraseBlock label="Opening" lines={speaking.opening ?? []} />
          <PhraseBlock label="Clinical questions" lines={speaking.clinical_questions ?? []} />
          <PhraseBlock label="Empathy" lines={speaking.empathy ?? []} />
          <PhraseBlock label="Explanation" lines={speaking.explanation ?? []} />
          <PhraseBlock label="Advice" lines={speaking.advice ?? []} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Writing — OET style"
        subtitle="Clinical documentation phrases"
        defaultOpen={false}
      >
        <ul className="space-y-2 text-sm text-ink">
          {tip.writing_clinical.map((line) => (
            <li key={line} className="break-words rounded-lg bg-surface-muted/40 px-3 py-2">
              {line}
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection
        title="Key phrases for writing"
        subtitle="High-scoring letter language"
        defaultOpen={false}
      >
        <ul className="space-y-2 text-sm text-ink">
          {tip.writing_key_phrases.map((line) => (
            <li key={line} className="break-words rounded-lg bg-surface-muted/40 px-3 py-2">
              {line}
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection
        title="Exam tip"
        subtitle="Phrases that earn marks"
        defaultOpen={false}
        badge="OET"
      >
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-forest">Use</p>
            <p className="mt-1 text-ink-soft">{tip.exam_tip_use.join(" · ")}</p>
          </div>
          {tip.exam_tip_avoid.length > 0 ? (
            <div>
              <p className="font-semibold text-danger">Avoid</p>
              <ul className="mt-1 space-y-1 text-ink-soft">
                {tip.exam_tip_avoid.map((line) => (
                  <li key={line}>“{line}”</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Grade A phrase"
        subtitle="Model sentence for writing or speaking"
        defaultOpen={false}
        badge="Grade A"
      >
        <p className="rounded-xl border border-forest/30 bg-forest/5 px-3 py-3 text-sm leading-relaxed text-ink">
          {tip.grade_a_phrase}
        </p>
      </CollapsibleSection>

      {tip.vocabulary_phrases.length > 0 ? (
        <CollapsibleSection
          title="More vocabulary from today"
          subtitle={`${tip.vocabulary_phrases.length} phrase${tip.vocabulary_phrases.length === 1 ? "" : "s"}`}
          defaultOpen={false}
        >
          <ul className="space-y-4">
            {tip.vocabulary_phrases.map((row) => {
              const key = row.phrase.toLowerCase();
              return (
                <li key={row.phrase} className="border-b border-border/60 pb-4 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-ink">{row.phrase}</p>
                    <button
                      type="button"
                      onClick={() => pronounce(row.phrase)}
                      className="shrink-0 text-xs text-brand-primary"
                      aria-label={`Pronounce ${row.phrase}`}
                    >
                      🔊
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{row.meaning}</p>
                  <p className="mt-1 text-xs italic text-ink-soft">{row.example}</p>
                  <SecondaryActionButton
                    className="mt-2"
                    disabled={adding === key || saved.has(key)}
                    onClick={() => void addToVocabulary(row.phrase, row.meaning, row.example)}
                  >
                    {saved.has(key) ? "In your list ✓" : "Add to vocabulary"}
                  </SecondaryActionButton>
                </li>
              );
            })}
          </ul>
        </CollapsibleSection>
      ) : null}

      {message ? <p className="text-sm text-brand-primary">{message}</p> : null}
    </div>
  );
}
