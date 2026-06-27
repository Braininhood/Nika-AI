"use client";

import { useEffect, useState } from "react";

import { ScenarioList } from "@/components/writing/scenario-list";
import { StudyPageHeader } from "@/components/study/study-page-header";
import type { WritingScenario } from "@/content/writing/scenarios";
import { loadWritingContentContext } from "@/lib/writing/content-context";
import { useAuth } from "@/lib/auth/auth-provider";

export default function ExamListPage() {
  const { session, loading } = useAuth();
  const [scenarios, setScenarios] = useState<WritingScenario[]>([]);

  useEffect(() => {
    if (loading) return;
    void loadWritingContentContext(session?.user?.id).then((ctx) => {
      setScenarios(ctx.scenarios);
    });
  }, [loading, session?.user?.id]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <StudyPageHeader
        backHref="/writing/learn"
        backLabel="Writing Academy"
        skill="writing"
        eyebrow="Writing · Exam"
        title="Exam mode"
        description="Timed conditions: 5 minutes reading case notes, then 40 minutes writing. No hints."
      />
      <ScenarioList scenarios={scenarios} hrefPrefix="/writing/exam" suffix="exam" />
    </div>
  );
}
