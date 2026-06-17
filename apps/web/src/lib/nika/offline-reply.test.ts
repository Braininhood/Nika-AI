import { describe, expect, it } from "vitest";

import { offlineNikaReply } from "@/lib/nika/offline-reply";

describe("offline nika reply", () => {
  it("refuses off-topic offline", async () => {
    const res = await offlineNikaReply("best pizza recipe", { weakTags: [] });
    expect(res.refused).toBe(true);
  });

  it("answers OET timing from knowledge base", async () => {
    const res = await offlineNikaReply("How long is listening part A?", { weakTags: [] });
    expect(res.refused).toBe(false);
    expect(res.reply.toLowerCase()).toMatch(/listening|part|minute/);
  });

  it("does not expose internal tech jargon", async () => {
    const res = await offlineNikaReply("listening part b gist practice", {
      prioritySkill: "listening",
      weakTags: ["listening:part-b-gist"],
    });
    expect(res.refused).toBe(false);
    expect(res.reply).not.toMatch(/supabase|opfs|layer\s*b/i);
    expect(res.reply).toMatch(/•/);
  });

  it("personalises with weak tags", async () => {
    const res = await offlineNikaReply("What should I study today?", {
      prioritySkill: "writing",
      weakTags: ["writing:purpose"],
    });
    expect(res.reply).toMatch(/writing/i);
    expect(res.reply).toMatch(/purpose/i);
  });
});
