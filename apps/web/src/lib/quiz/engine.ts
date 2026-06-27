import {
  formatReadingTagLabel,
  fullQuizPool,
  getReadingBlock,
  normalizeReadingCountry,
  partFromWeakTag,
} from "@/content/reading";
import { fullAssessmentPool, poolForSkill, type AssessmentSkill } from "@/content/assessment";
import { tipsForPart } from "@/lib/reading/exam-guide";
import type { QuizQuestion, ReadingBlock, ReadingPart } from "@/content/reading";
import { computeGap, sortSkillsByGap } from "@/lib/domain/grades";
import type { OetGrade, SkillMap } from "@/lib/domain/types";
import { createSelectionSeed, shuffleWithSeed } from "@/lib/quiz/shuffle-seed";

export type QuizMode = "quick_drill" | "part_focus" | "adaptive" | "clever_mix";

export interface QuizSelectionInput {
  weakTags: string[];
  profession?: string;
  targetCountry?: string;
  mode?: QuizMode;
  part?: "A" | "B" | "C";
  limit?: number;
  excludeIds?: string[];
  /** Per-user/per-session seed — different learners get different question sets. */
  selectionSeed?: number;
  /** When set, pulls from reading-only or cross-skill assessment pools. */
  assessmentSkill?: AssessmentSkill;
}

export interface ScoredAnswer {
  questionId: string;
  userAnswer: string | string[];
  correct: boolean;
  tags: string[];
  explanation: string;
}

export interface QuizScoreResult {
  total: number;
  correct: number;
  accuracy: number;
  wrongTags: string[];
  answers: ScoredAnswer[];
}

function tagOverlap(questionTags: string[], weakTags: string[]): number {
  return questionTags.filter((t) => weakTags.some((w) => t.includes(w) || w.includes(t))).length;
}

function matchesProfession(question: QuizQuestion, profession?: string): boolean {
  if (question.profession === "all") return true;
  if (!profession) return true;
  return question.profession === profession;
}

function matchesCountry(question: QuizQuestion, targetCountry?: string): boolean {
  if (!question.countryCode || question.countryCode === "ALL") return true;
  const country = normalizeReadingCountry(targetCountry);
  if (!country) return true;
  return question.countryCode === country;
}

function countryBoost(question: QuizQuestion, targetCountry?: string): number {
  const country = normalizeReadingCountry(targetCountry);
  if (!country || !question.countryCode) return 0;
  if (question.countryCode === country) return 3;
  if (question.countryCode === "ALL") return 1;
  return 0;
}

const CLEVER_TYPE_ORDER: QuizQuestion["type"][] = [
  "true_false",
  "gap_fill",
  "ordering",
  "matching",
  "mcq",
];

/** Mixed question types — inference, vocabulary, and exam strategy in one set. */
function selectCleverMix(
  pool: QuizQuestion[],
  weakTags: string[],
  targetCountry: string | undefined,
  limit: number,
  seed: number,
): QuizQuestion[] {
  const ranked = shuffleWithSeed(
    [...pool].sort((a, b) => {
      const aScore = tagOverlap(a.tags, weakTags) + countryBoost(a, targetCountry);
      const bScore = tagOverlap(b.tags, weakTags) + countryBoost(b, targetCountry);
      return bScore - aScore;
    }),
    seed,
  );

  const picked: QuizQuestion[] = [];
  const used = new Set<string>();

  for (const type of CLEVER_TYPE_ORDER) {
    const match = ranked.find((q) => q.type === type && !used.has(q.id));
    if (match) {
      picked.push(match);
      used.add(match.id);
    }
    if (picked.length >= limit) break;
  }

  for (const q of ranked) {
    if (picked.length >= limit) break;
    if (used.has(q.id)) continue;
    picked.push(q);
    used.add(q.id);
  }

  return shuffleWithSeed(picked.slice(0, limit), seed + 17);
}

function rankPool(
  pool: QuizQuestion[],
  weakTags: string[],
  targetCountry: string | undefined,
): QuizQuestion[] {
  return [...pool].sort((a, b) => {
    const aScore = tagOverlap(a.tags, weakTags) + countryBoost(a, targetCountry);
    const bScore = tagOverlap(b.tags, weakTags) + countryBoost(b, targetCountry);
    if (bScore !== aScore) return bScore - aScore;
    if (a.profession !== "all" && b.profession === "all") return -1;
    if (b.profession !== "all" && a.profession === "all") return 1;
    return a.difficulty - b.difficulty;
  });
}

function pickFromRanked(
  ranked: QuizQuestion[],
  limit: number,
  excludeIds: string[],
  seed: number,
): QuizQuestion[] {
  const excluded = new Set(excludeIds);
  const fresh = ranked.filter((q) => !excluded.has(q.id));
  const seen = ranked.filter((q) => excluded.has(q.id));
  const merged = fresh.length >= limit ? fresh : [...fresh, ...seen];
  const windowSize = Math.min(merged.length, Math.max(limit * 3, limit));
  const window = merged.slice(0, windowSize);
  return shuffleWithSeed(window, seed).slice(0, limit);
}

export function cleverQuizRationale(weakTags: string[], skill: AssessmentSkill = "reading"): string {
  if (skill === "vocab") {
    return (
      "Nika mixed abbreviations, clinical phrases, and handover language — the words that appear " +
      "in listening scripts, case notes, and role-plays. Save any word you do not know to your vocabulary list."
    );
  }
  if (skill === "writing") {
    return (
      "Nika picked writing-criteria traps — Purpose, Conciseness, Genre, and Organisation — " +
      "the knowledge checks that predict letter quality before you write."
    );
  }
  if (skill === "listening") {
    return (
      "Nika mixed detail, gist, and inference listening items — the same skills tested in Parts A, B, and C."
    );
  }
  if (skill === "speaking") {
    return (
      "Nika focused on ICE, structure, and clinical communication — what examiners listen for in role-plays."
    );
  }
  if (skill === "mixed") {
    return (
      "Nika built a cross-skill set — one rotation through Listening, Reading, Writing criteria, Speaking, and vocabulary."
    );
  }
  const label = formatReadingTagLabel(weakTags[0] ?? "reading:part-c-inference");
  return (
    `Nika mixed inference, vocabulary, and strategy questions because ${label} rewards careful reading — ` +
    `not just skimming. Expect true/false, gap-fill, and ordering-style traps like the real exam.`
  );
}

/** Select clever/adaptive questions for any assessment skill. */
export function selectAssessmentQuestions(input: QuizSelectionInput): QuizQuestion[] {
  const seed = input.selectionSeed ?? createSelectionSeed();
  const skill = input.assessmentSkill ?? "reading";
  if (skill === "mixed") {
    const limit = input.limit ?? 5;
    const skills: AssessmentSkill[] = ["reading", "listening", "writing", "speaking", "vocab"];
    const picked: QuizQuestion[] = [];
    const used = new Set<string>();
    for (let i = 0; i < limit; i++) {
      const s = skills[i % skills.length]!;
      const subset = selectAssessmentQuestions({
        ...input,
        assessmentSkill: s,
        limit: 1,
        mode: "clever_mix",
        selectionSeed: seed + i * 31,
      });
      for (const q of subset) {
        if (!used.has(q.id)) {
          picked.push(q);
          used.add(q.id);
          break;
        }
      }
    }
    return picked.slice(0, limit);
  }

  const basePool =
    skill === "reading"
      ? fullQuizPool().filter(
          (q) =>
            q.skill === "reading" &&
            matchesProfession(q, input.profession) &&
            matchesCountry(q, input.targetCountry) &&
            (input.part ? q.part === input.part : true),
        )
      : poolForSkill(skill).filter((q) => matchesProfession(q, input.profession));

  if (input.mode === "clever_mix") {
    return selectCleverMix(basePool, input.weakTags, input.targetCountry, input.limit ?? 5, seed);
  }

  const ranked = rankPool(basePool, input.weakTags, input.targetCountry);
  return pickFromRanked(ranked, input.limit ?? 5, input.excludeIds ?? [], seed);
}

export function selectQuizQuestions(input: QuizSelectionInput): QuizQuestion[] {
  if (input.assessmentSkill && input.assessmentSkill !== "reading") {
    return selectAssessmentQuestions(input);
  }

  const {
    weakTags,
    profession,
    targetCountry,
    mode = "adaptive",
    part,
    limit = 5,
    excludeIds = [],
    selectionSeed = createSelectionSeed(),
  } = input;

  const pool = fullQuizPool().filter(
    (q) =>
      q.skill === "reading" &&
      matchesProfession(q, profession) &&
      matchesCountry(q, targetCountry) &&
      (part ? q.part === part : true),
  );

  if (mode === "part_focus" && part) {
    return pickFromRanked(rankPool(pool, weakTags, targetCountry), limit, excludeIds, selectionSeed);
  }

  const ranked = rankPool(pool, weakTags, targetCountry);

  if (mode === "quick_drill") {
    return shuffleWithSeed(ranked.slice(0, Math.min(limit * 3, ranked.length)), selectionSeed).slice(
      0,
      limit,
    );
  }

  if (mode === "clever_mix") {
    return selectCleverMix(pool, weakTags, targetCountry, limit, selectionSeed);
  }

  return pickFromRanked(ranked, limit, excludeIds, selectionSeed);
}

/** Reading passages needed to answer passage-linked quiz questions (Part A/B/C blocks). */
export function passageBlocksForQuiz(questions: QuizQuestion[]): ReadingBlock[] {
  const seen = new Set<string>();
  const blocks: ReadingBlock[] = [];

  for (const q of questions) {
    if (!q.passageId || seen.has(q.passageId)) continue;
    const block = getReadingBlock(q.passageId);
    if (block) {
      seen.add(q.passageId);
      blocks.push(block);
    }
  }

  return blocks;
}

export function quizBriefingPart(
  weakTags: string[],
  questions: QuizQuestion[],
): ReadingPart {
  const fromTag = weakTags.map(partFromWeakTag).find(Boolean);
  if (fromTag) return fromTag;

  const counts: Record<ReadingPart, number> = { A: 0, B: 0, C: 0 };
  for (const q of questions) {
    if (q.part) counts[q.part] += 1;
  }

  const parts: ReadingPart[] = ["A", "B", "C"];
  const top = parts.reduce((best, part) => (counts[part] > counts[best] ? part : best), "B");
  return counts[top] > 0 ? top : "B";
}

export function quizRationale(weakTags: string[], questions: QuizQuestion[]): string {
  const topTag = weakTags[0] ?? "reading:part-b";
  const label = formatReadingTagLabel(topTag);
  const part = partFromWeakTag(topTag) ?? questions[0]?.part ?? "B";
  const tip = tipsForPart(part, weakTags)[0];
  const parts = [...new Set(questions.map((q) => q.part).filter(Boolean))];
  const partText = parts.length ? ` Parts ${parts.join(", ")}` : "";
  const strategy = tip ? ` Tip: ${tip.title} — ${tip.body.split(".")[0]}.` : "";
  return `Nika picked these because your Skill Map shows ${label} as a focus.${partText}${strategy}`;
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}

export function isAnswerCorrect(
  userAnswer: string | string[] | undefined,
  correctAnswer: string | string[],
): boolean {
  if (userAnswer === undefined || userAnswer === "") return false;

  if (Array.isArray(correctAnswer)) {
    if (!Array.isArray(userAnswer)) return false;
    if (userAnswer.length !== correctAnswer.length) return false;
    return correctAnswer.every(
      (c, i) => normalizeAnswer(String(userAnswer[i] ?? "")) === normalizeAnswer(c),
    );
  }

  return normalizeAnswer(String(userAnswer)) === normalizeAnswer(correctAnswer);
}

export function scoreQuiz(
  questions: QuizQuestion[],
  responses: Record<string, string | string[]>,
  importedAnswerKey?: Record<string, string>,
): QuizScoreResult {
  const answers: ScoredAnswer[] = questions.map((q) => {
    const userAnswer = responses[q.id];
    let correct = isAnswerCorrect(userAnswer, q.correctAnswer);

    if (!correct && importedAnswerKey) {
      const qNum = q.id.match(/q(\d+)$/i)?.[1] ?? q.id.match(/(\d+)$/)?.[1];
      const imported =
        importedAnswerKey[q.id] ??
        (qNum ? importedAnswerKey[`q${qNum}`] ?? importedAnswerKey[qNum] : undefined);
      if (imported && userAnswer !== undefined && userAnswer !== "") {
        const userStr = Array.isArray(userAnswer) ? userAnswer.join(" ") : String(userAnswer);
        correct = normalizeAnswer(userStr) === normalizeAnswer(imported);
      }
    }

    return {
      questionId: q.id,
      userAnswer: userAnswer ?? "",
      correct,
      tags: q.tags,
      explanation: q.explanation,
    };
  });

  const correct = answers.filter((a) => a.correct).length;
  const wrongTags = [
    ...new Set(answers.filter((a) => !a.correct).flatMap((a) => a.tags)),
  ];

  return {
    total: questions.length,
    correct,
    accuracy: questions.length ? correct / questions.length : 0,
    wrongTags,
    answers,
  };
}

const GRADE_FROM_ACCURACY: { min: number; band: OetGrade }[] = [
  { min: 0.85, band: "B" },
  { min: 0.65, band: "C+" },
  { min: 0.45, band: "C" },
  { min: 0, band: "D" },
];

export function accuracyToBand(accuracy: number): OetGrade {
  return GRADE_FROM_ACCURACY.find((row) => accuracy >= row.min)?.band ?? "D";
}

export function applyReadingResult(
  skillMap: SkillMap,
  accuracy: number,
  wrongTags: string[],
  correctTags: string[],
): SkillMap {
  const estBand = accuracyToBand(accuracy);
  const target = skillMap.targetGrades.reading;
  const gap = computeGap(estBand, target);

  const mergedWrong = [...new Set([...wrongTags, ...skillMap.diagnostic.reading.weakTags])].slice(
    0,
    5,
  );

  const filteredWeak = mergedWrong.filter((tag) => !correctTags.some((c) => c.includes(tag)));

  const diagnostic = {
    ...skillMap.diagnostic,
    reading: {
      estBand,
      gap,
      weakTags: filteredWeak.length ? filteredWeak : ["reading:part-b-gist"],
    },
  };

  return {
    ...skillMap,
    diagnostic,
    priority: sortSkillsByGap(diagnostic),
    computedAt: new Date().toISOString(),
  };
}

export function recommendedReadingPart(skillMap: SkillMap | undefined): "A" | "B" | "C" {
  if (!skillMap) return "B";
  const tag = skillMap.diagnostic.reading.weakTags[0] ?? "reading:part-b-gist";
  return partFromWeakTag(tag) ?? "B";
}

export function recommendedReadingStage(
  skillMap: SkillMap | undefined,
): "learn" | "practice" | "exam" {
  if (!skillMap) return "learn";
  const reading = skillMap.diagnostic.reading;
  if (reading.gap >= 2 || reading.estBand === "C" || reading.estBand === "D") return "learn";
  if (reading.gap === 1) return "practice";
  return "exam";
}

export function applyListeningResult(
  skillMap: SkillMap,
  accuracy: number,
  wrongTags: string[],
  correctTags: string[],
): SkillMap {
  const estBand = accuracyToBand(accuracy);
  const target = skillMap.targetGrades.listening;
  const gap = computeGap(estBand, target);

  const mergedWeak = [...new Set([...wrongTags, ...skillMap.diagnostic.listening.weakTags])].slice(
    0,
    5,
  );

  const filteredWeak = mergedWeak.filter((tag) => !correctTags.some((c) => c.includes(tag)));

  const diagnostic = {
    ...skillMap.diagnostic,
    listening: {
      estBand,
      gap,
      weakTags: filteredWeak.length ? filteredWeak : ["listening:part-b-gist"],
    },
  };

  return {
    ...skillMap,
    diagnostic,
    priority: sortSkillsByGap(diagnostic),
    computedAt: new Date().toISOString(),
  };
}

export function recommendedListeningPart(skillMap: SkillMap | undefined): "A" | "B" | "C" {
  if (!skillMap) return "B";
  const tag = skillMap.diagnostic.listening.weakTags[0] ?? "listening:part-b-gist";
  if (tag.includes("part-a")) return "A";
  if (tag.includes("part-c")) return "C";
  return "B";
}

export function recommendedListeningStage(
  skillMap: SkillMap | undefined,
): "learn" | "practice" | "exam" {
  if (!skillMap) return "learn";
  const listening = skillMap.diagnostic.listening;
  if (listening.gap >= 2 || listening.estBand === "C" || listening.estBand === "D") return "learn";
  if (listening.gap === 1) return "practice";
  return "exam";
}

export function applySpeakingResult(
  skillMap: SkillMap,
  overallScore: number,
  weakTags: string[],
  correctTags: string[],
): SkillMap {
  const estBand = accuracyToBand(overallScore);
  const target = skillMap.targetGrades.speaking;
  const gap = computeGap(estBand, target);

  const mergedWeak = [...new Set([...weakTags, ...skillMap.diagnostic.speaking.weakTags])].slice(
    0,
    5,
  );

  const filteredWeak = mergedWeak.filter((tag) => !correctTags.some((c) => c.includes(tag)));

  const diagnostic = {
    ...skillMap.diagnostic,
    speaking: {
      estBand,
      gap,
      weakTags: filteredWeak.length ? filteredWeak : ["speaking:ice-expectations"],
    },
  };

  return {
    ...skillMap,
    diagnostic,
    priority: sortSkillsByGap(diagnostic),
    computedAt: new Date().toISOString(),
  };
}

export function recommendedSpeakingStage(
  skillMap: SkillMap | undefined,
): "learn" | "practice" | "exam" {
  if (!skillMap) return "learn";
  const speaking = skillMap.diagnostic.speaking;
  if (speaking.gap >= 2 || speaking.estBand === "C" || speaking.estBand === "D") return "learn";
  if (speaking.gap === 1) return "practice";
  return "exam";
}
