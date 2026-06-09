import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { SizeBadge } from '@/components/SizeBadge';
import { RiskBadge } from '@/components/RiskBadge';
import { sampleTasks, sampleMembers } from '@/data/sampleData';

type SortKey = '마감일' | '진행률' | '상태' | '리스크';
type FilterKey = '전체' | '미배정' | '마감 임박' | '막힘' | '완료 근거 부족' | '취소';

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));

export function TaskBoard() {
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortKey>('마감일');
  const [filter, setFilter] = useState<FilterKey>('전체');
  const [showCancelled, setShowCancelled] = useState(false);

  const filtered = sampleTasks.filter(t => {
    if (!showCancelled && t.cancelled) return false;
    if (filter === '미배정') return t.assignees.length === 0;
    if (filter === '마감 임박') return !t.delayed && t.status !== '완료';
    if (filter === '막힘') return t.status === '막힘';
    if (filter === '완료 근거 부족') return t.status === '완료' && t.artifactLinks === 0;
    if (filter === '취소') return t.cancelled;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === '마감일') return a.dueDate.localeCompare(b.dueDate);
    if (sort === '진행률') return b.progress - a.progress;
    if (sort === '리스크') return b.riskScore - a.riskScore;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
              <ArrowLeft className="w-4 h-4" /> 대시보드
            </button>
            <div className="h-4 border-l border-border" />
            <h1>작업 보드</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* 필터/정렬 */}
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {(['전체', '미배정', '마감 임박', '막힘', '완료 근거 부족'] as FilterKey[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'
                }`}
              >
                {f}
              </button>
            ))}
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={showCancelled}
                onChange={e => setShowCancelled(e.target.checked)}
                className="rounded"
              />
              취소된 작업 포함
            </label>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">정렬:</span>
            {(['마감일', '진행률', '상태', '리스크'] as SortKey[]).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  sort === s ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 작업 목록 요약 */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <span>전체 {sampleTasks.length}개</span>
          <span>·</span>
          <span>미배정 {sampleTasks.filter(t => t.assignees.length === 0).length}개</span>
          <span>·</span>
          <span>지연 {sampleTasks.filter(t => t.delayed).length}개</span>
        </div>

        {/* 테이블 */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8">#</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">작업명</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">담당자</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">상태</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">진행률</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">마감일</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">크기</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">리스크</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((task, i) => (
                <tr
                  key={task.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${task.cancelled ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {task.delayed && <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                      <button
                        onClick={() => navigate(`/task/${task.id}`)}
                        className={`hover:text-primary hover:underline font-medium ${task.cancelled ? 'line-through' : ''}`}
                      >
                        {task.title}
                      </button>
                      {task.prerequisiteIds.length > 0 && (
                        <span className="text-xs text-muted-foreground">(선행 있음)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {task.assignees.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">미배정</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        {task.assignees.map(id => (
                          <span key={id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted">
                            {memberMap[id]?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${task.delayed ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                      {task.delayed ? `${task.dueDate.slice(5)} (${task.delayDays}일 지연)` : task.dueDate.slice(5)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SizeBadge size={task.size} />
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge score={task.riskScore} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/task/${task.id}`)}
                      className="text-xs text-primary hover:underline"
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    '진행 전': { bg: 'bg-slate-100', text: 'text-slate-600' },
    '진행 중': { bg: 'bg-sky-100', text: 'text-sky-700' },
    '막힘': { bg: 'bg-orange-100', text: 'text-orange-700' },
    '완료': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    '취소': { bg: 'bg-slate-100', text: 'text-slate-400' },
  };
  const s = map[status] || { bg: 'bg-muted', text: 'text-muted-foreground' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
}
