"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { GuidedWritingWizard } from "@/components/writing/guided-wizard";
import { getScenario } from "@/content/writing/scenarios";

export default function GuidedScenarioPage() {
  const params = useParams();
  const scenario = getScenario(params.scenarioId as string);

  if (!scenario) {
    return (
      <p className="py-8 text-sm text-ink-soft">
        Scenario not found. <Link href="/writing/guided">Back</Link>
      </p>
    );
  }

  return (
    <>
      <Link href="/writing/guided" className="text-sm text-ink-soft hover:text-ink">
        ← Guided writing
      </Link>
      <header className="mt-4">
        <h1 className="text-xl font-bold text-ink capitalize">{scenario.meta.letterType} wizard</h1>
        <p className="mt-1 text-sm text-ink-soft">{scenario.taskSheet.instruction}</p>
      </header>
      <GuidedWritingWizard scenario={scenario} />
    </>
  );
}
