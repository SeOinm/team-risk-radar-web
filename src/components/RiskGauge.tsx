interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RiskGauge({ score, size = 'md', showLabel = true }: RiskGaugeProps) {
  const { color, label } = getRiskLevel(score);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  const radius = size === 'sm' ? 28 : size === 'md' ? 56 : 88;
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 8 : 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} relative`}>
        <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSizeClasses[size]} font-semibold`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}

function getRiskLevel(score: number): { color: string; label: string } {
  if (score <= 24) return { color: 'oklch(0.65 0.15 145)', label: '안정' };
  if (score <= 49) return { color: 'oklch(0.65 0.12 220)', label: '관찰' };
  if (score <= 69) return { color: 'oklch(0.75 0.14 85)', label: '주의' };
  if (score <= 84) return { color: 'oklch(0.65 0.16 40)', label: '위험' };
  return { color: 'oklch(0.55 0.22 25)', label: '심각' };
}
