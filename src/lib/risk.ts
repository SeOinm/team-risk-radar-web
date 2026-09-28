export type BadgeVariant = 'default' | 'safe' | 'watch' | 'caution' | 'danger' | 'critical' | 'outline';


export function getRiskInfo(score: number): { level: string; variant: BadgeVariant; label: string; color: string; bg: string; border: string; text: string } {
  if (score <= 24) return { level: 'safe', variant: 'safe', label: '안정', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', text: '#14532D' };
  if (score <= 49) return { level: 'watch', variant: 'watch', label: '관찰', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', text: '#1E3A8A' };
  if (score <= 69) return { level: 'caution', variant: 'caution', label: '주의', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', text: '#78350F' };
  if (score <= 84) return { level: 'danger', variant: 'danger', label: '위험', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', text: '#7C2D12' };
  return { level: 'critical', variant: 'critical', label: '심각', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', text: '#7F1D1D' };
}
