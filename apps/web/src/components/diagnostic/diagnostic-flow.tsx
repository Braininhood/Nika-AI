"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { WeakSkillRadar } from "@/components/dashboard/weak-skill-radar";
import { DiagnosticListenPlayer } from "@/components/diagnostic/diagnostic-listen-player";
import { NikaAvatar } from "@/components/nika/nika-avatar";
import { useAuth } from "@/lib/auth/auth-provider";
import type { OetSkill, SkillMap } from "@/lib/domain/types";
import {
  startDiagnosticSession,
  submitDiagnosticAnswer,
  submitDiagnosticToApi,
} from "@/lib/diagnostic/api-sync";
import {
  buildSkillMapFromSession,
  createBlockState,
  getNextItem,
  recordAnswer,
} from "@/lib/diagnostic/engine";
import type { DiagnosticItem, DiagnosticStep } from "@/lib/diagnostic/types";
import {
  clearDiagnosticSession,
  createSession,
  loadDiagnosticSession,
  saveDiagnosticSession,
} from "@/lib/diagnostic/session";
import { loadUserProfile, saveSkillMap } from "@/lib/profile/service";

const SKILL_STEPS: { step: DiagnosticStep; skill?: OetSkill; label: string }[] = [
  { step: "intro", label: "Intro" },
  { step: "listening", skill: "listening", label: "Listening" },
  { step: "reading", skill: "reading", label: "Reading" },
  { step: "writing", skill: "writing", label: "Writing" },
  { step: "speaking", skill: "speaking", label: "Speaking" },
  { step: "self-report", label: "Confidence" },
  { step: "results", label: "Results" },
];

const SKILL_LABELS: Record<OetSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export function DiagnosticFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const retake = searchParams.get("retake") === "1";
  const { session: authSession } = useAuth();
  const accessToken = authSession?.access_token;
  const [diagSession, setDiagSession] = useState<
    Awaited<ReturnType<typeof loadDiagnosticSession>>
  >(null);
  const [currentItem, setCurrentItem] = useState<DiagnosticItem | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [skillMap, setSkillMap] = useState<SkillMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const persist = useCallback(async (next: NonNullable<typeof diagSession>) => {
    await saveDiagnosticSession({ ...next, updatedAt: Date.now() });
    setDiagSession(next);
  }, []);

  useEffect(() => {
    void (async () => {
      const profile = await loadUserProfile();
      if (!profile?.profession) {
        router.replace("/onboarding");
        return;
      }
      let existing = await loadDiagnosticSession();
      if (retake && existing) {
        await clearDiagnosticSession();
        existing = null;
      }
      if (!existing) {
        let sessionId = crypto.randomUUID();
        if (accessToken && navigator.onLine) {
          const apiId = await startDiagnosticSession(accessToken);
          if (apiId) sessionId = apiId;
        }
        existing = { ...createSession(profile.id), sessionId };
        await saveDiagnosticSession(existing);
      }
      setDiagSession(existing);
      if (existing.step === "results" && existing.status === "completed") {
        setSkillMap(profile.skillMap ?? null);
      }
      setLoading(false);
    })();
  }, [router, accessToken, retake]);

  useEffect(() => {
    if (!diagSession) return;
    const step = SKILL_STEPS.find((s) => s.step === diagSession.step);
    queueMicrotask(() => {
      if (!step?.skill) {
        setCurrentItem(null);
        return;
      }
      const block = diagSession.blocks[step.skill] ?? createBlockState();
      setCurrentItem(getNextItem(step.skill, block, diagSession.sessionId));
      setSelected(null);
    });
  }, [diagSession]);

  const goToStep = async (step: DiagnosticStep) => {
    if (!diagSession) return;
    await persist({ ...diagSession, step });
  };

  const finishBlock = async (skill: OetSkill) => {
    if (!diagSession) return;
    const idx = SKILL_STEPS.findIndex((s) => s.skill === skill);
    const nextStep = SKILL_STEPS[idx + 1]?.step ?? "results";
    await persist({ ...diagSession, step: nextStep });
  };

  const handleAnswer = async () => {
    if (!diagSession || !currentItem || selected === null) return;
    const skill = currentItem.skill;
    const block = diagSession.blocks[skill] ?? createBlockState();
    const correct = selected === currentItem.correctIndex;
    const nextBlock = recordAnswer(block, {
      itemId: currentItem.id,
      skill,
      tier: currentItem.tier,
      tag: currentItem.tag,
      correct,
      selectedIndex: selected,
    });

    if (accessToken && navigator.onLine) {
      void submitDiagnosticAnswer(accessToken, diagSession.sessionId, {
        skill,
        itemId: currentItem.id,
        selectedIndex: selected,
        tier: currentItem.tier,
        tag: currentItem.tag,
      });
    }

    const nextSession = {
      ...diagSession,
      blocks: { ...diagSession.blocks, [skill]: nextBlock },
    };

    const nextItem = getNextItem(skill, nextBlock);
    if (nextItem) {
      await persist(nextSession);
    } else {
      await persist(nextSession);
      await finishBlock(skill);
    }
  };

  const handleSelfReport = async (skill: OetSkill, value: number) => {
    if (!diagSession) return;
    await persist({
      ...diagSession,
      selfReport: { ...diagSession.selfReport, [skill]: value },
    });
  };

  const completeDiagnostic = async () => {
    if (!diagSession) return;
    setSubmitting(true);
    try {
      const profile = await loadUserProfile();
      if (!profile?.profession || !profile.targetGrades || !profile.targetRegulator) {
        router.replace("/onboarding");
        return;
      }
      let map: SkillMap = buildSkillMapFromSession(diagSession, {
        userId: profile.id,
        profession: profile.profession,
        targetRegulator: profile.targetRegulator,
        targetGrades: profile.targetGrades,
      });
      if (accessToken && navigator.onLine) {
        const apiResult = await submitDiagnosticToApi(
          accessToken,
          diagSession.sessionId,
          diagSession,
        );
        if (apiResult?.skill_map) {
          map = apiResult.skill_map as unknown as SkillMap;
        }
      }
      await saveSkillMap(map);
      await persist({ ...diagSession, status: "completed", step: "results" });
      setSkillMap(map);
    } finally {
      setSubmitting(false);
    }
  };

  const restart = async () => {
    const profile = await loadUserProfile();
    if (!profile) return;
    await clearDiagnosticSession();
    const fresh = createSession(profile.id);
    await saveDiagnosticSession(fresh);
    setDiagSession(fresh);
    setSkillMap(null);
  };

  if (loading || !diagSession) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink-soft">
        Loading diagnostic…
      </div>
    );
  }

  const stepIndex = SKILL_STEPS.findIndex((s) => s.step === diagSession.step);
  const active = SKILL_STEPS[stepIndex];

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-6 px-4 py-8">
      <header>
        <p className="text-sm font-medium text-brand-primary">
          Diagnostic · step {stepIndex + 1} of {SKILL_STEPS.length}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-ink">{active?.label ?? "Diagnostic"}</h1>
      </header>

      <ol className="flex gap-1" aria-label="Diagnostic progress">
        {SKILL_STEPS.map((s, i) => (
          <li
            key={s.step}
            className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-brand-accent" : "bg-surface-muted"}`}
          />
        ))}
      </ol>

      {diagSession.step === "intro" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-soft">
            Adaptive blocks adjust difficulty as you answer. Works offline — progress saves
            automatically. About 15–20 minutes for this version.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-ink">
            <li>Listening — <strong>hear</strong> a clip, then answer (like the exam)</li>
            <li>Reading — read passages and answer</li>
            <li>Writing &amp; Speaking — criterion knowledge checks</li>
            <li>Quick confidence self-report</li>
          </ul>
          <button
            type="button"
            onClick={() => void goToStep("listening")}
            className="mt-6 w-full rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink"
          >
            Start Listening block
          </button>
        </section>
      )}

      {active?.skill && currentItem && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-primary">
            {SKILL_LABELS[active.skill]} · tier {currentItem.tier}
          </p>
          {active.skill === "listening" && currentItem.listenScript && (
            <DiagnosticListenPlayer script={currentItem.listenScript} />
          )}
          {active.skill === "reading" && currentItem.passage && (
            <blockquote className="mt-3 overflow-safe rounded-xl border border-border/80 bg-surface-muted/50 px-4 py-3 text-sm leading-relaxed text-ink">
              {currentItem.passage}
            </blockquote>
          )}
          <p className="mt-3 text-sm leading-relaxed text-ink">{currentItem.prompt}</p>
          <ul className="mt-4 space-y-2">
            {currentItem.options.map((option, index) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => setSelected(index)}
                  aria-pressed={selected === index}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    selected === index
                      ? "border-brand-primary bg-brand-accent-soft font-medium"
                      : "border-border hover:bg-surface-muted"
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={selected === null}
            onClick={() => void handleAnswer()}
            className="mt-6 w-full rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
          >
            Submit answer
          </button>
        </section>
      )}

      {active?.skill && !currentItem && diagSession.step !== "results" && (
        <section className="rounded-2xl border border-border bg-surface p-5 text-sm text-ink-soft">
          Block complete. Continuing…
        </section>
      )}

      {diagSession.step === "self-report" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-soft">
            How confident do you feel in each skill? (1 = low, 5 = high)
          </p>
          <div className="mt-4 space-y-4">
            {(["listening", "reading", "writing", "speaking"] as OetSkill[]).map((skill) => (
              <label key={skill} className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-ink">{SKILL_LABELS[skill]}</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={diagSession.selfReport[skill] ?? 3}
                  onChange={(e) => void handleSelfReport(skill, Number(e.target.value))}
                  className="w-full accent-brand-primary"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void completeDiagnostic()}
            className="mt-6 w-full rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
          >
            {submitting ? "Building Skill Map…" : "See my Skill Map"}
          </button>
        </section>
      )}

      {diagSession.step === "results" && skillMap && (
        <>
          <section className="flex items-start gap-4 rounded-2xl border border-brand-accent/30 bg-brand-accent-soft/30 p-5">
            <NikaAvatar size="md" state="proud" glow={0.6} />
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-ink">Nika</p>
              <p className="mt-1 text-ink-soft">
                Your Skill Map is ready. I&apos;ll grow as you improve — keep studying and watch
                for little celebrations along the way.
              </p>
            </div>
          </section>
          <WeakSkillRadar skillMap={skillMap} />
          <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
            <p className="text-ink-soft">
              Priority focus:{" "}
              <strong className="text-ink">{skillMap.priority[0]}</strong> · estimated{" "}
              {skillMap.estimatedWeeksToTarget} weeks to target
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.replace("/dashboard")}
                className="rounded-xl bg-brand-accent px-4 py-2 font-semibold text-ink"
              >
                Go to Home
              </button>
              <button
                type="button"
                onClick={() => router.replace("/writing/learn")}
                className="rounded-xl border border-border px-4 py-2 font-semibold text-ink"
              >
                Writing Academy
              </button>
              <button
                type="button"
                onClick={() => void restart()}
                className="rounded-xl border border-border px-4 py-2 text-ink-soft"
              >
                Retake
              </button>
            </div>
          </section>
        </>
      )}

      {diagSession.step === "results" && !skillMap && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <button
            type="button"
            onClick={() => void completeDiagnostic()}
            className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink"
          >
            Generate Skill Map
          </button>
        </section>
      )}
    </div>
  );
}
