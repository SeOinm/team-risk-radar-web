import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { sampleTasks, sampleMembers } from '@/data/sampleData';
import { SizeBadgeDs, StatusChip, AlertBanner, NavBack } from '@/components/ds';

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));

const BASE = new Date('2024-05-13');
const END = new Date('2024-06-13');
const TOTAL_DAYS = (END.getTime() - BASE.getTime()) / (24 * 60 * 60 * 1000);

const DATE_TICKS = ['5/13', '5/20', '5/27', '6/3', '6/10', '6/13'];
const TICK_OFFSETS = [0, 7, 14, 21, 28, 31].map(d => `${(d / TOTAL_DAYS) * 100}%`);

function getSpan(dueStr: string) {
  const due = new Date(dueStr);
  const endDays = Math.min((due.getTime() - BASE.getTime()) / (24 * 60 * 60 * 1000), TOTAL_DAYS);
  const width = Math.max((endDays / TOTAL_DAYS) * 100, 5);
  return { left: '0%', width: `${width}%` };
}

function barColor(task: typeof sampleTasks[0]) {
  if (task.status === '완료') return '#16A34A';
  if (task.delayed) return '#EA580C';
  if (task.riskScore >= 70) return '#D97706';
  if (task.assignees.length === 0) return '#D1D5DB';
  return '#2563EB';
}

export function Timeline() {
  const navigate = useNavigate();
  const [showMode, setShowMode] = useState<'전체' | '주간' | '위험'>('전체');

  const visible = sampleTasks.filter(t => {
    if (t.cancelled) return false;
    if (showMode === '위험') return t.riskScore >= 50 || t.delayed;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavBack label="대시보드" onClick={() => navigate('/dashboard')} />
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <span className="text-[13px] font-semibold text-[#111827]">타임라인</span>
          </div>
          <div className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden h-7">
            {(['전체', '주간', '위험'] as const).map(v => (
              <button
                key={v}
                onClick={() => setShowMode(v)}
                className={`px-3 text-[12px] font-medium h-full transition-colors ${
                  showMode === v ? 'bg-[#111827] text-white' : 'bg-white text-[#6B7280] hover:bg-[#F3F4F6]'
                } border-r border-[#E5E7EB] last:border-r-0`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-5">
        {/* Legend */}
        <div className="flex items-center gap-5 mb-4">
          {[
            { color: '#16A34A', label: '완료' },
            { color: '#2563EB', label: '진행 중/전' },
            { color: '#EA580C', label: '지연' },
            { color: '#D97706', label: '위험' },
            { color: '#D1D5DB', label: '미배정' },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <span className="w-3 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>

        {/* Bottleneck alert */}
        <div className="mb-4">
          <AlertBanner
            level="caution"
            title="자료 조사 3일 지연"
            desc="보고서 초안, 발표자료 제작의 일정에 영향을 줄 수 있습니다."
          />
        </div>

        {/* Gantt chart */}
        <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
          {/* Date header */}
          <div className="flex border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <div className="w-52 shrink-0 px-4 py-2 text-[11px] font-medium text-[#9CA3AF] border-r border-[#E5E7EB]">
              작업
            </div>
            <div className="flex-1 relative h-8">
              {DATE_TICKS.map((d, i) => (
                <div
                  key={d}
                  className="absolute top-0 h-full flex items-center"
                  style={{ left: TICK_OFFSETS[i] }}
                >
                  <div className="border-l border-[#E5E7EB] h-full" />
                  <span className="ml-1 text-[11px] text-[#9CA3AF]">{d}</span>
                </div>
              ))}
            </div>
            <div className="w-20 shrink-0 px-3 py-2 text-[11px] font-medium text-[#9CA3AF] border-l border-[#E5E7EB] text-right">
              마감
            </div>
          </div>

          {/* Task rows */}
          {visible.map(task => {
            const pos = getSpan(task.dueDate);
            const color = barColor(task);
            const assigneeNames = task.assignees.map(id => memberMap[id]?.name).filter(Boolean).join(', ');
            const isBottleneck = task.id === 't2';

            return (
              <div
                key={task.id}
                className={`flex border-b border-[#E5E7EB] last:border-0 ${isBottleneck ? 'bg-[#FFFBEB]' : 'hover:bg-[#F9FAFB]'} transition-colors`}
              >
                {/* Task info */}
                <div className="w-52 shrink-0 px-4 py-3 border-r border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {task.delayed && <AlertTriangle className="w-3 h-3 text-[#EA580C] shrink-0" />}
                    <button
                      onClick={() => navigate(`/task/${task.id}`)}
                      className="text-[12px] font-medium text-[#111827] hover:underline truncate text-left"
                    >
                      {task.title}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <SizeBadgeDs size={task.size} />
                    <span className="text-[11px] text-[#9CA3AF] truncate">{assigneeNames || '미배정'}</span>
                  </div>
                </div>

                {/* Bar area */}
                <div className="flex-1 relative py-3 px-2 overflow-hidden">
                  {/* Grid lines */}
                  {TICK_OFFSETS.map((off, i) => (
                    <div
                      key={i}
                      className="absolute top-0 h-full border-l border-[#F3F4F6]"
                      style={{ left: off }}
                    />
                  ))}
                  {/* Bar */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-4 rounded flex items-center px-1.5"
                    style={{ left: pos.left, width: pos.width, backgroundColor: color, minWidth: 32 }}
                  >
                    {task.progress > 0 && (
                      <span className="text-[10px] text-white font-medium">{task.progress}%</span>
                    )}
                  </div>
                </div>

                {/* Due date */}
                <div className="w-20 shrink-0 flex items-center justify-end px-3 border-l border-[#E5E7EB]">
                  <span className={`text-[11px] ${task.delayed ? 'text-[#DC2626] font-medium' : 'text-[#9CA3AF]'}`}>
                    {task.dueDate.slice(5)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status summary */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {sampleTasks.map(task => (
            <div key={task.id} className="flex items-center justify-between px-3 py-2 border border-[#E5E7EB] rounded-md">
              <span className="text-[11px] text-[#374151] truncate">{task.title}</span>
              <StatusChip status={task.status} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
