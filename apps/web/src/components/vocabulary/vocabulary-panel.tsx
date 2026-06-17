"use client";

import { useCallback, useEffect, useState } from "react";

import { VOCAB_PHRASES } from "@/content/assessment";
import { useAuth } from "@/lib/auth/auth-provider";
import { speakTranscript, stopSpeaking } from "@/lib/media/browser-tts";
import { loadUserProfile, saveNativeLanguage } from "@/lib/profile/service";
import { explainWord, translateWord } from "@/lib/vocabulary/api";
import {
  deleteVocabularyEntry,
  listVocabulary,
  saveVocabularyEntry,
} from "@/lib/vocabulary/service";
import { defaultNativeLanguage, NATIVE_LANGUAGES, type VocabularyEntry } from "@/lib/vocabulary/types";

export function VocabularyPanel() {
  const { session, loading } = useAuth();
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [nativeLang, setNativeLang] = useState("PL");
  const [word, setWord] = useState("");
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [list, profile] = await Promise.all([
      listVocabulary(),
      loadUserProfile(session?.user?.id),
    ]);
    setEntries(list);
    setNativeLang(defaultNativeLanguage(profile?.nativeLanguage));
  }, [session?.user?.id]);

  useEffect(() => {
    if (loading) return;
    void refresh();
  }, [loading, refresh]);

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

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-ink">Add a word or phrase</h2>
        <p className="mt-1 text-xs text-ink-soft">
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
        {message && <p className="mt-2 text-xs text-brand-primary">{message}</p>}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-ink">Starter phrases</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {VOCAB_PHRASES.map((p) => (
            <li key={p.id} className="border-b border-border/60 pb-3 last:border-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-ink">{p.phrase}</p>
                <button
                  type="button"
                  onClick={() => pronounce(p.phrase)}
                  className="shrink-0 text-xs text-brand-primary"
                  aria-label={`Pronounce ${p.phrase}`}
                >
                  🔊
                </button>
              </div>
              <p className="mt-1 text-ink-soft">{p.meaning}</p>
              <p className="mt-1 text-xs italic text-ink-soft">{p.example}</p>
              <button
                type="button"
                className="mt-2 text-xs font-medium text-brand-primary hover:underline"
                onClick={() => {
                  setWord(p.phrase);
                  setContext(p.example);
                }}
              >
                Add to my list
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-ink">My vocabulary ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            Highlight unknown words while studying, or add them above.
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
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
      </section>
    </div>
  );
}
