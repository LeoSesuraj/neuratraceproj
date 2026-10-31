import { describe, expect, it } from "vitest";
import { companionPosition } from "../src/components/learning/companion-position";

describe("content-relative companion clearance", () => {
  it("keeps mobile Nim entirely outside the text in its 80px lane", () => {
    for (const visit of [1, 2, 3, 4]) {
      const p = companionPosition({ right: 350, sectionTop: 270, height: 550, anchorTop: 80, anchorHeight: 200, size: 48, visit });
      expect(p.x).toBeGreaterThanOrEqual(350 - 80 + 12);
      expect(p.x + 48).toBeLessThanOrEqual(350 - 8);
    }
  });
  it("keeps Nim above navigation even beside a short next part", () => {
    const p = companionPosition({ right: 700, sectionTop: 220, height: 100, anchorTop: 500, anchorHeight: 300, size: 64, visit: 2 });
    expect(p.y + 64).toBeLessThanOrEqual(220 + 100 - 12);
  });
  it("selects different content-relative stops on successive parts", () => {
    const input = { right: 700, sectionTop: 220, height: 600, anchorTop: 80, anchorHeight: 300, size: 64 };
    const first = companionPosition({ ...input, visit: 1 });
    const next = companionPosition({ ...input, visit: 2 });
    expect(first.y).toBe(360);
    expect(next.y).toBe(450);
  });
});