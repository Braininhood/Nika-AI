import type { OetProfession, TargetGrades } from "./types";

export interface RegulatorOption {
  code: string;
  label: string;
  countryCode: string;
  countryLabel: string;
  professions: OetProfession[];
  officialUrl?: string;
}

export const REGULATORS: RegulatorOption[] = [
  {
    code: "NMC",
    label: "NMC (Nurses & Midwives)",
    countryCode: "UK",
    countryLabel: "United Kingdom",
    professions: ["nursing"],
    officialUrl: "https://www.nmc.org.uk/",
  },
  {
    code: "GMC",
    label: "GMC (Doctors)",
    countryCode: "UK",
    countryLabel: "United Kingdom",
    professions: ["medicine"],
    officialUrl: "https://www.gmc-uk.org/",
  },
  {
    code: "GPhC",
    label: "GPhC (Pharmacists)",
    countryCode: "UK",
    countryLabel: "United Kingdom",
    professions: ["pharmacy"],
    officialUrl: "https://www.pharmacyregulation.org/",
  },
  {
    code: "HCPC",
    label: "HCPC (Allied Health)",
    countryCode: "UK",
    countryLabel: "United Kingdom",
    professions: [
      "physiotherapy",
      "occupational_therapy",
      "radiography",
      "podiatry",
      "optometry",
      "dietetics",
      "speech_pathology",
    ],
    officialUrl: "https://www.hcpc-uk.org/",
  },
  {
    code: "GDC",
    label: "GDC (Dentists)",
    countryCode: "UK",
    countryLabel: "United Kingdom",
    professions: ["dentistry"],
    officialUrl: "https://www.gdc-uk.org/",
  },
  {
    code: "RCVS",
    label: "RCVS (Veterinary)",
    countryCode: "UK",
    countryLabel: "United Kingdom",
    professions: ["veterinary_science"],
    officialUrl: "https://www.rcvs.org.uk/",
  },
  {
    code: "AHPRA",
    label: "AHPRA (Australia)",
    countryCode: "AU",
    countryLabel: "Australia",
    professions: [
      "medicine",
      "nursing",
      "pharmacy",
      "dentistry",
      "physiotherapy",
      "occupational_therapy",
      "radiography",
      "podiatry",
      "optometry",
      "dietetics",
      "speech_pathology",
      "veterinary_science",
    ],
    officialUrl: "https://www.ahpra.gov.au/",
  },
  {
    code: "NMBI",
    label: "NMBI (Nurses & Midwives)",
    countryCode: "IE",
    countryLabel: "Ireland",
    professions: ["nursing"],
    officialUrl: "https://www.nmbi.ie/",
  },
  {
    code: "MEDICAL_COUNCIL_IE",
    label: "Medical Council (Doctors)",
    countryCode: "IE",
    countryLabel: "Ireland",
    professions: ["medicine"],
    officialUrl: "https://www.medicalcouncil.ie/",
  },
  {
    code: "NCNZ",
    label: "NCNZ (Nurses)",
    countryCode: "NZ",
    countryLabel: "New Zealand",
    professions: ["nursing"],
    officialUrl: "https://www.nursingcouncil.org.nz/",
  },
  {
    code: "MCNZ",
    label: "MCNZ (Doctors)",
    countryCode: "NZ",
    countryLabel: "New Zealand",
    professions: ["medicine"],
    officialUrl: "https://www.mcnz.org.nz/",
  },
  {
    code: "ECFMG",
    label: "ECFMG (IMG Doctors)",
    countryCode: "US",
    countryLabel: "United States",
    professions: ["medicine"],
    officialUrl: "https://www.ecfmg.org/",
  },
  {
    code: "US_NURSING",
    label: "State Nursing Board (USA)",
    countryCode: "US",
    countryLabel: "United States",
    professions: ["nursing"],
  },
  {
    code: "NNAS",
    label: "NNAS / Provincial (Canada)",
    countryCode: "CA",
    countryLabel: "Canada",
    professions: ["nursing"],
  },
  {
    code: "MCC",
    label: "MCC / CaRMS (Doctors)",
    countryCode: "CA",
    countryLabel: "Canada",
    professions: ["medicine"],
    officialUrl: "https://mcc.ca/",
  },
  {
    code: "OTHER",
    label: "Other / Not sure yet",
    countryCode: "OTHER",
    countryLabel: "Other",
    professions: [
      "medicine",
      "nursing",
      "pharmacy",
      "dentistry",
      "physiotherapy",
      "occupational_therapy",
      "radiography",
      "podiatry",
      "optometry",
      "dietetics",
      "speech_pathology",
      "veterinary_science",
    ],
  },
];

const REQUIREMENTS: Record<string, TargetGrades> = {
  NMC: {
    listening: "B",
    reading: "B",
    writing: "C+",
    speaking: "B",
    single_sitting: false,
  },
  GMC: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: false,
  },
  GPhC: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: false,
  },
  HCPC: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: false,
  },
  GDC: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: false,
  },
  RCVS: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: false,
  },
  AHPRA: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: false,
  },
  NMBI: {
    listening: "B",
    reading: "B",
    writing: "C+",
    speaking: "B",
    single_sitting: false,
  },
  MEDICAL_COUNCIL_IE: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: false,
  },
  NCNZ: {
    listening: "B",
    reading: "B",
    writing: "C+",
    speaking: "B",
    single_sitting: false,
  },
  MCNZ: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: false,
  },
  ECFMG: {
    listening: "B",
    reading: "B",
    writing: "C+",
    speaking: "B",
    single_sitting: true,
  },
  US_NURSING: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: true,
  },
  NNAS: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: false,
  },
  MCC: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: false,
  },
};

export const DEFAULT_TARGET_GRADES: TargetGrades = {
  listening: "B",
  reading: "B",
  writing: "B",
  speaking: "B",
  single_sitting: false,
};

export function getRegulatorsForProfession(
  profession: OetProfession,
): RegulatorOption[] {
  return REGULATORS.filter((r) => r.professions.includes(profession));
}

export function getTargetGrades(regulatorCode: string): TargetGrades {
  return REQUIREMENTS[regulatorCode] ?? DEFAULT_TARGET_GRADES;
}

export function getRegulator(code: string): RegulatorOption | undefined {
  return REGULATORS.find((r) => r.code === code);
}

export function formatTargetGradesSummary(grades: TargetGrades): string {
  const parts = [
    `L ${grades.listening}`,
    `R ${grades.reading}`,
    `W ${grades.writing}`,
    `S ${grades.speaking}`,
  ];
  const base = parts.join(" · ");
  return grades.single_sitting ? `${base} (single sitting)` : base;
}
