"use client";

import { useParams } from "next/navigation";

import { CleverQuizSession } from "@/components/study/clever-quiz-session";
import {
  CLEVER_SKILL_LABELS,
  type AssessmentSkill,
} from "@/content/assessment";

const VALID: AssessmentSkill[] = ["reading", "listening", "writing", "speaking", "vocab", "mixed"];

export default function CleverSkillQuizPage() {
  const params = useParams();
  const raw = typeof params.skill === "string" ? params.skill : "reading";
  const skill = (VALID.includes(raw as AssessmentSkill) ? raw : "reading") as AssessmentSkill;

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg px-4 pt-6">
      <CleverQuizSession
        skill={skill}
        backHref="/study/clever"
        title={CLEVER_SKILL_LABELS[skill]}
      />
    </div>
  );
}
