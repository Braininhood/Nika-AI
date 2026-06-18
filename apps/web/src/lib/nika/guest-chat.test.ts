import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getGuestTurnCount,
  guestNikaReply,
  GUEST_MAX_TURNS,
  isGuestLimitReached,
} from "@/lib/nika/guest-chat";

function mockSessionStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    clear: () => store.clear(),
    removeItem: (key: string) => store.delete(key),
    key: () => null,
    length: 0,
  });
}

describe("guest chat", () => {
  beforeEach(() => {
    mockSessionStorage();
    sessionStorage.clear();
  });

  it("answers project FAQ within turn limit", () => {
    const res = guestNikaReply("What is OET Coach?");
    expect(res.refused).toBe(false);
    expect(res.reply).toMatch(/OET Coach/i);
    expect(getGuestTurnCount()).toBe(1);
  });

  it("answers who are you", () => {
    const res = guestNikaReply("what is your name and what you do?");
    expect(res.refused).toBe(false);
    expect(res.reply).toMatch(/Nika/i);
  });

  it("answers contact support", () => {
    const res = guestNikaReply("how to contact with support?");
    expect(res.refused).toBe(false);
    expect(res.reply).toMatch(/support@nika-oet.fun/i);
  });

  it("gates vocabulary behind sign-in", () => {
    const res = guestNikaReply("ibuprofen - translate?");
    expect(res.refused).toBe(true);
    expect(res.reply).toMatch(/sign in/i);
  });

  it("blocks after max turns including refresh state", () => {
    guestNikaReply("What is OET Coach?");
    guestNikaReply("How do I sign in?");
    expect(isGuestLimitReached()).toBe(true);
    const res = guestNikaReply("Does it work offline?");
    expect(res.provider).toBe("guest_limit");
    expect(res.reply).toMatch(/2 preview/i);
  });

  it("tracks exactly GUEST_MAX_TURNS", () => {
    expect(GUEST_MAX_TURNS).toBe(2);
  });
});
