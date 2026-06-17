import { apiUrl } from "@/lib/api/base-url";

import type { DiagnosticSessionState } from "./types";

export async function startDiagnosticSession(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(apiUrl("/api/v1/diagnostic/start"), {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { session_id: string };
    return data.session_id;
  } catch {
    return null;
  }
}

export async function submitDiagnosticAnswer(
  accessToken: string,
  sessionId: string,
  answer: {
    skill: string;
    itemId: string;
    selectedIndex: number;
    tier: number;
    tag: string;
  },
): Promise<void> {
  try {
    await fetch(apiUrl(`/api/v1/diagnostic/${sessionId}/answer`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        skill: answer.skill,
        item_id: answer.itemId,
        selected_index: answer.selectedIndex,
        tier: answer.tier,
        tag: answer.tag,
      }),
    });
  } catch {
    // Best-effort sync — local session remains source of truth offline.
  }
}

export async function submitDiagnosticToApi(
  accessToken: string,
  sessionId: string,
  localSession: DiagnosticSessionState,
): Promise<{ skill_map: Record<string, unknown> } | null> {
  const answers = Object.values(localSession.blocks).flatMap((block) =>
    block
      ? block.answers.map((a) => ({
          skill: a.skill,
          item_id: a.itemId,
          selected_index: a.selectedIndex,
          tier: a.tier,
          tag: a.tag,
        }))
      : [],
  );

  if (answers.length === 0) return null;

  try {
    const res = await fetch(apiUrl(`/api/v1/diagnostic/${sessionId}/submit`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) return null;
    return res.json() as Promise<{ skill_map: Record<string, unknown> }>;
  } catch {
    return null;
  }
}
