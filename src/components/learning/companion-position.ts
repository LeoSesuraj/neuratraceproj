export function companionPosition({ left, right, sectionTop, height, anchorTop, anchorHeight, size, visit, viewportTop, viewportHeight, scroll = 0 }: {
  left: number; right: number; sectionTop: number; height: number; anchorTop: number; anchorHeight: number; size: number; visit: number;
  viewportTop: number; viewportHeight: number; scroll?: number;
}) {
  const lane = size === 48 ? 64 : 88;
  const onLeft = visit % 2 === 0;
  const wander = Math.sin(scroll / 140) * 4;
  const minimum = Math.max(sectionTop + 12, viewportTop + 100);
  const maximum = Math.min(sectionTop + height - size - 12, viewportTop + viewportHeight - size - 28);
  const anchorY = sectionTop + anchorTop + Math.min(anchorHeight * 0.35, 150);
  const scrollY = viewportTop + viewportHeight * (0.38 + Math.sin(scroll / 240) * 0.12);
  return {
    x: (onLeft ? left + (lane - size) / 2 : right - (lane + size) / 2) + wander,
    y: Math.max(sectionTop + 12, Math.min(sectionTop + height - size - 12,
      minimum <= maximum ? Math.max(minimum, Math.min(maximum, scroll ? scrollY : anchorY)) : anchorY)),
    ready: true,
    side: onLeft ? "left" as const : "right" as const,
  };
}