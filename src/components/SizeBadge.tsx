interface SizeBadgeProps {
  size: 'S' | 'M' | 'L' | 'XL';
}

export function SizeBadge({ size }: SizeBadgeProps) {
  const colors = {
    S: { bg: 'oklch(0.7 0.08 220 / 0.15)', text: 'oklch(0.35 0.08 220)' },
    M: { bg: 'oklch(0.7 0.08 180 / 0.15)', text: 'oklch(0.35 0.08 180)' },
    L: { bg: 'oklch(0.65 0.1 40 / 0.15)', text: 'oklch(0.4 0.12 40)' },
    XL: { bg: 'oklch(0.55 0.15 25 / 0.15)', text: 'oklch(0.4 0.15 25)' }
  };

  const { bg, text } = colors[size];

  return (
    <span
      className="inline-flex items-center justify-center w-8 h-6 rounded text-xs font-semibold"
      style={{ backgroundColor: bg, color: text }}
    >
      {size}
    </span>
  );
}
