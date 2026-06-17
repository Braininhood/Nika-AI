import type { ListeningAccent } from "@/content/listening/types";
import type { OetAccent } from "@/content/speaking/types";

export type AccentCode = ListeningAccent | OetAccent;

const ACCENT_LABELS: Record<AccentCode, string> = {
  UK: "British English",
  AU: "Australian English",
  US: "American English",
  IE: "Irish English",
  NZ: "New Zealand English",
  CA: "Canadian English",
  mixed: "Mixed / multicultural English",
};

export function accentLabel(code?: AccentCode): string {
  if (!code) return "";
  return ACCENT_LABELS[code] ?? code;
}
