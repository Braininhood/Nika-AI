import type { QuizQuestion } from "@/content/reading/types";
import type { LessonQuestion } from "@/content/writing/lessons";
import type { ContentDrill } from "@/content/writing/drills";

export function lessonQuestionsToQuiz(questions: LessonQuestion[]): QuizQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    skill: "writing",
    profession: "all",
    type: "mcq",
    difficulty: 1,
    tags: ["writing:lesson"],
    prompt: q.prompt,
    options: q.options,
    correctAnswer: q.options[q.correctIndex] ?? "",
    explanation: q.explanation,
  }));
}

export function drillQuestionsToQuiz(drills: ContentDrill[]): QuizQuestion[] {
  return drills.map((d) => ({
    id: d.id,
    skill: "writing",
    profession: "all",
    type: "mcq",
    difficulty: 1,
    tags: [d.tag],
    prompt: d.prompt,
    options: d.options,
    correctAnswer: d.options[d.correctIndex] ?? "",
    explanation: d.explanation,
  }));
}
