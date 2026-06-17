"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  drillsForProfession,
  scoreDrills,
  type ContentDrill,
} from "@/content/writing/drills";
import { applyWritingResult } from "@/lib/adaptive/skill-map";
import { loadUserProfile, saveSkillMap } from "@/lib/profile/service";
import { loadWritingContentContext } from "@/lib/writing/content-context";
import { useAuth } from "@/lib/auth/auth-provider";

export default function ContentDrillsPage() {
  const { session, loading } = useAuth();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof scoreDrills> | null>(null);
  const [drills, setDrills] = useState<ContentDrill[]>([]);
  const [guidedRoute, setGuidedRoute] = useState("/writing/guided");

  useEffect(() => {
    if (loading) return;
    void loadWritingContentContext(session?.user?.id).then((ctx) => {
      setDrills(ctx.drills);
      setGuidedRoute(`/writing/guided/${ctx.primaryScenario.id}`);
    });
  }, [loading, session?.user?.id]);

  const handleSubmit = async () => {
    const scored = scoreDrills(answers, drills);
    setResult(scored);
    setSubmitted(true);

    const profile = await loadUserProfile();
    if (profile?.skillMap && scored.pct < 80) {
      const criterionScores = { content: scored.pct / 100, purpose: scored.pct / 100 };
      const updated = applyWritingResult(profile.skillMap, criterionScores, scored.weakTags);
      await saveSkillMap(updated);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/writing/learn" className="text-sm text-ink-soft hover:text-ink">
        ← Writing Academy
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-ink">Content-selection drills</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Train Purpose and Content criteria without writing a full letter. Drills include
          universal tasks plus profession-specific scenarios where relevant.
        </p>
      </header>

      {!submitted ? (
        <ul className="space-y-4">
          {drills.map((drill) => (
            <li key={drill.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm font-medium text-ink">{drill.prompt}</p>
              <ul className="mt-3 space-y-2">
                {drill.options.map((opt, idx) => (
                  <li key={opt}>
                    <label className="flex cursor-pointer gap-2 text-sm">
                      <input
                        type="radio"
                        name={drill.id}
                        checked={answers[drill.id] === idx}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [drill.id]: idx }))
                        }
                        className="accent-brand-primary"
                      />
                      {opt}
                    </label>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}

      {!submitted && (
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={Object.keys(answers).length < drills.length}
          className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
        >
          Submit drills
        </button>
      )}

      {submitted && result && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-lg font-semibold text-ink">
            Score: {result.pct}% ({result.score}/{drills.length})
          </p>
          {result.pct < 80 && (
            <p className="mt-2 text-sm text-ink-soft">
              Focus tags: {result.weakTags.join(", ")}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={guidedRoute}
              className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink"
            >
              Try guided wizard
            </Link>
            <Link
              href="/writing/learn"
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink"
            >
              Back to Academy
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
