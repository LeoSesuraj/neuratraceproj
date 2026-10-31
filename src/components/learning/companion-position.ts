export function companionPosition({ left, right, sectionTop, height, anchorTop, anchorHeight, size, visit }: {
  left: number; right: number; sectionTop: number; height: number; anchorTop: number; anchorHeight: number; size: number; visit: number;
}) {
  const lane = size === 48 ? 80 : 112;
  const onLeft = visit % 2 === 0;
  const anchorY = sectionTop + anchorTop + Math.min(anchorHeight * 0.35, 150);
  return {
    x: onLeft ? left + (lane - size) / 2 : right - (lane + size) / 2,
    y: Math.max(sectionTop + 12, Math.min(sectionTop + height - size - 12, anchorY)),
    ready: true,
    side: onLeft ? "left" as const : "right" as const,
  };
}
