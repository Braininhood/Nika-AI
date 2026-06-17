import type { OetProfession } from "./types";

export interface ProfessionOption {
  code: OetProfession;
  label: string;
  shortLabel: string;
  /** Visual icon for profession picker (matches OET onboarding design) */
  icon: string;
  iconBg: string;
}

export const PROFESSIONS: ProfessionOption[] = [
  { code: "medicine", label: "Medicine", shortLabel: "Medicine", icon: "🩺", iconBg: "bg-emerald-100" },
  { code: "nursing", label: "Nursing", shortLabel: "Nursing", icon: "💗", iconBg: "bg-orange-100" },
  { code: "pharmacy", label: "Pharmacy", shortLabel: "Pharmacy", icon: "💊", iconBg: "bg-rose-100" },
  { code: "dentistry", label: "Dentistry", shortLabel: "Dentistry", icon: "🦷", iconBg: "bg-sky-100" },
  { code: "physiotherapy", label: "Physiotherapy", shortLabel: "Physio", icon: "🦾", iconBg: "bg-violet-100" },
  {
    code: "occupational_therapy",
    label: "Occupational Therapy",
    shortLabel: "OT",
    icon: "🤝",
    iconBg: "bg-amber-100",
  },
  { code: "podiatry", label: "Podiatry", shortLabel: "Podiatry", icon: "👣", iconBg: "bg-orange-100" },
  { code: "optometry", label: "Optometry", shortLabel: "Optometry", icon: "👁", iconBg: "bg-yellow-100" },
  { code: "dietetics", label: "Dietetics", shortLabel: "Dietetics", icon: "🥗", iconBg: "bg-lime-100" },
  { code: "radiography", label: "Radiography", shortLabel: "Radiography", icon: "🩻", iconBg: "bg-teal-100" },
  {
    code: "speech_pathology",
    label: "Speech Pathology",
    shortLabel: "Speech",
    icon: "🗣",
    iconBg: "bg-cyan-100",
  },
  {
    code: "veterinary_science",
    label: "Veterinary Science",
    shortLabel: "Veterinary",
    icon: "🐾",
    iconBg: "bg-purple-100",
  },
];

export function getProfessionLabel(code: OetProfession): string {
  return PROFESSIONS.find((p) => p.code === code)?.label ?? code;
}

export function getProfessionShortLabel(code: OetProfession): string {
  return PROFESSIONS.find((p) => p.code === code)?.shortLabel ?? code;
}
