import { describe, expect, it } from "vitest";
import { companionPosition } from "../src/components/learning/companion-position";

const base = { left: 20, right: 355, sectionTop: 300, height: 1400, anchorTop: 80, anchorHeight: 200, size: 48, viewportTop: 0, viewportHeight: 844 };

describe("content-relative companion clearance", () => {
  it("alternates left and right on every module", () => {
    expect(companionPosition({ ...base, visit: 0 }).side).toBe("left");
    expect(companionPosition({ ...base, visit: 1 }).side).toBe("right");
    expect(companionPosition({ ...base, visit: 2 }).side).toBe("left");
  });
  it("keeps mobile Nim entirely outside text in both reserved lanes", () => {
    for (const visit of [1, 2, 3, 4]) {
      const p = companionPosition({ ...base, visit, scroll: 350 });
      if (p.side === "left") expect(p.x + 48).toBeLessThanOrEqual(base.left + 64);
      else expect(p.x).toBeGreaterThanOrEqual(base.right - 64);
    }
  });
  it("keeps Nim above navigation even beside a short next part", () => {
    const p = companionPosition({ ...base, height: 100, anchorTop: 500, visit: 2 });
    expect(p.y + 48).toBeLessThanOrEqual(300 + 100 - 12);
  });
  it("moves with scrolling while staying inside the visible lesson lane", () => {
    const first = companionPosition({ ...base, visit: 1 });
    const next = companionPosition({ ...base, visit: 1, viewportTop: 500, scroll: 500 });
    expect(next.y).toBeGreaterThan(first.y + 200);
    expect(next.y).toBeGreaterThanOrEqual(600);
    expect(next.y + 48).toBeLessThanOrEqual(500 + 844 - 28);
    expect(next.x).not.toBe(first.x);
  });
});