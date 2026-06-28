"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { ListeningCleverExamSession } from "@/components/listening/listening-clever-exam-session";
import { CleverQuizSession } from "@/components/study/clever-quiz-session";
import {
  CLEVER_SKILL_LABELS,
  type AssessmentSkill,
} from "@/content/assessment";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadUserProfile } from "@/lib/profile/service";

const VALID: AssessmentSkill[] = ["reading", "listening", "writing", "speaking", "vocab", "mixed"];

function ListeningCleverExamWrapper({ backHref }: { backHref: string }) {
  const { session, loading } = useAuth();
  const [weakTags, setWeakTags] = useState<string[]>(["listening:part-b-gist"]);

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((profile) => {
      const tags = profile?.skillMap?.diagnostic.listening?.weakTags;
      if (tags?.length) setWeakTags(tags);
    });
  }, [loading, session?.user?.id]);

  return <ListeningCleverExamSession weakTags={weakTags} backHref={backHref} />;
}

export default function CleverSkillQuizPage() {
  const params = useParams();
  const raw = typeof params.skill === "string" ? params.skill : "reading";
  const skill = (VALID.includes(raw as AssessmentSkill) ? raw : "reading") as AssessmentSkill;

  if (skill === "listening") {
    return (
      <div className="mx-auto w-full min-w-0 max-w-lg px-4 pt-6">
        <ListeningCleverExamWrapper backHref="/study/clever" />
      </div>
    );
  }

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
