import type { OetProfession } from "@/lib/domain/types";

/** Profession-appropriate letter sign-off placeholder for guided writing. */
export const PROFESSION_SIGN_OFFS: Record<OetProfession, string> = {
  medicine: "[Doctor name]",
  nursing: "[Nurse name]",
  pharmacy: "[Pharmacist name]",
  dentistry: "[Dentist name]",
  physiotherapy: "[Physiotherapist name]",
  occupational_therapy: "[Occupational therapist name]",
  podiatry: "[Podiatrist name]",
  optometry: "[Optometrist name]",
  dietetics: "[Dietitian name]",
  radiography: "[Radiographer name]",
  speech_pathology: "[Speech pathologist name]",
  veterinary_science: "[Veterinary surgeon name]",
};

export function signOffForProfession(profession: string): string {
  return PROFESSION_SIGN_OFFS[profession as OetProfession] ?? "[Your name and role]";
}
