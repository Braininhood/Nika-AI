import Link from "next/link";

import { OET_LISTENING, OET_READING, PART_A_QUESTIONS_PER_BLOCK } from "@/lib/exam/oet-counts";

type Skill = "reading" | "listening";
type Part = "A" | "B" | "C";

const EXAM_META: Record<
  Skill,
  Record<Part, { count: number; minutes?: number; href: string; label: string }>
> = {
  reading: {
    A: {
      count: OET_READING.partA,
      minutes: OET_READING.partAMinutes,
      href: "/reading/exam/part-a",
      label: "Start Part A exam (20 questions · 15 min lock)",
    },
    B: {
      count: OET_READING.partB,
      href: "/reading/exam",
      label: "Start Parts B & C exam (6 + 16 · 45 min)",
    },
    C: {
      count: OET_READING.partC,
      href: "/reading/exam",
      label: "Start Parts B & C exam (6 + 16 · 45 min)",
    },
  },
  listening: {
    A: {
      count: OET_LISTENING.partA,
      minutes: OET_LISTENING.totalMinutes,
      href: "/listening/exam",
      label: "Start full listening exam (24 + 6 + 12 · 40 min)",
    },
    B: {
      count: OET_LISTENING.partB,
      href: "/listening/exam",
      label: "Start full listening exam (24 + 6 + 12 · 40 min)",
    },
    C: {
      count: OET_LISTENING.partC,
      href: "/listening/exam",
      label: "Start full listening exam (24 + 6 + 12 · 40 min)",
    },
  },
};

interface PartExamCtaProps {
  skill: Skill;
  part: Part;
}

export function PartExamCta({ skill, part }: PartExamCtaProps) {
  const meta = EXAM_META[skill][part];
  const practicePerBlock =
    skill === "reading" && part === "A" ? PART_A_QUESTIONS_PER_BLOCK : undefined;

  return (
    <section className="rounded-2xl border-2 border-brand-primary/25 bg-brand-accent-soft/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
        Real OET · Part {part}
      </p>
      <p className="mt-1 text-sm text-ink">
        Exam mode: <strong>{meta.count} questions</strong>
        {meta.minutes && part === "A" && skill === "reading"
          ? ` · ${meta.minutes} min lock`
          : null}
        {practicePerBlock ? (
          <>
            {" "}
            — practice blocks below are <strong>{practicePerBlock} questions</strong> each (one Text
            A–D set).
          </>
        ) : (
          <> — use exam mode for the full part count.</>
        )}
      </p>
      <Link
        href={meta.href}
        className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
      >
        {meta.label}
      </Link>
    </section>
  );
}
