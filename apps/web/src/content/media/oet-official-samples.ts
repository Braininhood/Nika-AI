import type { OetProfession } from "@/lib/domain/types";
import { PROFESSIONS } from "@/lib/domain/professions";

/** OET.com URL slug per profession (verified against oet.com sample test pages). */
export const OET_PROFESSION_SLUGS: Record<OetProfession, string> = {
  medicine: "medicine",
  nursing: "nursing",
  pharmacy: "pharmacy",
  dentistry: "dentistry",
  physiotherapy: "physiotherapy",
  occupational_therapy: "occupational-therapy",
  podiatry: "podiatry",
  optometry: "optometry",
  dietetics: "dietetics",
  radiography: "radiography",
  speech_pathology: "speech-pathology",
  veterinary_science: "veterinary-science",
};

export const OET_PAPER_HUB = "https://oet.com/ready/sample-tests/oet-test-on-paper";
export const OET_COMPUTER_HUB = "https://oet.com/ready/sample-tests/oet-test-on-computer";
export const OET_SAMPLE_HUB = "https://oet.com/ready/sample-tests";

/** All 12 professions have paper samples per oet.com (Jun 2026). */
export const OET_PAPER_PROFESSIONS: OetProfession[] = PROFESSIONS.map((p) => p.code);

/**
 * Computer samples — all 12 listed on oet.com computer hub (Jun 2026).
 * Listening/Reading audio is shared across professions; Writing/Speaking vary.
 */
export const OET_COMPUTER_PROFESSIONS: OetProfession[] = [...OET_PAPER_PROFESSIONS];

export interface OetOfficialSampleLink {
  profession: OetProfession;
  label: string;
  paperUrl: string;
  computerUrl: string | null;
  /** Listening + Reading are identical for all professions */
  listeningReadingShared: boolean;
  /** What to download from each sample pack */
  includes: string[];
}

function sampleLink(profession: OetProfession): OetOfficialSampleLink {
  const slug = OET_PROFESSION_SLUGS[profession];
  const label = PROFESSIONS.find((p) => p.code === profession)?.label ?? profession;
  const hasComputer = OET_COMPUTER_PROFESSIONS.includes(profession);

  return {
    profession,
    label,
    paperUrl: `${OET_PAPER_HUB}/${slug}`,
    computerUrl: hasComputer ? `${OET_COMPUTER_HUB}/${slug}` : null,
    listeningReadingShared: true,
    includes: [
      "Listening MP3 (shared L/R — any profession pack works)",
      "Reading PDF + answer key",
      "Writing case notes + task (profession-specific)",
      "Speaking role cards (profession-specific)",
    ],
  };
}

export const OET_OFFICIAL_SAMPLE_LINKS: OetOfficialSampleLink[] = OET_PAPER_PROFESSIONS.map(
  sampleLink,
);

export function officialSamplesForProfession(
  profession?: string,
): OetOfficialSampleLink[] {
  if (!profession) return OET_OFFICIAL_SAMPLE_LINKS;
  const link = OET_OFFICIAL_SAMPLE_LINKS.find((l) => l.profession === profession);
  return link ? [link] : OET_OFFICIAL_SAMPLE_LINKS;
}

/** Phase 1–3: what each phase uses from official samples */
export const PHASE_OFFICIAL_SAMPLE_USAGE = [
  {
    phase: "Phase 1 — Writing",
    uses: "Writing case notes PDF, criteria PDFs, graded samples booklet",
    coachRoute: "/writing/practice",
  },
  {
    phase: "Phase 2 — Reading",
    uses: "Reading passages PDF + answer key (shared across professions)",
    coachRoute: "/reading",
  },
  {
    phase: "Phase 3 — Listening",
    uses: "Listening MP3 + answer key — import on your device",
    coachRoute: "/listening/import",
  },
] as const;
