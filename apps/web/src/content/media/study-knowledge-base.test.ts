import { describe, expect, it } from "vitest";

import { PROFESSIONS } from "@/lib/domain/professions";
import {
  importChecklistForProfession,
  knowledgeForPhase,
  knowledgeForProfession,
  nikaKnowledgeChunks,
  STUDY_KNOWLEDGE_BASE,
} from "@/content/media/study-knowledge-base";
import { STUDY_MEDIA_CATALOG } from "@/content/media/study-resources";

describe("study knowledge base", () => {
  it("has entries for phases 1–3", () => {
    expect(knowledgeForPhase(1).length).toBeGreaterThan(0);
    expect(knowledgeForPhase(2).length).toBeGreaterThan(0);
    expect(knowledgeForPhase(3).length).toBeGreaterThan(0);
  });

  it("covers all 12 professions with sample links", () => {
    for (const p of PROFESSIONS) {
      const entries = knowledgeForProfession(p.code);
      expect(entries.some((e) => e.id === `sample-paper-${p.code}`)).toBe(true);
      expect(entries.some((e) => e.id === `sample-computer-${p.code}`)).toBe(true);
    }
  });

  it("import checklist routes to writing, reading, listening", () => {
    const items = importChecklistForProfession("nursing");
    const routes = items.map((i) => i.route);
    expect(routes).toContain("/writing/practice");
    expect(routes).toContain("/reading");
    expect(routes).toContain("/listening");
    expect(routes).toContain("/listening/import#answer-key-matcher");
  });

  it("exports nika RAG chunks with advice text", () => {
    const chunks = nikaKnowledgeChunks();
    expect(chunks.length).toBe(STUDY_KNOWLEDGE_BASE.length);
    expect(chunks.every((c) => c.text.length > 20)).toBe(true);
    expect(chunks.some((c) => c.tags.includes("nika_tip") || c.tags.includes("layer-a"))).toBe(true);
  });
});

describe("study media catalog", () => {
  it("includes accent podcasts UK AU CA", () => {
    const accents = STUDY_MEDIA_CATALOG.filter((m) => m.kind === "podcast").map((m) => m.accent);
    expect(accents).toContain("UK");
    expect(accents).toContain("AU");
    expect(accents).toContain("CA");
  });

  it("includes per-part YouTube search links", () => {
    expect(STUDY_MEDIA_CATALOG.some((m) => m.id === "oet-youtube-listening-part-a")).toBe(true);
    expect(STUDY_MEDIA_CATALOG.some((m) => m.id === "oet-youtube-listening-part-b")).toBe(true);
    expect(STUDY_MEDIA_CATALOG.some((m) => m.id === "oet-youtube-listening-part-c")).toBe(true);
  });

  it("includes writing and speaking criteria PDFs", () => {
    expect(STUDY_MEDIA_CATALOG.some((m) => m.id === "oet-writing-criteria-pdf")).toBe(true);
    expect(STUDY_MEDIA_CATALOG.some((m) => m.id === "oet-speaking-criteria-pdf")).toBe(true);
    expect(STUDY_MEDIA_CATALOG.some((m) => m.id === "oet-graded-samples-pdf")).toBe(true);
  });
});
