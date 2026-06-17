import { apiUrl } from "@/lib/api/base-url";

export async function translateWord(
  text: string,
  targetLang: string,
  accessToken?: string,
): Promise<{ text: string; provider?: string; error?: string }> {
  if (!accessToken || !navigator.onLine) {
    return { text, error: "Sign in and go online to translate." };
  }

  const res = await fetch(apiUrl("/api/v1/vocabulary/translate"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ text, target_lang: targetLang, source_lang: "EN" }),
  });

  if (!res.ok) {
    return { text, error: "Translation failed." };
  }

  return res.json();
}

export async function explainWord(
  word: string,
  accessToken?: string,
  context?: string,
  profession?: string,
): Promise<{ explanation: string; provider?: string }> {
  if (!accessToken || !navigator.onLine) {
    return {
      explanation: `"${word}" — add your own note, or sign in online for Nika's OET explanation.`,
      provider: "offline",
    };
  }

  const res = await fetch(apiUrl("/api/v1/vocabulary/explain"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ word, context, profession }),
  });

  if (!res.ok) {
    return { explanation: `Could not explain "${word}" right now.`, provider: "error" };
  }

  return res.json();
}
