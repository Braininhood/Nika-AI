"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { SecondaryActionButton } from "@/components/ui/secondary-action-button";
import {
  OET_OFFICIAL_SAMPLE_LINKS,
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
        Shared listening &amp; reading · import audio on{" "}
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
  /** When nested inside Study resources, skip outer collapsible */
  embedded?: boolean;
}

function PanelBody({
  filterByProfile,
  compact,
  professionLabel,
  showAll,
  setShowAll,
  links,
}: {
  filterByProfile: boolean;
  compact: boolean;
  professionLabel: string | null;
  showAll: boolean;
  setShowAll: (fn: (v: boolean) => boolean) => void;
  links: OetOfficialSampleLink[];
}) {
  return (
    <>
      <p className="text-sm text-ink-soft">
        Download sample tests from{" "}
        <a href={OET_SAMPLE_HUB} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
          oet.com
        </a>
        . Paper and computer formats cover all 12 professions — import listening files into the app
        when you are ready to practise.
      </p>

      <CollapsibleSection
        title={COMPUTER_SAMPLE_FAQ.title}
        subtitle="Tip for computer-format samples on oet.com"
        defaultOpen={false}
        variant="accent"
      >
        <p className="text-sm text-ink-soft">{COMPUTER_SAMPLE_FAQ.body}</p>
      </CollapsibleSection>

      {filterByProfile && professionLabel && !showAll && (
        <p className="mt-3 text-sm text-ink">
          Matched to your profession: <strong>{professionLabel}</strong>
        </p>
      )}

      {filterByProfile && (
        <SecondaryActionButton className="mt-3" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show my profession only" : "Show all 12 professions"}
        </SecondaryActionButton>
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
    </>
  );
}

export function OetProfessionSamplesPanel({
  filterByProfile = true,
  compact = false,
  embedded = false,
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

  const body = (
    <PanelBody
      filterByProfile={filterByProfile}
      compact={compact}
      professionLabel={professionLabel}
      showAll={showAll}
      setShowAll={setShowAll}
      links={links}
    />
  );

  if (embedded) {
    return body;
  }

  return (
    <CollapsibleSection
      title="Official OET sample tests"
      subtitle="Paper & computer samples for all 12 professions"
      defaultOpen={false}
    >
      {body}
    </CollapsibleSection>
  );
}
