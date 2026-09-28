import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, CheckSquare, Square, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { SizeBadgeDs, StatusChip, Btn } from '@/components/ds';

import type { TaskStatus, TaskSize } from '@/types';
type ProgressValue = 0 | 25 | 50 | 75 | 100;

interface TaskCheckin {
  id: string;
  name: string;
  size: TaskSize;
  status: TaskStatus;
  progress: ProgressValue;
  blockReason: string;
  updated: boolean;
  subTasksDone: string[];
}

const myCheckinTasks: TaskCheckin[] = [
  { id: 't5', name: '발표 대본 작성', size: 'M', status: '진행 전', progress: 0, blockReason: '', updated: false, subTasksDone: [] },
  { id: 't4', name: '발표자료 제작', size: 'L', status: '진행 전', progress: 0, blockReason: '', updated: false, subTasksDone: [] },
];

const subTaskMap: Record<string, { id: string; title: string }[]> = {
  't5': [
    { id: 'st14', title: '파트 분배' },
    { id: 'st15', title: '각자 대본 작성' },
  ],
  't4': [
    { id: 'st11', title: '슬라이드 구조 설계' },
    { id: 'st12', title: '디자인 템플릿 적용' },
  ],
};

export function MemberCheckin() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskCheckin[]>(myCheckinTasks);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['t5']));
  const isLateCheckin = false;

  const updateTask = (id: string, updates: Partial<TaskCheckin>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updated: true } : t));
  };

  const toggleSubTask = (taskId: string, stId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const done = t.subTasksDone.includes(stId)
        ? t.subTasksDone.filter(id => id !== stId)
        : [...t.subTasksDone, stId];
      return { ...t, subTasksDone: done, updated: true };
    }));
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const updatedCount = tasks.filter(t => t.updated).length;
  const canSubmit = updatedCount >= 1;

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white relative">
        {/* Header */}
        <header className="h-12 border-b border-[#E5E7EB] bg-white sticky top-0 z-10 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#111827]" />
            <span className="text-[13px] font-semibold text-[#111827]">1분 체크인</span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-[#9CA3AF]">
            <Clock className="w-3.5 h-3.5" />
            마감 23:59
          </div>
        </header>

        <div className="px-4 py-4 pb-28 space-y-4">
          {/* Date + late warning */}
          <div>
            <p className="text-[12px] text-[#9CA3AF] mb-1">오늘 · 6월 5일 (수)</p>
            {isLateCheckin && (
              <div className="text-[12px] text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded-md px-3 py-2 mb-2">
                마감 시간이 지났습니다. 제출하면 지각 체크인으로 기록됩니다.
              </div>
            )}
            <p className="text-[12px] text-[#9CA3AF]">
              최소 1개 작업을 업데이트하면 제출 가능 ({updatedCount}/{tasks.length})
            </p>
          </div>

          {/* Task cards */}
          {tasks.map(task => {
            const isExpanded = expanded.has(task.id);
            const subTasks = subTaskMap[task.id] || [];
            return (
              <div
                key={task.id}
                className={`border rounded-md overflow-hidden ${
                  task.updated ? 'border-[#111827]' : 'border-[#E5E7EB]'
                }`}
              >
                {/* Collapse toggle */}
                <button
                  className="w-full px-4 py-3 text-left flex items-center justify-between"
                  onClick={() => toggleExpand(task.id)}
                >
                  <div className="flex items-center gap-2">
                    <SizeBadgeDs size={task.size} />
                    <span className="text-[13px] font-medium text-[#111827]">{task.name}</span>
                    {task.updated && (
                      <span className="text-[11px] text-[#16A34A] font-medium">● 업데이트됨</span>
                    )}
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
                    : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                  }
                </button>

                {!isExpanded && (
                  <div className="px-4 pb-2.5">
                    <StatusChip status={task.status} />
                    <span className="text-[11px] text-[#9CA3AF] ml-2">{task.progress}%</span>
                  </div>
                )}

                {/* Expanded inputs */}
                {isExpanded && (
                  <div className="border-t border-[#E5E7EB] px-4 py-4 space-y-4 bg-[#F9FAFB]">
                    {/* Status */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#9CA3AF] mb-2">상태</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['진행 전', '진행 중', '막힘', '완료'] as TaskStatus[]).map(s => (
                          <button
                            key={s}
                            onClick={() => updateTask(task.id, { status: s })}
                            className={`h-8 rounded-md text-[12px] font-medium border transition-colors ${
                              task.status === s
                                ? 'bg-[#111827] text-white border-[#111827]'
                                : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F3F4F6]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#9CA3AF] mb-2">진행률</label>
                      <div className="flex gap-1">
                        {([0, 25, 50, 75, 100] as ProgressValue[]).map(p => (
                          <button
                            key={p}
                            onClick={() => updateTask(task.id, { progress: p })}
                            className={`flex-1 h-8 rounded-md text-[11px] font-medium border transition-colors ${
                              task.progress === p
                                ? 'bg-[#111827] text-white border-[#111827]'
                                : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F3F4F6]'
                            }`}
                          >
                            {p}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Blocked reason */}
                    {task.status === '막힘' && (
                      <div>
                        <label className="block text-[11px] font-medium text-[#9CA3AF] mb-2">
                          막힌 이유 <span className="text-[#DC2626]">*</span>
                        </label>
                        <select
                          value={task.blockReason}
                          onChange={e => updateTask(task.id, { blockReason: e.target.value })}
                          className="w-full h-8 px-3 text-[12px] bg-white border border-[#E5E7EB] rounded-md outline-none focus:ring-1 focus:ring-[#111827]"
                        >
                          <option value="">선택해주세요</option>
                          <option value="time">시간 부족</option>
                          <option value="material">자료 부족</option>
                          <option value="response">팀원 응답 없음</option>
                          <option value="tech">기술 문제</option>
                          <option value="unclear">요구사항 불명확</option>
                          <option value="other">기타</option>
                        </select>
                      </div>
                    )}

                    {/* Sub-tasks */}
                    {subTasks.length > 0 && (
                      <div>
                        <label className="block text-[11px] font-medium text-[#9CA3AF] mb-2">하위 작업 완료</label>
                        <div className="space-y-1.5">
                          {subTasks.map(st => {
                            const done = task.subTasksDone.includes(st.id);
                            return (
                              <button
                                key={st.id}
                                onClick={() => toggleSubTask(task.id, st.id)}
                                className="flex items-center gap-2 w-full text-left"
                              >
                                {done
                                  ? <CheckSquare className="w-4 h-4 text-[#111827] shrink-0" />
                                  : <Square className="w-4 h-4 text-[#D1D5DB] shrink-0" />
                                }
                                <span className={`text-[12px] ${done ? 'line-through text-[#9CA3AF]' : 'text-[#374151]'}`}>
                                  {st.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fixed bottom submit */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 py-4 bg-white border-t border-[#E5E7EB]">
          <Btn
            variant={canSubmit ? 'primary' : 'secondary'}
            disabled={!canSubmit}
            className="w-full h-11 text-[14px]"
            onClick={() => navigate('/checkin-complete')}
          >
            {canSubmit
              ? `체크인 제출 (${updatedCount}/${tasks.length}개 업데이트)`
              : '최소 1개 작업을 업데이트해주세요'
            }
          </Btn>
        </div>
      </div>
    </div>
  );
}
