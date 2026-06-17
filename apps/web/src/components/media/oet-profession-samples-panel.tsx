"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  OET_COMPUTER_HUB,
  OET_OFFICIAL_SAMPLE_LINKS,
  OET_PAPER_HUB,
  OET_SAMPLE_HUB,
  officialSamplesForProfession,
  PHASE_OFFICIAL_SAMPLE_USAGE,
  type OetOfficialSampleLink,
} from "@/content/media/oet-official-samples";
import { COMPUTER_SAMPLE_FAQ } from "@/content/media/study-knowledge-base";
import { useAuth } from "@/lib/auth/auth-provider";
import type { OetProfession } from "@/lib/domain/types";
import { getProfessionLabel } from "@/lib/domain/professions";
import { loadUserProfile } from "@/lib/profile/service";

function SampleCard({ link }: { link: OetOfficialSampleLink }) {
  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <p className="text-[10px] font-semibold uppercase text-brand-primary">OET official</p>
      <h3 className="mt-1 font-semibold text-ink">{link.label}</h3>
      <p className="mt-1 text-xs text-ink-soft">
        Listening/Reading shared · import MP3 on{" "}
        <Link href="/listening/import" className="text-brand-primary hover:underline">
          Listening → Import
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <a
          href={link.paperUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-primary hover:underline"
        >
          Paper samples →
        </a>
        {link.computerUrl && (
          <a
            href={link.computerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-primary hover:underline"
          >
            Computer samples →
          </a>
        )}
      </div>
    </li>
  );
}

interface OetProfessionSamplesPanelProps {
  /** Show all 12 or match logged-in user profession */
  filterByProfile?: boolean;
  compact?: boolean;
}

export function OetProfessionSamplesPanel({
  filterByProfile = true,
  compact = false,
}: OetProfessionSamplesPanelProps) {
  const { session, loading } = useAuth();
  const [profession, setProfession] = useState<OetProfession | undefined>();
  const [showAll, setShowAll] = useState(!filterByProfile);

  useEffect(() => {
    if (!filterByProfile || loading) return;
    void loadUserProfile(session?.user?.id).then((p) =>
      setProfession(p?.profession as OetProfession | undefined),
    );
  }, [filterByProfile, loading, session?.user?.id]);

  const links = showAll ? OET_OFFICIAL_SAMPLE_LINKS : officialSamplesForProfession(profession);
  const professionLabel = profession ? getProfessionLabel(profession) : null;

  return (
    <section className="rounded-2xl border border-border bg-surface-muted/30 p-5">
      <h2 className="font-semibold text-ink">Official OET sample tests — all 12 professions</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Free downloads from{" "}
        <a href={OET_SAMPLE_HUB} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
          oet.com sample tests
        </a>
        . Paper ({""}
        <a href={OET_PAPER_HUB} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
          all 12 professions
        </a>
        ) and Computer ({""}
        <a href={OET_COMPUTER_HUB} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
          all 12 professions
        </a>
        ). Import MP3/PDF to your device — never hosted on our servers.
      </p>

      <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink-soft">
        <p className="font-medium text-ink">{COMPUTER_SAMPLE_FAQ.title}</p>
        <p className="mt-1">{COMPUTER_SAMPLE_FAQ.body}</p>
      </div>

      {filterByProfile && professionLabel && !showAll && (
        <p className="mt-2 text-sm text-ink">
          Matched to your profession: <strong>{professionLabel}</strong>
        </p>
      )}

      {filterByProfile && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs text-brand-primary hover:underline"
        >
          {showAll ? "Show my profession only" : "Show all 12 professions"}
        </button>
      )}

      {!compact && (
        <ul className="mt-4 space-y-2 text-xs text-ink-soft">
          {PHASE_OFFICIAL_SAMPLE_USAGE.map((row) => (
            <li key={row.phase}>
              <span className="font-medium text-ink">{row.phase}</span> — {row.uses} ·{" "}
              <Link href={row.coachRoute} className="text-brand-primary hover:underline">
                Open in app
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ul className={`grid gap-3 ${compact ? "mt-3" : "mt-4"} sm:grid-cols-2`}>
        {links.map((link) => (
          <SampleCard key={link.profession} link={link} />
        ))}
      </ul>
    </section>
  );
}
