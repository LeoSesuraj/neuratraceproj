import { describe, expect, it } from "vitest";
import { chapters, nextLesson, reviewQuiz } from "../src/lib/curriculum";
import { curriculumSources } from "../src/lib/curriculum-sources";
import { migrateOriginalProgress } from "../src/lib/learning-progress-migration";

describe("Chapter One rollout", () => {
  it("keeps Chapters 2 through 7 unavailable", () => {
    expect(chapters.slice(1).map((chapter) => chapter.lessons.length)).toEqual([0, 0, 0, 0, 0, 0]);
  });
  it("ends the expanded journey after review", () => {
    expect(nextLesson("1.10")?.id).toBe("1.11");
    expect(nextLesson("1.11")).toBeUndefined();
  });
  it("resolves every authored lesson source", () => {
    for (const lesson of chapters[0].lessons) {
      expect(lesson.sourceIds?.length).toBeGreaterThan(0);
      for (const id of lesson.sourceIds ?? []) expect(curriculumSources[id]?.url).toMatch(/^https:\/\//);
    }
  });
  it("provides one correct answer for each review decision", () => {
    for (const quiz of reviewQuiz) expect(quiz.options.filter((option) => option.correct)).toHaveLength(1);
  });
  it("retains completed original modules instead of marking new lessons complete", () => {
    expect(migrateOriginalProgress({ completed: ["1.2", "1.5", "1.6"], current: "1.3", reflection: "My note" }))
      .toEqual({ completed: ["1.3", "1.6", "1.11"], current: "1.4", reflection: "My note" });
  });
});