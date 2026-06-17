import { apiUrl } from "@/lib/api/base-url";

import type { MlReadinessPrediction } from "./types";

export async function recordTrainingOutcome(
  accessToken: string,
  body: { examReady: boolean; consecutiveMockPasses: number },
): Promise<void> {
  try {
    await fetch(apiUrl("/api/v1/readiness/record-outcome"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        examReady: body.examReady,
        consecutiveMockPasses: body.consecutiveMockPasses,
      }),
    });
  } catch {
    // Best-effort — local readiness state still updates.
  }
}

export async function fetchMlReadinessPrediction(
  accessToken: string,
): Promise<MlReadinessPrediction | null> {
  try {
    const res = await fetch(apiUrl("/api/v1/readiness/predict"), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      probability?: number;
      model?: string;
      features?: Record<string, number>;
    };
    if (typeof data.probability !== "number") return null;
    return {
      probability: data.probability,
      model: data.model ?? "gb-v1-bootstrap",
    };
  } catch {
    return null;
  }
}
