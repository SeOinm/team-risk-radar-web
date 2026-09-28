import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { sampleTasks, sampleMembers } from '@/data/sampleData';
import { Btn, RiskScore, SizeBadgeDs, StatusChip, ProgressBar, FilterTabs, NavBack } from '@/components/ds';

type SortKey = '마감일' | '진행률' | '리스크';
type FilterKey = '전체' | '미배정' | '막힘' | '지연' | '마감 임박' | '완료 근거 부족' | '취소';

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));

export function TaskBoard() {
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortKey>('마감일');
  const [filter, setFilter] = useState<FilterKey>('전체');
  const [showCancelled, setShowCancelled] = useState(false);

  const filtered = sampleTasks.filter(t => {
    if (!showCancelled && filter !== '취소' && t.cancelled) return false;
    if (filter === '미배정') return t.assignees.length === 0;
    if (filter === '막힘') return t.status === '막힘';
    if (filter === '마감 임박') return !t.delayed && t.status !== '완료';
    if (filter === '완료 근거 부족') return t.status === '완료' && t.artifactLinks === 0;
    if (filter === '취소') return t.cancelled;
    if (filter === '지연') return t.delayed;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === '마감일') return a.dueDate.localeCompare(b.dueDate);
    if (sort === '진행률') return b.progress - a.progress;
    if (sort === '리스크') return b.riskScore - a.riskScore;
    return 0;
  });

  const unassigned = sampleTasks.filter(t => t.assignees.length === 0 && !t.cancelled).length;
  const delayed = sampleTasks.filter(t => t.delayed).length;

  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-20 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavBack label="대시보드" onClick={() => navigate('/dashboard')} />
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <span className="text-[13px] font-semibold text-[#111827]">작업 보드</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
            <span>전체 {sampleTasks.length}</span>
            <span>·</span>
            <span className={unassigned > 0 ? 'text-[#D97706] font-medium' : ''}>미배정 {unassigned}</span>
            <span>·</span>
            <span className={delayed > 0 ? 'text-[#DC2626] font-medium' : ''}>지연 {delayed}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-5">
        {/* Filters + sort */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterTabs<FilterKey>
              options={[
                { label: '전체', value: '전체' },
                { label: '미배정', value: '미배정' },
                { label: '막힘', value: '막힘' },
                { label: '지연', value: '지연' },
                { label: '마감 임박', value: '마감 임박' },
                { label: '완료 근거 부족', value: '완료 근거 부족' },
                { label: '취소', value: '취소' },
              ]}
              value={filter}
              onChange={setFilter}
            />
            <label className="flex items-center gap-1.5 text-[12px] text-[#6B7280] cursor-pointer ml-1">
              <input type="checkbox" checked={showCancelled} onChange={e => setShowCancelled(e.target.checked)} className="w-3 h-3 rounded" />
              취소 포함
            </label>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[#9CA3AF] mr-1">정렬</span>
            {(['마감일', '진행률', '리스크'] as SortKey[]).map(s => (
              <Btn
                key={s}
                variant={sort === s ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSort(s)}
              >
                {s}
              </Btn>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] w-8">#</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF]">작업명</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] w-24">담당자</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] w-20">상태</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] w-32">진행률</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] w-24">마감일</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] w-10">크기</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#9CA3AF] w-24">리스크</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {sorted.map((task, i) => (
                <tr
                  key={task.id}
                  className={`hover:bg-[#F9FAFB] transition-colors cursor-pointer ${task.cancelled ? 'opacity-40' : ''}`}
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  <td className="px-4 py-3 text-[11px] text-[#9CA3AF]">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {task.delayed && <AlertTriangle className="w-3 h-3 text-[#EA580C] shrink-0" />}
                      <span className={`text-[13px] font-medium text-[#111827] ${task.cancelled ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                      {task.prerequisiteIds.length > 0 && (
                        <span className="text-[11px] text-[#9CA3AF]">→ 선행 있음</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {task.assignees.length === 0 ? (
                      <span className="text-[12px] text-[#9CA3AF] italic">미배정</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {task.assignees.map(id => (
                          <span key={id} className="text-[11px] px-1.5 py-0.5 bg-[#F3F4F6] rounded text-[#374151]">
                            {memberMap[id]?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={task.cancelled ? '취소' : task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={task.progress} className="w-16" />
                      <span className="text-[11px] text-[#9CA3AF] w-6">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[12px] ${task.delayed ? 'text-[#DC2626] font-medium' : 'text-[#6B7280]'}`}>
                      {task.dueDate.slice(5)}
                      {task.delayed && ` +${task.delayDays}일`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SizeBadgeDs size={task.size} />
                  </td>
                  <td className="px-4 py-3">
                    <RiskScore score={task.riskScore} />
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
