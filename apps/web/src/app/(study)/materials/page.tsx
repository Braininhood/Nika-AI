"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StudyMediaPanel } from "@/components/listening/study-media-panel";
import { SecondaryActionAnchor, SecondaryActionLink } from "@/components/ui/secondary-action-button";
import { ContentDisclaimer } from "@/components/legal/content-disclaimer";
import { OetProfessionSamplesPanel } from "@/components/media/oet-profession-samples-panel";
import { SkillHubHeader } from "@/components/study/skill-hub-header";
import {
  knowledgeForPhase,
  importChecklistForProfession,
} from "@/content/media/study-knowledge-base";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadUserProfile } from "@/lib/profile/service";

type Tab = "official" | "guides" | "import" | "phase";

export default function MaterialsPage() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("official");
  const [profession, setProfession] = useState<string | undefined>();

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((p) => {
      setProfession(p?.profession);
    });
  }, [loading, session?.user?.id]);

  const checklist = importChecklistForProfession(profession);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <SkillHubHeader
        eyebrow="Resources"
        title="Materials hub"
        description="Official OET links, criteria PDFs, and import steps — the same sources Nika references for study advice. We link to public OET resources; we do not host copyrighted test content."
        backHref="/study"
        backLabel="← Back to study hub"
      />

      <ContentDisclaimer />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["official", "Official OET"],
            ["guides", "Skill guides"],
            ["import", "Import checklist"],
            ["phase", "By phase"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-9 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              tab === id
                ? "bg-brand-accent font-semibold text-ink"
                : "border border-border bg-surface text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <SecondaryActionLink href="/nika">Ask Nika about materials →</SecondaryActionLink>

      {tab === "official" && (
        <>
          <OetProfessionSamplesPanel />
          <StudyMediaPanel skill="all" showAccentPodcasts />
        </>
      )}

      {tab === "guides" && <StudyMediaPanel skill="all" showAccentPodcasts={false} />}

      {tab === "import" && (
        <ul className="space-y-3">
          {checklist.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-[10px] font-semibold uppercase text-brand-primary">
                {item.skill} · phase {item.phase}
              </p>
              <h2 className="mt-1 font-semibold text-ink">{item.label}</h2>
              <p className="mt-1 text-sm text-ink-soft">{item.detail}</p>
              <p className="mt-2 text-xs text-ink-soft">Files: {item.fileHint}</p>
              <SecondaryActionLink href={item.route} className="mt-3">
                Open in app →
              </SecondaryActionLink>
            </li>
          ))}
          <li className="rounded-2xl border border-dashed border-border p-5 text-sm text-ink-soft">
            <Link href="/listening/import" className="font-medium text-brand-primary hover:underline">
              PLV import flow →
            </Link>{" "}
            for official MP3/PDF packs from oet.com.
          </li>
        </ul>
      )}

      {tab === "phase" && (
        <ul className="space-y-3">
          {([1, 2, 3] as const).flatMap((phase) =>
            knowledgeForPhase(phase).slice(0, 6).map((entry) => (
              <li key={entry.id} className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-[10px] font-semibold uppercase text-brand-primary">
                  Phase {phase} · {entry.category}
                </p>
                <h2 className="mt-1 font-semibold text-ink">{entry.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{entry.summary}</p>
                <p className="mt-2 text-xs italic text-ink-soft">Nika: {entry.nikaAdvice}</p>
                {entry.href && (
                  <SecondaryActionAnchor
                    href={entry.href}
                    target={entry.href.startsWith("http") ? "_blank" : undefined}
                    rel={entry.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-2"
                  >
                    Open →
                  </SecondaryActionAnchor>
                )}
              </li>
            )),
          )}
        </ul>
      )}
    </div>
  );
}
