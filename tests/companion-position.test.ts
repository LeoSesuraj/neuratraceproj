import { describe, expect, it } from "vitest";
import { companionPosition } from "../src/components/learning/companion-position";

const base = { left: 20, right: 355, sectionTop: 300, height: 1400, anchorTop: 80, anchorHeight: 200, size: 48 };

describe("content-relative companion clearance", () => {
  it("alternates left and right on every module", () => {
    expect(companionPosition({ ...base, visit: 0 }).side).toBe("left");
    expect(companionPosition({ ...base, visit: 1 }).side).toBe("right");
    expect(companionPosition({ ...base, visit: 2 }).side).toBe("left");
  });
  it("keeps mobile Nim entirely outside text in both reserved lanes", () => {
    for (const visit of [1, 2, 3, 4]) {
      const p = companionPosition({ ...base, visit });
      if (p.side === "left") expect(p.x + 48).toBeLessThanOrEqual(base.left + 80);
      else expect(p.x).toBeGreaterThanOrEqual(base.right - 80);
    }
  });
  it("keeps Nim above navigation even beside a short next part", () => {
    const p = companionPosition({ ...base, height: 100, anchorTop: 500, visit: 2 });
    expect(p.y + 48).toBeLessThanOrEqual(300 + 100 - 12);
  });
  it("stays anchored to the lesson content regardless of scroll position", () => {
    const p = companionPosition({ ...base, visit: 1 });
    expect(p.y).toBe(300 + 80 + Math.min(200 * 0.35, 150));
  });
});
