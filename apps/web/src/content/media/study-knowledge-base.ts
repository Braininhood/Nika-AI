import type { OetProfession, OetSkill } from "@/lib/domain/types";
import { PROFESSIONS } from "@/lib/domain/professions";

import {
  OET_COMPUTER_HUB,
  OET_OFFICIAL_SAMPLE_LINKS,
  OET_PAPER_HUB,
  OET_SAMPLE_HUB,
  PHASE_OFFICIAL_SAMPLE_USAGE,
} from "./oet-official-samples";

export type StudyPhase = 1 | 2 | 3 | "all";
export type KnowledgeCategory =
  | "official_hub"
  | "criteria_pdf"
  | "youtube"
  | "podcast"
  | "sample_test"
  | "import_workflow"
  | "layer_b"
  | "nika_tip";

export interface StudyKnowledgeEntry {
  id: string;
  phase: StudyPhase;
  skill: OetSkill | "all";
  category: KnowledgeCategory;
  title: string;
  summary: string;
  href?: string;
  tags: string[];
  /** Advice Nika can surface in Phase 6 RAG — grounded in this entry */
  nikaAdvice: string;
}

export const OET_READY_HUB = "https://oet.com/ready";
export const OET_FREE_RESOURCES_POST =
  "https://oet.com/post/free-study-resources-oet-preparation";

/** Official skill prep hubs (OET Ready — videos, FAQs, sample test links per skill). */
export const OET_SKILL_PREP_HUBS: Record<OetSkill, string> = {
  listening: "https://oet.com/ready/listening",
  reading: "https://oet.com/ready/reading",
  writing: "https://oet.com/ready/writing",
  speaking: "https://oet.com/ready/speaking",
};

export const OET_CRITERIA_PDFS = {
  writing:
    "https://cdn-aus.aglty.io/oet/pdf-files/Writing%20assessment%20criteria.pdf",
  speaking:
    "https://cdn-aus.aglty.io/oet/pdf-files/Speaking%20assessment%20criteria%20and%20level%20descriptors.pdf",
  writingGuide:
    "https://cdn-aus.aglty.io/oet/pdf-files/OET%20Ultimate%20Writing%20Guide.pdf",
  gradedSamples:
    "https://cdn-aus.aglty.io/oet/education/GradedCandidate%20Samples%20Writing%20Booklet.pdf",
} as const;

/** Computer sample tests do not record answers — OET FAQ (Jun 2026). */
export const COMPUTER_SAMPLE_FAQ = {
  title: "Computer sample tests do not save your answers",
  body: "On oet.com computer samples your responses are not recorded. Write answers on paper or in a notes app, then check them with the downloaded answer key or the matcher below.",
  href: OET_COMPUTER_HUB,
} as const;

export interface ImportChecklistItem {
  id: string;
  phase: StudyPhase;
  skill: OetSkill;
  label: string;
  detail: string;
  route: string;
  fileHint: string;
}

/** Shown after PLV import — routes user to the right in-app practice area. */
export function importChecklistForProfession(profession?: string): ImportChecklistItem[] {
  const label =
    PROFESSIONS.find((p) => p.code === profession)?.label ?? "your profession";

  return [
    {
      id: "writing-case-notes",
      phase: 1,
      skill: "writing",
      label: "Writing case notes → letter",
      detail: `Use the profession-specific Writing PDF (${label}) in guided or exam practice.`,
      route: "/writing/practice",
      fileHint: "Writing task PDF + case notes from sample pack",
    },
    {
      id: "writing-criteria",
      phase: 1,
      skill: "writing",
      label: "Writing criteria + graded samples",
      detail: "Compare your letter against official B/C samples and the six criteria PDF.",
      route: "/writing/learn",
      fileHint: "Writing assessment criteria PDF (download from OET guides tab)",
    },
    {
      id: "reading-key",
      phase: 2,
      skill: "reading",
      label: "Reading passages + answer key",
      detail: "Reading is shared across all 12 professions — use any sample's Reading PDF and key.",
      route: "/reading",
      fileHint: "Reading questions PDF + answer key PDF",
    },
    {
      id: "listening-mp3",
      phase: 3,
      skill: "listening",
      label: "Listening MP3 practice",
      detail: "Listening audio is shared — one MP3 works for every profession. Replay in exam mode.",
      route: "/listening",
      fileHint: "Listening MP3 from sample pack",
    },
    {
      id: "answer-key-match",
      phase: 3,
      skill: "listening",
      label: "Check L/R answers against official key",
      detail: "Paste your recorded answers (especially for computer samples) and compare to the imported key.",
      route: "/listening/import#answer-key-matcher",
      fileHint: "Answer key PDF (imported with pack)",
    },
    {
      id: "writing-drills",
      phase: 1,
      skill: "writing",
      label: "Content-selection drills",
      detail: `Train include/omit and purpose using ${label} case-note patterns before full letters.`,
      route: "/writing/learn/drills",
      fileHint: "Case notes structure from official Writing PDF",
    },
  ];
}

/** Layer A catalog — links/embeds only; for Nika RAG grounding in Phase 6. */
export const STUDY_KNOWLEDGE_BASE: StudyKnowledgeEntry[] = [
  {
    id: "ready-hub",
    phase: "all",
    skill: "all",
    category: "official_hub",
    title: "OET Ready — preparation hub",
    summary: "Central hub: skill pages, sample tests, study guide, intro courses.",
    href: OET_READY_HUB,
    tags: ["oet-official", "layer-a"],
    nikaAdvice:
      "Start at oet.com/ready for the interactive study guide — it links every skill and free sample test.",
  },
  {
    id: "free-resources-post",
    phase: "all",
    skill: "all",
    category: "official_hub",
    title: "Free OET study resources guide",
    summary: "Intro course, study guide PDF, YouTube, and sample tests in one article.",
    href: OET_FREE_RESOURCES_POST,
    tags: ["oet-official", "layer-a"],
    nikaAdvice:
      "OET's free resources post walks through intro course → study guide → YouTube → sample tests in order.",
  },
  ...(["listening", "reading", "writing", "speaking"] as const).map(
    (skill): StudyKnowledgeEntry => ({
      id: `prep-hub-${skill}`,
      phase: skill === "writing" ? 1 : skill === "reading" ? 2 : skill === "listening" ? 3 : "all",
      skill,
      category: "official_hub",
      title: `OET ${skill.charAt(0).toUpperCase() + skill.slice(1)} preparation hub`,
      summary: `Official format overview, FAQs, selected videos, and sample test links for ${skill}.`,
      href: OET_SKILL_PREP_HUBS[skill],
      tags: ["oet-official", "layer-a", skill],
      nikaAdvice: `Open Study → Materials → official ${skill} hub on oet.com. Read the format overview before you practise.`,
    }),
  ),
  {
    id: "criteria-writing",
    phase: 1,
    skill: "writing",
    category: "criteria_pdf",
    title: "Writing assessment criteria (PDF)",
    summary: "Six criteria: Purpose, Content, Conciseness, Genre, Organisation, Language.",
    href: OET_CRITERIA_PDFS.writing,
    tags: ["criteria", "writing", "layer-a"],
    nikaAdvice:
      "Every writing coaching tip maps to one of the six criteria in this PDF — download and keep offline.",
  },
  {
    id: "criteria-speaking",
    phase: "all",
    skill: "speaking",
    category: "criteria_pdf",
    title: "Speaking assessment criteria (PDF)",
    summary: "Linguistic and Clinical Communication criteria with level descriptors.",
    href: OET_CRITERIA_PDFS.speaking,
    tags: ["criteria", "speaking", "layer-a"],
    nikaAdvice: "Speaking is scored on linguistic + clinical communication — this PDF defines both.",
  },
  {
    id: "writing-guide-pdf",
    phase: 1,
    skill: "writing",
    category: "criteria_pdf",
    title: "OET Ultimate Writing Guide (PDF)",
    summary: "Official letter layout, case-note selection, and assessor expectations.",
    href: OET_CRITERIA_PDFS.writingGuide,
    tags: ["writing", "layer-a"],
    nikaAdvice: "Read the Ultimate Writing Guide before your first guided letter — it shows layout and planning.",
  },
  {
    id: "graded-samples-pdf",
    phase: 1,
    skill: "writing",
    category: "criteria_pdf",
    title: "Graded Writing Samples booklet (PDF)",
    summary: "Official B/C exemplar letters with assessor comments across professions.",
    href: OET_CRITERIA_PDFS.gradedSamples,
    tags: ["writing", "layer-a"],
    nikaAdvice: "Compare your draft to Grade B samples in this booklet — we also have in-app B/C pairs per profession.",
  },
  {
    id: "sample-tests-hub",
    phase: "all",
    skill: "all",
    category: "sample_test",
    title: "Official sample tests",
    summary: "Paper (12 professions) + Computer (12 professions). L/R/Listening shared; Writing/Speaking per profession.",
    href: OET_SAMPLE_HUB,
    tags: ["sample-test", "layer-a", "plv"],
    nikaAdvice:
      "Study → Materials → Sample tests → download your profession's pack from oet.com. Listening and Reading are the same for all professions.",
  },
  {
    id: "computer-sample-faq",
    phase: "all",
    skill: "all",
    category: "nika_tip",
    title: COMPUTER_SAMPLE_FAQ.title,
    summary: COMPUTER_SAMPLE_FAQ.body,
    href: COMPUTER_SAMPLE_FAQ.href,
    tags: ["computer-sample", "faq"],
    nikaAdvice: COMPUTER_SAMPLE_FAQ.body,
  },
  {
    id: "podcast-bbc-inside-health",
    phase: 3,
    skill: "listening",
    category: "podcast",
    title: "Inside Health (BBC, UK)",
    summary: "OET-recommended consultation-style listening for Part A UK accent exposure.",
    href: "https://www.bbc.co.uk/programmes/b006qshd",
    tags: ["accent:UK", "podcast", "part-a"],
    nikaAdvice: "BBC Inside Health mirrors Part A consultation tone — listen for note-completion detail and spelling.",
  },
  {
    id: "podcast-abc-health-report",
    phase: 3,
    skill: "listening",
    category: "podcast",
    title: "Health Report (ABC, AU)",
    summary: "Australian medical journalism — good for AU accent and Part C inference.",
    href: "https://www.abc.net.au/listen/programs/healthreport",
    tags: ["accent:AU", "podcast"],
    nikaAdvice: "ABC Health Report trains AU accent — useful if your destination is Australia or AHPRA.",
  },
  {
    id: "podcast-cbc-white-coat",
    phase: 3,
    skill: "listening",
    category: "podcast",
    title: "White Coat, Black Art (CBC, CA)",
    summary: "Canadian healthcare stories — CA accent rotation for Listening Part B/C.",
    href: "https://www.cbc.ca/radio/whitecoat",
    tags: ["accent:CA", "podcast"],
    nikaAdvice: "CBC White Coat, Black Art adds Canadian accent variety — pair with our CA pharmacy and OH&S blocks.",
  },
  {
    id: "youtube-official-channel",
    phase: "all",
    skill: "all",
    category: "youtube",
    title: "OET Official YouTube",
    summary: "Masterclasses and on-demand lessons for all four skills.",
    href: "https://www.youtube.com/@OfficialOET",
    tags: ["youtube", "layer-a"],
    nikaAdvice: "Search Official OET for 'Listening Part A', 'Reading Part B', etc. — embeds in Study resources tab.",
  },
  {
    id: "layer-b-listening-pack",
    phase: 3,
    skill: "listening",
    category: "layer_b",
    title: "OET Coach listening practice pack",
    summary: "Original practice audio for daily drills — not official OET recordings.",
    href: "/listening/packs",
    tags: ["layer-b", "offline"],
    nikaAdvice:
      "Study → Listening → Packs → Download pack. Wait until complete, then open Part A, B, or C.",
  },
  {
    id: "layer-b-writing-drills",
    phase: 1,
    skill: "writing",
    category: "layer_b",
    title: "Profession-tagged content-selection drills",
    summary: "Include/omit and purpose drills shaped like official case-note tasks — all 12 professions.",
    href: "/writing/learn/drills",
    tags: ["layer-b", "writing", "all-professions"],
    nikaAdvice:
      "Do content-selection drills before full letters — they mirror official case-note structures per profession.",
  },
  ...PHASE_OFFICIAL_SAMPLE_USAGE.map(
    (row, i): StudyKnowledgeEntry => ({
      id: `phase-usage-${i}`,
      phase: (i + 1) as StudyPhase,
      skill: row.coachRoute.includes("writing")
        ? "writing"
        : row.coachRoute.includes("reading")
          ? "reading"
          : "listening",
      category: "import_workflow",
      title: row.phase,
      summary: row.uses,
      href: row.coachRoute,
      tags: ["import-checklist", "phase"],
      nikaAdvice: `${row.phase}: ${row.uses}. Then open ${row.coachRoute} in the app.`,
    }),
  ),
];

export function knowledgeForPhase(phase: StudyPhase): StudyKnowledgeEntry[] {
  return STUDY_KNOWLEDGE_BASE.filter((e) => e.phase === phase || e.phase === "all");
}

export function knowledgeForSkill(skill: OetSkill | "all"): StudyKnowledgeEntry[] {
  return STUDY_KNOWLEDGE_BASE.filter((e) => e.skill === skill || e.skill === "all");
}

export function knowledgeForProfession(profession: OetProfession): StudyKnowledgeEntry[] {
  const sample = OET_OFFICIAL_SAMPLE_LINKS.find((l) => l.profession === profession);
  const base = knowledgeForSkill("all");
  if (!sample) return base;
  return [
    ...base,
    {
      id: `sample-paper-${profession}`,
      phase: "all",
      skill: "all",
      category: "sample_test",
      title: `Paper sample — ${sample.label}`,
      summary: sample.includes.join(" · "),
      href: sample.paperUrl,
      tags: ["sample-test", profession, "paper"],
      nikaAdvice: `Materials → ${sample.label} → download paper sample from oet.com. Import MP3 and PDFs via Listening → Import.`,
    },
    {
      id: `sample-computer-${profession}`,
      phase: "all",
      skill: "all",
      category: "sample_test",
      title: `Computer sample — ${sample.label}`,
      summary: `${COMPUTER_SAMPLE_FAQ.body} Keys and role cards downloadable.`,
      href: sample.computerUrl ?? OET_COMPUTER_HUB,
      tags: ["sample-test", profession, "computer"],
      nikaAdvice: `Computer sample for ${sample.label}: record answers separately, then use the answer-key matcher.`,
    },
  ];
}

/** Flat text chunks for Nika offline search — user-facing tips only. */
export function nikaKnowledgeChunks(): { id: string; text: string; tags: string[] }[] {
  return STUDY_KNOWLEDGE_BASE.map((e) => ({
    id: e.id,
    text: `${e.title}. ${e.nikaAdvice}`,
    tags: e.tags,
  }));
}

export { OET_PAPER_HUB, OET_COMPUTER_HUB, OET_SAMPLE_HUB };
