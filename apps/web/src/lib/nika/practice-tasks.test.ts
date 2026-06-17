import { describe, expect, it } from "vitest";

import {
  buildPracticeTasks,
  explicitSkillRequest,
  isPracticeTaskRequest,
  wantsMixedTasks,
} from "@/lib/nika/practice-tasks";

describe("practice tasks", () => {
  it("detects practice requests", () => {
    expect(
      isPracticeTaskRequest("i need more writing practice, create 2-3 tasks for today"),
    ).toBe(true);
    expect(isPracticeTaskRequest("what about mix tasks?")).toBe(true);
    expect(isPracticeTaskRequest("if i complete plan can you give me more tasks?")).toBe(true);
  });

  it("defaults to mixed tasks when no skill named", () => {
    const { tasks, reply } = buildPracticeTasks(
      "give me more tasks",
      "pharmacy",
      "UK",
      { priority: ["listening"] } as never,
    );
    const skills = new Set(tasks.map((t) => t.skill));
    expect(skills.size).toBeGreaterThan(1);
    expect(reply).toMatch(/four sub-tests/i);
    expect(reply).toMatch(/mixed/i);
  });

  it("builds mixed tasks when asked", () => {
    expect(wantsMixedTasks("what about mix tasks?")).toBe(true);
    const { tasks } = buildPracticeTasks("mix tasks please", "pharmacy", "UK");
    const skills = new Set(tasks.map((t) => t.skill));
    expect(skills.size).toBeGreaterThan(1);
  });

  it("builds profession writing tasks when explicit", () => {
    expect(explicitSkillRequest("create 2 writing tasks")).toBe("writing");
    const { tasks, reply } = buildPracticeTasks(
      "create 2 writing tasks",
      "pharmacy",
      "UK",
    );
    expect(tasks.length).toBe(2);
    expect(tasks.every((t) => t.skill === "writing")).toBe(true);
    expect(reply).toMatch(/pharmacy/i);
  });

  it("maps write practice to writing tasks only", () => {
    const { tasks } = buildPracticeTasks(
      "i need more write practice, create 2-3 tasks",
      "pharmacy",
      "UK",
      { priority: ["reading"] } as never,
    );
    expect(tasks.every((t) => t.skill === "writing")).toBe(true);
  });
});
