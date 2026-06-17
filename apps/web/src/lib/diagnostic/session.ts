import { db, getActiveUser } from "@/lib/db";
import type { DiagnosticSessionRecord } from "@/lib/db/types";

import type { DiagnosticSessionState } from "./types";

export async function loadDiagnosticSession(): Promise<DiagnosticSessionState | null> {
  const user = await getActiveUser();
  if (!user) return null;
  const record = await db.diagnosticSessions.get(user.id);
  return (record?.state as unknown as DiagnosticSessionState) ?? null;
}

export async function saveDiagnosticSession(state: DiagnosticSessionState): Promise<void> {
  const user = await getActiveUser();
  if (!user) return;
  const record: DiagnosticSessionRecord = {
    userId: user.id,
    sessionId: state.sessionId,
    state: state as unknown as Record<string, unknown>,
    updatedAt: Date.now(),
  };
  await db.diagnosticSessions.put(record);
}

export async function clearDiagnosticSession(): Promise<void> {
  const user = await getActiveUser();
  if (!user) return;
  await db.diagnosticSessions.delete(user.id);
}

export function createSession(userId: string): DiagnosticSessionState {
  return {
    sessionId: crypto.randomUUID(),
    userId,
    step: "intro",
    blocks: {},
    selfReport: {},
    status: "in_progress",
    updatedAt: Date.now(),
  };
}
