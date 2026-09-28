/**
 * Design System primitives for 팀플 리스크 레이더
 * Linear / Notion / GitHub minimal SaaS aesthetic
 */
import { cn } from '@/lib/utils';
import { getRiskInfo, type BadgeVariant } from '@/lib/risk';
import { useId, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react';

// ─── Layout ─────────────────────────────────────────────────────────────────

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {children}
    </div>
  );
}

export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
      {children}
    </header>
  );
}

export function PageContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <main className={`max-w-6xl mx-auto px-6 py-6 ${className}`}>
      {children}
    </main>
  );
}

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white">
        {children}
      </div>
    </div>
  );
}

// ─── Typography ──────────────────────────────────────────────────────────────

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-[15px] font-semibold text-[#111827] tracking-tight">{children}</h1>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[13px] font-semibold text-[#374151] mb-3">{children}</h2>;
}

export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] font-medium text-[#6B7280] uppercase tracking-wide ${className}`}>{children}</p>;
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`bg-white border border-[#E5E7EB] rounded-md ${onClick ? 'cursor-pointer hover:bg-[#F9FAFB] transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Btn({ variant = 'secondary', size = 'md', children, className = '', ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'h-7 px-2.5 text-[12px]',
    md: 'h-8 px-3 text-[13px]',
  };
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-[#111827] text-white hover:bg-[#1F2937]',
    secondary: 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]',
    ghost: 'bg-transparent text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]',
    danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
    link: 'bg-transparent text-[#2563EB] hover:underline h-auto px-0 text-[13px]',
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className = '', id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-[13px] font-medium text-[#374151]">{label}</label>}
      <input
        id={inputId}
        className={`w-full h-8 px-3 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md placeholder-[#9CA3AF] outline-none focus:ring-1 focus:ring-[#111827] focus:border-[#111827] transition-colors ${className}`}
        {...props}
      />
      {hint && <p className="text-[11px] text-[#9CA3AF]">{hint}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────

export function Select({ label, className = '', children, ...props }: { label?: string; className?: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-[13px] font-medium text-[#374151]">{label}</label>}
      <select
        className={`w-full h-8 px-3 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md outline-none focus:ring-1 focus:ring-[#111827] transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────

export function Textarea({ label, hint, className = '', ...props }: { label?: string; hint?: string; className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-[13px] font-medium text-[#374151]">{label}</label>}
      <textarea
        className={`w-full px-3 py-2 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md placeholder-[#9CA3AF] outline-none focus:ring-1 focus:ring-[#111827] transition-colors resize-none ${className}`}
        {...props}
      />
      {hint && <p className="text-[11px] text-[#9CA3AF]">{hint}</p>}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

export function Badge({ children, variant = 'default', className = '' }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-[#F3F4F6] text-[#374151]',
    safe: 'bg-[#F0FDF4] text-[#14532D] border border-[#BBF7D0]',
    watch: 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE]',
    caution: 'bg-[#FFFBEB] text-[#78350F] border border-[#FDE68A]',
    danger: 'bg-[#FFF7ED] text-[#7C2D12] border border-[#FED7AA]',
    critical: 'bg-[#FEF2F2] text-[#7F1D1D] border border-[#FECACA]',
    outline: 'bg-white text-[#374151] border border-[#E5E7EB]',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Risk Badge ──────────────────────────────────────────────────────────────

export function RiskScore({ score }: { score: number }) {
  const { variant, label } = getRiskInfo(score);
  return (
    <Badge variant={variant}>
      {label} {score}
    </Badge>
  );
}

export function RiskDot({ score }: { score: number }) {
  const colors: Record<string, string> = {
    safe: 'bg-[#16A34A]',
    watch: 'bg-[#2563EB]',
    caution: 'bg-[#D97706]',
    danger: 'bg-[#EA580C]',
    critical: 'bg-[#DC2626]',
  };
  const { level } = getRiskInfo(score);
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[level]}`} />;
}

// ─── Role Badge ──────────────────────────────────────────────────────────────

export function RoleBadgeDs({ role }: { role: string }) {
  if (role === '팀장') return <Badge variant="outline" className="border-violet-200 text-violet-700 bg-violet-50">팀장</Badge>;
  if (role === '공동 팀장') return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">공동 팀장</Badge>;
  return <Badge variant="default">팀원</Badge>;
}

// ─── Size Badge ───────────────────────────────────────────────────────────────

export function SizeBadgeDs({ size }: { size: 'S' | 'M' | 'L' | 'XL' }) {
  const colors = {
    S: 'bg-[#F3F4F6] text-[#6B7280]',
    M: 'bg-[#EFF6FF] text-[#1E40AF]',
    L: 'bg-[#FFF7ED] text-[#9A3412]',
    XL: 'bg-[#FFF1F2] text-[#881337]',
  };
  return <span className={`inline-flex items-center justify-center w-6 h-5 rounded text-[10px] font-semibold ${colors[size]}`}>{size}</span>;
}

// ─── Status Chip ─────────────────────────────────────────────────────────────

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    '진행 전': 'text-[#6B7280] bg-[#F3F4F6]',
    '진행 중': 'text-[#1D4ED8] bg-[#EFF6FF]',
    '막힘': 'text-[#9A3412] bg-[#FFF7ED]',
    '완료': 'text-[#14532D] bg-[#F0FDF4]',
    '취소': 'text-[#9CA3AF] bg-[#F3F4F6] line-through',
  };
  const cls = map[status] || 'text-[#6B7280] bg-[#F3F4F6]';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>{status}</span>;
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const color = value === 100 ? '#16A34A' : value >= 50 ? '#2563EB' : '#D97706';
  return (
    <div className={`h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden ${className}`}>
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`border-t border-[#E5E7EB] ${className}`} />;
}

// ─── Empty State ─────────────────────────────────────────────────────────────

export function EmptyMsg({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[13px] font-medium text-[#374151] mb-1">{title}</p>
      {desc && <p className="text-[12px] text-[#9CA3AF] mb-4">{desc}</p>}
      {action}
    </div>
  );
}

// ─── Alert Banner ────────────────────────────────────────────────────────────

type AlertLevel = 'danger' | 'caution' | 'info' | 'success';

export function AlertBanner({ level, title, desc, action }: { level: AlertLevel; title: string; desc?: string; action?: ReactNode }) {
  const styles: Record<AlertLevel, string> = {
    danger: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
    caution: 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]',
    info: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]',
    success: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D]',
  };
  return (
    <div className={`border rounded-md px-3 py-2.5 ${styles[level]}`}>
      <p className="text-[13px] font-medium">{title}</p>
      {desc && <p className="text-[12px] mt-0.5 opacity-80">{desc}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ─── Nav Back ────────────────────────────────────────────────────────────────

export function NavBack({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors h-full px-4">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.5 3L5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label}
    </button>
  );
}

// ─── Filter Tabs ─────────────────────────────────────────────────────────────

export function FilterTabs<T extends string>({ options, value, onChange }: { options: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden h-8">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 text-[12px] font-medium h-full transition-colors ${
            value === opt.value
              ? 'bg-[#111827] text-white'
              : 'bg-white text-[#6B7280] hover:bg-[#F3F4F6]'
          } border-r border-[#E5E7EB] last:border-r-0`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Checkin status icons ─────────────────────────────────────────────────────

export function CheckDot({ done, late, missed }: { done?: boolean; late?: boolean; missed?: boolean }) {
  if (done && !late) return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#16A34A]">●&nbsp;완료</span>;
  if (late) return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#D97706]">◐&nbsp;지각</span>;
  if (missed) return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#DC2626]">○&nbsp;누락</span>;
  return <span className="text-[11px] text-[#9CA3AF]">—</span>;
}
