import type { OetSkill } from "@/lib/domain/types";

import { OET_OFFICIAL_SAMPLE_LINKS, OET_SAMPLE_HUB } from "./oet-official-samples";
import {
  COMPUTER_SAMPLE_FAQ,
  OET_CRITERIA_PDFS,
  OET_FREE_RESOURCES_POST,
  OET_READY_HUB,
  OET_SKILL_PREP_HUBS,
} from "./study-knowledge-base";

export type StudyMediaKind = "youtube" | "oet_article" | "oet_download" | "podcast" | "supabase_pack";

export interface StudyMediaItem {
  id: string;
  skill: OetSkill | "all";
  title: string;
  description?: string;
  kind: StudyMediaKind;
  /** YouTube video ID for embed (never re-host audio) */
  youtubeId?: string;
  href: string;
  accent?: string;
  locale?: string;
  durationMinutes?: number;
}

/** Curated Layer A references + embeddable OET Official videos — links only, no ripped files. */
export const STUDY_MEDIA_CATALOG: StudyMediaItem[] = [
  {
    id: "oet-ready-hub",
    skill: "all",
    title: "OET Ready — preparation hub",
    description: "Interactive study guide, skill pages, intro courses, sample tests.",
    kind: "oet_article",
    href: OET_READY_HUB,
  },
  {
    id: "oet-free-resources",
    skill: "all",
    title: "Free OET study resources (official guide)",
    description: "Intro course → study guide → YouTube → sample tests workflow.",
    kind: "oet_article",
    href: OET_FREE_RESOURCES_POST,
  },
  {
    id: "oet-listening-hub",
    skill: "listening",
    title: "OET Listening preparation hub",
    description: "Official skill page — format, FAQs, videos, sample tests.",
    kind: "oet_article",
    href: OET_SKILL_PREP_HUBS.listening,
  },
  {
    id: "oet-listening-part-a-guide",
    skill: "listening",
    title: "Listening Part A — complete guide",
    description: "Note completion format, accents (UK/US/AU/NZ), podcast recommendations.",
    kind: "oet_article",
    href: "https://oet.com/post/listening-part-a-the-complete-guide",
    durationMinutes: 12,
  },
  {
    id: "oet-listening-part-b-guide",
    skill: "listening",
    title: "Listening Part B — complete guide",
    description: "Short workplace extracts — gist and next action.",
    kind: "oet_article",
    href: "https://oet.com/post/listening-part-b-the-complete-guide",
    durationMinutes: 8,
  },
  {
    id: "oet-listening-part-c-guide",
    skill: "listening",
    title: "Listening Part C — complete guide",
    description: "Presentations and interviews — inference and attitude.",
    kind: "oet_article",
    href: "https://oet.com/post/listening-part-c-the-complete-guide",
    durationMinutes: 15,
  },
  {
    id: "oet-sample-tests",
    skill: "listening",
    title: "Official sample tests hub",
    description: "Paper (12 professions) + Computer (12 professions) — MP3, PDF, keys.",
    kind: "oet_download",
    href: OET_SAMPLE_HUB,
  },
  ...OET_OFFICIAL_SAMPLE_LINKS.flatMap((link) => [
    {
      id: `oet-paper-${link.profession}`,
      skill: "listening" as const,
      title: `Paper sample — ${link.label}`,
      description: "Questions PDF + answer key + Listening MP3. L/R shared across professions.",
      kind: "oet_download" as const,
      href: link.paperUrl,
    },
    ...(link.computerUrl
      ? [
          {
            id: `oet-computer-${link.profession}`,
            skill: "all" as const,
            title: `Computer sample — ${link.label}`,
            description: `${COMPUTER_SAMPLE_FAQ.title} Keys and role cards downloadable.`,
            kind: "oet_download" as const,
            href: link.computerUrl,
          },
        ]
      : []),
  ]),
  {
    id: "oet-youtube-channel",
    skill: "all",
    title: "OET Official YouTube",
    description: "Masterclasses and on-demand lessons for all four skills.",
    kind: "youtube",
    href: "https://www.youtube.com/@OfficialOET",
  },
  {
    id: "oet-youtube-listening-part-a",
    skill: "listening",
    title: "Listening Part A — Official OET videos",
    description: "Search Official OET channel for Part A note-completion strategy.",
    kind: "youtube",
    href: "https://www.youtube.com/@OfficialOET/search?query=listening+part+a",
  },
  {
    id: "oet-youtube-listening-part-b",
    skill: "listening",
    title: "Listening Part B — Official OET videos",
    description: "Workplace extracts — gist and next action.",
    kind: "youtube",
    href: "https://www.youtube.com/@OfficialOET/search?query=listening+part+b",
  },
  {
    id: "oet-youtube-listening-part-c",
    skill: "listening",
    title: "Listening Part C — Official OET videos",
    description: "Presentations and interviews — inference and attitude.",
    kind: "youtube",
    href: "https://www.youtube.com/@OfficialOET/search?query=listening+part+c",
  },
  {
    id: "oet-youtube-reading",
    skill: "reading",
    title: "Reading sub-test — Official OET videos",
    kind: "youtube",
    href: "https://www.youtube.com/@OfficialOET/search?query=reading+oet",
  },
  {
    id: "oet-youtube-writing",
    skill: "writing",
    title: "Writing sub-test — Official OET videos",
    kind: "youtube",
    href: "https://www.youtube.com/@OfficialOET/search?query=writing+oet",
  },
  {
    id: "oet-youtube-speaking",
    skill: "speaking",
    title: "Speaking sub-test — Official OET videos",
    kind: "youtube",
    href: "https://www.youtube.com/@OfficialOET/search?query=speaking+oet",
  },
  {
    id: "podcast-inside-health",
    skill: "listening",
    title: "Inside Health (BBC, UK accent)",
    description: "Recommended by OET for Part A consultation listening practice.",
    kind: "podcast",
    href: "https://www.bbc.co.uk/programmes/b006qshd",
    accent: "UK",
    locale: "United Kingdom",
  },
  {
    id: "podcast-health-report-au",
    skill: "listening",
    title: "Health Report (ABC, AU accent)",
    description: "Australian medical journalism — Part C inference and AU accent.",
    kind: "podcast",
    href: "https://www.abc.net.au/listen/programs/healthreport",
    accent: "AU",
    locale: "Australia",
  },
  {
    id: "podcast-cbc-white-coat",
    skill: "listening",
    title: "White Coat, Black Art (CBC, CA accent)",
    description: "Canadian healthcare stories — CA accent rotation for Part B/C.",
    kind: "podcast",
    href: "https://www.cbc.ca/radio/whitecoat",
    accent: "CA",
    locale: "Canada",
  },
  {
    id: "oet-reading-hub",
    skill: "reading",
    title: "OET Reading preparation hub",
    kind: "oet_article",
    href: OET_SKILL_PREP_HUBS.reading,
  },
  {
    id: "oet-writing-hub",
    skill: "writing",
    title: "OET Writing preparation hub",
    kind: "oet_article",
    href: OET_SKILL_PREP_HUBS.writing,
  },
  {
    id: "oet-speaking-hub",
    skill: "speaking",
    title: "OET Speaking preparation hub",
    kind: "oet_article",
    href: OET_SKILL_PREP_HUBS.speaking,
  },
  {
    id: "oet-writing-criteria-pdf",
    skill: "writing",
    title: "Writing assessment criteria (PDF)",
    description: "Six criteria — Purpose, Content, Conciseness, Genre, Organisation, Language.",
    kind: "oet_download",
    href: OET_CRITERIA_PDFS.writing,
  },
  {
    id: "oet-speaking-criteria-pdf",
    skill: "speaking",
    title: "Speaking assessment criteria (PDF)",
    description: "Linguistic + Clinical Communication criteria and level descriptors.",
    kind: "oet_download",
    href: OET_CRITERIA_PDFS.speaking,
  },
  {
    id: "oet-writing-guide-pdf",
    skill: "writing",
    title: "OET Ultimate Writing Guide (PDF)",
    kind: "oet_download",
    href: OET_CRITERIA_PDFS.writingGuide,
  },
  {
    id: "oet-graded-samples-pdf",
    skill: "writing",
    title: "Graded Writing Samples booklet (PDF)",
    description: "Official B/C exemplar letters with assessor comments.",
    kind: "oet_download",
    href: OET_CRITERIA_PDFS.gradedSamples,
  },
  {
    id: "coach-listening-pack",
    skill: "listening",
    title: "OET Coach listening practice pack",
    description: "Original scripts and narration for daily drills — download to your device.",
    kind: "supabase_pack",
    href: "/listening/packs",
    durationMinutes: 40,
  },
];

export function mediaForSkill(skill: OetSkill | "all"): StudyMediaItem[] {
  return STUDY_MEDIA_CATALOG.filter((m) => m.skill === skill || m.skill === "all");
}

export function listeningAccentResources(): StudyMediaItem[] {
  return STUDY_MEDIA_CATALOG.filter(
    (m) => m.skill === "listening" && (m.accent || m.kind === "podcast"),
  );
}

export function officialDownloadResources(): StudyMediaItem[] {
  return STUDY_MEDIA_CATALOG.filter((m) => m.kind === "oet_download");
}

export function masterclassResources(): StudyMediaItem[] {
  return STUDY_MEDIA_CATALOG.filter(
    (m) =>
      m.id.startsWith("oet-") &&
      (m.id.endsWith("-hub") || m.id === "oet-ready-hub" || m.id === "oet-free-resources"),
  );
}
