import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { SizeBadge } from '@/components/SizeBadge';
import { sampleTasks, sampleMembers } from '@/data/sampleData';

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));


function getSpan(task: { dueDate: string }) {
  const due = new Date(task.dueDate);
  const base = new Date('2024-05-13');
  const end = new Date('2024-06-13');
  const totalDays = (end.getTime() - base.getTime()) / (24 * 60 * 60 * 1000);
  const startDays = 0;
  const endDays = Math.min((due.getTime() - base.getTime()) / (24 * 60 * 60 * 1000), totalDays);
  const left = (startDays / totalDays) * 100;
  const width = ((endDays - startDays) / totalDays) * 100;
  return { left: `${left}%`, width: `${Math.max(width, 5)}%` };
}

function getBarColor(task: typeof sampleTasks[0]) {
  if (task.status === '완료') return 'bg-emerald-400';
  if (task.delayed) return 'bg-orange-400';
  if (task.riskScore >= 70) return 'bg-orange-300';
  if (task.assignees.length === 0) return 'bg-slate-300';
  return 'bg-sky-400';
}

export function Timeline() {
  const navigate = useNavigate();
  const [showView, setShowView] = useState<'전체' | '주간'>('전체');
  const visibleTasks = sampleTasks.filter(t => !t.cancelled);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
              <ArrowLeft className="w-4 h-4" /> 대시보드
            </button>
            <div className="h-4 border-l border-border" />
            <h1>타임라인</h1>
          </div>
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            {(['전체', '주간'] as const).map(v => (
              <button
                key={v}
                onClick={() => setShowView(v)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${showView === v ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              >
                {v} 기간
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* 범례 */}
        <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground flex-wrap">
          {[
            { color: 'bg-emerald-400', label: '완료' },
            { color: 'bg-sky-400', label: '진행 중 / 진행 전' },
            { color: 'bg-orange-400', label: '지연' },
            { color: 'bg-slate-300', label: '미배정' },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className={`w-3 h-2 rounded-sm ${l.color}`} />
              {l.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 ml-4">
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            지연된 선행 작업 강조
          </span>
        </div>

        {/* 타임라인 헤더 (날짜 눈금) */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* 날짜 헤더 */}
          <div className="border-b border-border flex">
            <div className="w-56 shrink-0 px-4 py-2 text-xs text-muted-foreground font-medium border-r border-border">
              작업
            </div>
            <div className="flex-1 relative h-8">
              {['5/13', '5/20', '5/27', '6/3', '6/10', '6/13'].map((d, i) => (
                <div
                  key={d}
                  className="absolute top-0 h-full flex items-center"
                  style={{ left: `${(i / 5) * 100}%` }}
                >
                  <div className="border-l border-border h-full" />
                  <span className="ml-1 text-xs text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 작업 행 */}
          {visibleTasks.map(task => {
            const bar = getBarColor(task);
            const pos = getSpan(task);
            const assigneeNames = task.assignees.map(id => memberMap[id]?.name).filter(Boolean).join(', ');
            const isBottleneck = task.id === 't2';

            return (
              <div key={task.id} className={`flex border-b border-border last:border-0 hover:bg-muted/20 ${isBottleneck ? 'bg-orange-50/50' : ''}`}>
                {/* 작업 정보 */}
                <div className="w-56 shrink-0 px-4 py-3 border-r border-border">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {task.delayed && <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                    <button
                      onClick={() => navigate(`/task/${task.id}`)}
                      className="text-sm font-medium hover:text-primary hover:underline truncate text-left"
                    >
                      {task.title}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <SizeBadge size={task.size} />
                    <span className="truncate">{assigneeNames || '미배정'}</span>
                  </div>
                </div>

                {/* 바 영역 */}
                <div className="flex-1 relative py-3 px-2">
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-full ${bar} flex items-center px-2`}
                    style={{ left: pos.left, width: pos.width, minWidth: '40px' }}
                  >
                    <span className="text-xs text-white font-medium truncate">
                      {task.progress > 0 ? `${task.progress}%` : ''}
                    </span>
                  </div>
                  {/* 선행 작업 화살표 표시 */}
                  {task.prerequisiteIds.length > 0 && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-50">
                      ←
                    </div>
                  )}
                </div>

                {/* 마감일 */}
                <div className="w-20 shrink-0 flex items-center justify-end px-3">
                  <span className={`text-xs ${task.delayed ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                    {task.dueDate.slice(5)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 병목 경고 */}
        <div className="mt-4 flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <span className="font-medium">자료 조사</span>가 3일 지연 중입니다.
            이 작업에 의존하는 <span className="font-medium">보고서 초안</span>, <span className="font-medium">발표자료 제작</span>의 일정에 영향을 줄 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
