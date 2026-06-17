"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getProfessionLabel } from "@/lib/domain/professions";
import type { OetProfession } from "@/lib/domain/types";
import {
  primarySampleForProfession,
  sampleSummary,
  samplesForProfessionSorted,
  weakSampleForProfession,
  type GradedSampleLetter,
} from "@/content/writing/sample-letters";
import { loadWritingContentContext } from "@/lib/writing/content-context";
import { useAuth } from "@/lib/auth/auth-provider";

const GRADE_BADGE: Record<string, string> = {
  B: "bg-brand-accent-soft text-brand-primary",
  A: "bg-success/15 text-forest-deep",
  C: "bg-danger/10 text-danger",
};

function SampleRow({ sample }: { sample: GradedSampleLetter }) {
  return (
    <Link
      href={`/writing/learn/samples/${sample.id}`}
      className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition hover:bg-surface-muted"
    >
      <div>
        <p className="font-medium text-ink">{sample.title}</p>
        <p className="text-xs text-ink-soft">
          {sample.wordCount} words · {sample.letterType}
        </p>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${GRADE_BADGE[sample.estimatedOverall] ?? "bg-surface-muted text-ink-soft"}`}
      >
        Grade {sample.estimatedOverall}
      </span>
    </Link>
  );
}

export default function WritingSamplesPage() {
  const { session, loading } = useAuth();
  const [samples, setSamples] = useState<GradedSampleLetter[]>([]);
  const [profession, setProfession] = useState<OetProfession | undefined>();
  const [professionLabel, setProfessionLabel] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    void loadWritingContentContext(session?.user?.id).then((ctx) => {
      setSamples(ctx.samples);
      setProfession(ctx.profession);
      if (ctx.profession) {
        setProfessionLabel(getProfessionLabel(ctx.profession));
      }
    });
  }, [loading, session?.user?.id]);

  const { userPairs, otherSamples } = useMemo(() => {
    if (!profession) {
      return { userPairs: [], otherSamples: samples };
    }
    const sorted = samplesForProfessionSorted(profession);
    const strong = primarySampleForProfession(profession);
    const weak = weakSampleForProfession(profession);
    const pairIds = new Set([strong?.id, weak?.id].filter(Boolean));
    const other = samples.filter((s) => s.profession !== profession);
    return {
      userPairs: sorted.filter((s) => pairIds.has(s.id)),
      otherSamples: other,
    };
  }, [profession, samples]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/writing/learn" className="text-sm text-ink-soft hover:text-ink">
        ← Writing Academy
      </Link>

      <header>
        <p className="text-sm font-medium text-brand-primary">Learn from examples</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">Graded sample letters</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Original OET-style samples with assessor comments per criterion.
          {professionLabel
            ? ` Compare Grade B and Grade C ${professionLabel} letters side by side, then browse other professions.`
            : " Complete onboarding to prioritise samples for your profession."}
        </p>
      </header>

      {profession && userPairs.length > 0 && (
        <section className="rounded-2xl border border-brand-primary/40 bg-brand-accent-soft/20 p-4">
          <h2 className="text-sm font-semibold text-ink">
            Your profession — compare B vs C
          </h2>
          <p className="mt-1 text-xs text-ink-soft">
            Read the Grade B model first, then the weaker response to see what drops the score.
          </p>
          <ul className="mt-3 space-y-2">
            {userPairs.map((sample) => (
              <li key={sample.id}>
                <SampleRow sample={sample} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {samples.length === 0 ? (
        <p className="text-sm text-ink-soft">No samples available yet.</p>
      ) : (
        <section>
          <h2 className="text-sm font-semibold text-ink">
            {profession ? "Other professions" : "Browse samples"}
          </h2>
          <ul className="mt-3 space-y-3">
            {(profession ? otherSamples : samples).map((sample) => (
              <li key={sample.id}>
                <Link
                  href={`/writing/learn/samples/${sample.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-4 transition hover:bg-surface-muted"
                >
                  <div>
                    <p className="font-semibold text-ink">{sample.title}</p>
                    <p className="text-xs text-ink-soft">
                      {sampleSummary(sample)} · {sample.wordCount} words · {sample.letterType}
                    </p>
                  </div>
                  <span className="text-sm text-forest">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
