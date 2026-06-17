import type { GradedSampleLetter } from "@/content/writing/sample-letters";

const GRADE_STYLES: Record<string, string> = {
  A: "bg-success/15 text-forest-deep",
  B: "bg-brand-accent-soft text-brand-primary-strong",
  C: "bg-danger/10 text-danger",
};

interface AnnotatedSampleViewProps {
  sample: GradedSampleLetter;
}

export function AnnotatedSampleView({ sample }: AnnotatedSampleViewProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <p className="text-sm font-medium text-brand-primary">Graded sample · {sample.letterType}</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">{sample.title}</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {sample.wordCount} words · estimated overall{" "}
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${GRADE_STYLES[sample.estimatedOverall]}`}
          >
            Grade {sample.estimatedOverall}
          </span>
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Letter with annotations</h2>
        {sample.paragraphs.map((para) => (
          <article
            key={para.label}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
              {para.label}
            </p>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
              {para.text}
            </pre>
            {para.sourceNoteIds.length > 0 && (
              <p className="mt-2 text-xs text-ink-soft">
                Draws from case notes: {para.sourceNoteIds.join(", ")}
              </p>
            )}
            <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-ink-soft">
              {para.notes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-ink">Assessor criteria</h2>
        <ul className="mt-3 space-y-3">
          {sample.criterionScores.map((score) => (
            <li key={score.criterion} className="flex gap-3 text-sm">
              <span
                className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${GRADE_STYLES[score.grade]}`}
              >
                {score.grade}
              </span>
              <div>
                <p className="font-medium text-ink">{score.criterion}</p>
                <p className="text-ink-soft">{score.comment}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-surface-muted px-3 py-2 text-sm text-ink-soft">
          <strong className="text-ink">Summary:</strong> {sample.assessorSummary}
        </p>
      </section>
    </div>
  );
}
