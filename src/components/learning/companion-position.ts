export function companionPosition({ right, sectionTop, height, anchorTop, anchorHeight, size, visit }: {
  right: number; sectionTop: number; height: number; anchorTop: number; anchorHeight: number; size: number; visit: number;
}) {
  return {
    x: right - size - (visit % 2 ? 8 : 16),
    y: sectionTop + Math.max(12, Math.min(height - size - 12,
      anchorTop + Math.min(anchorHeight * (visit % 2 ? 0.2 : 0.55), 150))),
    ready: true,
  };
}