"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { AnnotatedSampleView } from "@/components/writing/annotated-sample-view";
import {
  getSampleLetter,
  primarySampleForProfession,
  weakSampleForProfession,
} from "@/content/writing/sample-letters";

export default function WritingSampleDetailPage() {
  const params = useParams();
  const sampleId = params.sampleId as string;
  const sample = getSampleLetter(sampleId);

  if (!sample) {
    return (
      <p className="py-8 text-sm text-ink-soft">
        Sample not found.{" "}
        <Link href="/writing/learn/samples" className="text-brand-primary hover:underline">
          Back to samples
        </Link>
      </p>
    );
  }

  const compareSample =
    sample.estimatedOverall === "C"
      ? primarySampleForProfession(sample.profession)
      : sample.estimatedOverall === "B" || sample.estimatedOverall === "A"
        ? weakSampleForProfession(sample.profession)
        : undefined;
  const showCompare =
    compareSample && compareSample.id !== sample.id && compareSample.estimatedOverall !== sample.estimatedOverall;

  return (
    <>
      <Link
        href="/writing/learn/samples"
        className="mb-4 inline-block text-sm text-ink-soft hover:text-ink"
      >
        ← Graded samples
      </Link>
      {showCompare && compareSample && (
        <p className="mb-4 rounded-xl border border-dashed border-brand-primary bg-brand-accent-soft/30 px-4 py-3 text-sm text-ink">
          Compare with{" "}
          <Link
            href={`/writing/learn/samples/${compareSample.id}`}
            className="font-semibold text-brand-primary hover:underline"
          >
            Grade {compareSample.estimatedOverall} — {compareSample.title}
          </Link>
        </p>
      )}
      <AnnotatedSampleView sample={sample} />
      {sample.scenarioId && (
        <Link
          href={`/writing/practice/${sample.scenarioId}`}
          className="mt-4 inline-flex rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink"
        >
          Try this task yourself →
        </Link>
      )}
    </>
  );
}
