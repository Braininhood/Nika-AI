import { describe, expect, it } from "vitest";

import type { OutboxEntry } from "./types";

describe("outbox types", () => {
  it("accepts valid outbox entry shape", () => {
    const entry: OutboxEntry = {
      id: "test-id",
      type: "PROGRESS_SYNC",
      payload: { foo: "bar" },
      createdAt: Date.now(),
      retries: 0,
    };
    expect(entry.type).toBe("PROGRESS_SYNC");
  });
});
