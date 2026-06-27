"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { VOCAB_PHRASES } from "@/content/assessment";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { SecondaryActionButton, SecondaryActionLink } from "@/components/ui/secondary-action-button";
import { useAuth } from "@/lib/auth/auth-provider";
import { speakTranscript, stopSpeaking } from "@/lib/media/browser-tts";
import { loadUserProfile, saveNativeLanguage } from "@/lib/profile/service";
import { explainWord, translateWord } from "@/lib/vocabulary/api";
import { fetchTodayTip, phrasesFromTodayTip } from "@/lib/vocabulary/today-tip";
import type { TodayTip } from "@/lib/vocabulary/today-tip-types";
import {
  deleteVocabularyEntry,
  findVocabularyByWord,
  listVocabulary,
  saveVocabularyEntry,
} from "@/lib/vocabulary/service";
import {
  defaultNativeLanguage,
  NATIVE_LANGUAGES,
  type VocabularyEntry,
} from "@/lib/vocabulary/types";
import Link from "next/link";

function PhraseRow({
  phrase,
  meaning,
  example,
  onPronounce,
  onAdd,
  adding = false,
  saved = false,
}: {
  phrase: string;
  meaning: string;
  example: string;
  onPronounce: (text: string) => void;
  onAdd: () => void;
  adding?: boolean;
  saved?: boolean;
}) {
  const label = saved ? "In your list ✓" : adding ? "Saving…" : "Add to my list";

  return (
    <li className="border-b border-border/60 pb-3 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-ink">{phrase}</p>
        <button
          type="button"
          onClick={() => onPronounce(phrase)}
          className="shrink-0 text-xs text-brand-primary"
          aria-label={`Pronounce ${phrase}`}
        >
          🔊
        </button>
      </div>
      <p className="mt-1 text-ink-soft">{meaning}</p>
      <p className="mt-1 text-xs italic text-ink-soft">{example}</p>
      <SecondaryActionButton
        className="mt-2"
        disabled={adding || saved}
        onClick={onAdd}
      >
        {label}
      </SecondaryActionButton>
    </li>
  );
}

export function VocabularyPanel() {
  const { session, loading } = useAuth();
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [todayTip, setTodayTip] = useState<TodayTip | null>(null);
  const [nativeLang, setNativeLang] = useState("PL");
  const [word, setWord] = useState("");
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [addingPhrase, setAddingPhrase] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const savedPhrases = useMemo(
    () => new Set(entries.map((e) => e.word.toLowerCase())),
    [entries],
  );

  const refresh = useCallback(async () => {
    const [list, profile, tip] = await Promise.all([
      listVocabulary(),
      loadUserProfile(session?.user?.id),
      fetchTodayTip(session?.access_token),
    ]);
    setEntries(list);
    setTodayTip(tip);
    setNativeLang(defaultNativeLanguage(profile?.nativeLanguage));
  }, [session?.access_token, session?.user?.id]);

  useEffect(() => {
    if (loading) return;
    void refresh();
  }, [loading, refresh]);

  const tipPhrases = useMemo(
    () => (todayTip ? phrasesFromTodayTip(todayTip) : []),
    [todayTip],
  );

  const handleAddWord = async () => {
    const trimmed = word.trim();
    if (!trimmed) return;
    setBusy(true);
    setMessage(null);
    try {
      const explained = await explainWord(
        trimmed,
        session?.access_token,
        context || undefined,
        undefined,
      );
      const translated = await translateWord(trimmed, nativeLang, session?.access_token);

      await saveVocabularyEntry({
        word: trimmed,
        context: context || undefined,
        englishExplanation: explained.explanation,
        nativeTranslation: translated.text !== trimmed ? translated.text : undefined,
        nativeLanguage: nativeLang,
        tags: ["vocab:user"],
        source: "manual",
      });
      setWord("");
      setContext("");
      setMessage("Saved to your vocabulary.");
      await refresh();
    } catch {
      setMessage("Could not save word. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const pronounce = (text: string) => {
    stopSpeaking();
    void speakTranscript(text, { rate: 0.88, voiceProfile: "nika" });
  };

  const handleLangChange = async (code: string) => {
    setNativeLang(code);
    if (session?.user) {
      await saveNativeLanguage(code, session.access_token);
    }
  };

  const addPhraseToList = useCallback(
    async (
      phrase: string,
      meaning: string,
      example: string,
      opts: {
        source: VocabularyEntry["source"];
        tags: string[];
        profession?: string;
        phoneticHint?: string;
      },
    ) => {
      const key = phrase.toLowerCase();
      if (addingPhrase === key || savedPhrases.has(key)) return;

      setAddingPhrase(key);
      setMessage(null);
      try {
        const existing = await findVocabularyByWord(phrase);
        if (existing) {
          setMessage(`"${phrase}" is already in your list.`);
          await refresh();
          return;
        }

        const contextClean = example.replace(/^\*|\*$/g, "");
        let explanation = meaning;
        if (session?.access_token) {
          const explained = await explainWord(
            phrase,
            session.access_token,
            contextClean,
            opts.profession,
          );
          explanation = explained.explanation;
        }

        let nativeTranslation: string | undefined;
        if (session?.access_token) {
          const translated = await translateWord(phrase, nativeLang, session.access_token);
          nativeTranslation = translated.text !== phrase ? translated.text : undefined;
        }

        await saveVocabularyEntry({
          word: phrase,
          context: contextClean,
          englishExplanation: explanation,
          nativeTranslation,
          nativeLanguage: nativeLang,
          phoneticHint: opts.phoneticHint,
          tags: opts.tags,
          source: opts.source,
        });
        setMessage(`Added "${phrase}" to your vocabulary.`);
        await refresh();
      } catch {
        setMessage("Could not save — try again.");
      } finally {
        setAddingPhrase(null);
      }
    },
    [addingPhrase, nativeLang, refresh, savedPhrases, session?.access_token],
  );

  return (
    <div className="flex flex-col gap-5">
      {todayTip ? (
        <CollapsibleSection
          title="From today&apos;s tip"
          subtitle={todayTip.term}
          defaultOpen
          variant="accent"
          badge="Today"
        >
          <p className="mb-3 text-sm text-ink-soft">
            Phrases from your daily profession tip.{" "}
            <Link href="/today-tip" className="font-semibold text-brand-primary hover:underline">
              Open full tip →
            </Link>
          </p>
          <ul className="space-y-3 text-sm">
            {tipPhrases.map((p) => {
              const key = p.phrase.toLowerCase();
              return (
                <PhraseRow
                  key={p.phrase}
                  phrase={p.phrase}
                  meaning={p.meaning}
                  example={p.example}
                  onPronounce={pronounce}
                  adding={addingPhrase === key}
                  saved={savedPhrases.has(key)}
                  onAdd={() =>
                    void addPhraseToList(p.phrase, p.meaning, p.example, {
                      source: "today_tip",
                      tags: ["vocab:today-tip", `profession:${todayTip.profession}`],
                      profession: todayTip.profession,
                      phoneticHint:
                        p.phrase.toLowerCase() === todayTip.term.toLowerCase()
                          ? todayTip.phonetic
                          : undefined,
                    })
                  }
                />
              );
            })}
          </ul>
        </CollapsibleSection>
      ) : (
        <CollapsibleSection
          title="Today&apos;s tip"
          subtitle="Profession vocabulary, speaking & writing phrases"
          defaultOpen={false}
        >
          <p className="text-sm text-ink-soft">
            Sign in online to load today&apos;s tip, or open the tip page from Home.
          </p>
          <SecondaryActionLink href="/today-tip" className="mt-3">
            Open today&apos;s tip
          </SecondaryActionLink>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title="Add a word or phrase"
        subtitle="Explain, translate & save"
        defaultOpen={false}
      >
        <p className="text-xs text-ink-soft">
          Nika explains in English; DeepL translates to your language. Tap 🔊 to hear pronunciation.
        </p>

        <label className="mt-4 block text-xs text-ink-soft">
          Native language for translations
          <select
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            value={nativeLang}
            onChange={(e) => void handleLangChange(e.target.value)}
          >
            {NATIVE_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block text-xs text-ink-soft">
          Word or phrase
          <input
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="e.g. nil by mouth"
          />
        </label>

        <label className="mt-3 block text-xs text-ink-soft">
          Context (optional)
          <input
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Sentence where you saw it…"
          />
        </label>

        <button
          type="button"
          disabled={busy || !word.trim()}
          onClick={() => void handleAddWord()}
          className="mt-4 min-h-11 w-full rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
        >
          {busy ? "Saving…" : "Explain, translate & save"}
        </button>
      </CollapsibleSection>

      <CollapsibleSection
        title="Common OET phrases"
        subtitle="Starter healthcare English"
        defaultOpen={false}
      >
        <ul className="space-y-3 text-sm">
          {VOCAB_PHRASES.map((p) => {
            const key = p.phrase.toLowerCase();
            return (
              <PhraseRow
                key={p.id}
                phrase={p.phrase}
                meaning={p.meaning}
                example={p.example}
                onPronounce={pronounce}
                adding={addingPhrase === key}
                saved={savedPhrases.has(key)}
                onAdd={() =>
                  void addPhraseToList(p.phrase, p.meaning, p.example, {
                    source: "manual",
                    tags: ["vocab:starter"],
                  })
                }
              />
            );
          })}
        </ul>
      </CollapsibleSection>

      {message ? <p className="text-sm text-brand-primary">{message}</p> : null}

      <CollapsibleSection
        title={`My vocabulary (${entries.length})`}
        subtitle={entries.length ? "Your saved words" : "Nothing saved yet"}
        defaultOpen
      >
        {entries.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Add words from today&apos;s tip, common phrases, or the form above.
          </p>
        ) : (
          <ul className="space-y-4">
            {entries.map((e) => (
              <li key={e.id} className="rounded-xl border border-border/80 bg-surface-muted/30 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-ink">{e.word}</p>
                  <button
                    type="button"
                    onClick={() => pronounce(e.word)}
                    className="text-xs text-brand-primary"
                    aria-label={`Pronounce ${e.word}`}
                  >
                    🔊 Nika
                  </button>
                </div>
                {e.nativeTranslation && (
                  <p className="mt-1 text-sm text-brand-primary">{e.nativeTranslation}</p>
                )}
                <p className="mt-2 overflow-safe text-sm text-ink-soft">{e.englishExplanation}</p>
                {e.context && (
                  <p className="mt-1 text-xs italic text-ink-soft">Context: {e.context}</p>
                )}
                {e.source === "today_tip" ? (
                  <p className="mt-1 text-[10px] uppercase text-brand-primary">From today&apos;s tip</p>
                ) : e.tags.includes("vocab:starter") ? (
                  <p className="mt-1 text-[10px] uppercase text-brand-primary">Common OET phrase</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void deleteVocabularyEntry(e.id).then(refresh)}
                  className="mt-2 text-xs text-ink-soft hover:text-danger"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>
    </div>
  );
}
