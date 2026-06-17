"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StudyMediaPanel } from "@/components/listening/study-media-panel";
import { ContentDisclaimer } from "@/components/legal/content-disclaimer";
import { OetProfessionSamplesPanel } from "@/components/media/oet-profession-samples-panel";
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
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <header>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Materials Hub</h1>
          <Link href="/nika" className="text-xs font-medium text-brand-primary hover:underline">
            Ask Nika →
          </Link>
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Official OET links, criteria PDFs, and import steps — the same sources Nika references
          for study advice. We link to public OET resources; we do not host copyrighted test
          content.
        </p>
        <ContentDisclaimer className="mt-3" />
      </header>

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
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === id
                ? "bg-brand-primary text-white"
                : "border border-border bg-surface text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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
            <li key={item.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[10px] font-semibold uppercase text-brand-primary">
                {item.skill} · phase {item.phase}
              </p>
              <h2 className="mt-1 font-semibold text-ink">{item.label}</h2>
              <p className="mt-1 text-sm text-ink-soft">{item.detail}</p>
              <p className="mt-2 text-xs text-ink-soft">Files: {item.fileHint}</p>
              <Link
                href={item.route}
                className="mt-3 inline-block text-sm font-medium text-brand-primary hover:underline"
              >
                Open in app →
              </Link>
            </li>
          ))}
          <li className="rounded-xl border border-dashed border-border p-4 text-sm text-ink-soft">
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
              <li key={entry.id} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-[10px] font-semibold uppercase text-brand-primary">
                  Phase {phase} · {entry.category}
                </p>
                <h2 className="mt-1 font-semibold text-ink">{entry.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{entry.summary}</p>
                <p className="mt-2 text-xs italic text-ink-soft">Nika: {entry.nikaAdvice}</p>
                {entry.href && (
                  <a
                    href={entry.href}
                    target={entry.href.startsWith("http") ? "_blank" : undefined}
                    rel={entry.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-2 inline-block text-sm font-medium text-brand-primary hover:underline"
                  >
                    Open →
                  </a>
                )}
              </li>
            )),
          )}
        </ul>
      )}
    </div>
  );
}
