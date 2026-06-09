interface RiskBadgeProps {
  score: number;
  showScore?: boolean;
}

export function RiskBadge({ score, showScore = false }: RiskBadgeProps) {
  const { bgColor, textColor, label } = getRiskLevelStyle(score);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {showScore && <span className="font-semibold">{score}</span>}
      <span>{label}</span>
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  if (role === '팀장') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
        style={{ backgroundColor: 'oklch(0.92 0.06 290)', color: 'oklch(0.35 0.12 290)' }}>
        팀장
      </span>
    );
  }
  if (role === '공동 팀장') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
        style={{ backgroundColor: 'oklch(0.92 0.05 250)', color: 'oklch(0.35 0.1 250)' }}>
        공동 팀장
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ backgroundColor: 'oklch(0.94 0.01 240)', color: 'oklch(0.45 0.02 240)' }}>
      팀원
    </span>
  );
}

export function getRiskLevelStyle(score: number): { bgColor: string; textColor: string; label: string } {
  if (score <= 24) return {
    bgColor: 'oklch(0.65 0.15 145 / 0.15)',
    textColor: 'oklch(0.25 0.1 145)',
    label: '안정'
  };
  if (score <= 49) return {
    bgColor: 'oklch(0.65 0.12 220 / 0.15)',
    textColor: 'oklch(0.25 0.1 220)',
    label: '관찰'
  };
  if (score <= 69) return {
    bgColor: 'oklch(0.75 0.14 85 / 0.2)',
    textColor: 'oklch(0.35 0.12 85)',
    label: '주의'
  };
  if (score <= 84) return {
    bgColor: 'oklch(0.65 0.16 40 / 0.2)',
    textColor: 'oklch(0.45 0.18 40)',
    label: '위험'
  };
  return {
    bgColor: 'oklch(0.55 0.22 25 / 0.15)',
    textColor: 'oklch(0.45 0.22 25)',
    label: '심각'
  };
}

export function getRiskColor(score: number) {
  if (score <= 24) return 'oklch(0.65 0.15 145)';
  if (score <= 49) return 'oklch(0.65 0.12 220)';
  if (score <= 69) return 'oklch(0.75 0.14 85)';
  if (score <= 84) return 'oklch(0.65 0.16 40)';
  return 'oklch(0.55 0.22 25)';
}
