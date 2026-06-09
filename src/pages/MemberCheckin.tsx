import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Clock, CheckCircle2, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { SizeBadge } from '@/components/SizeBadge';
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
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-sm bg-background min-h-screen">
        {/* 헤더 */}
        <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">1분 체크인</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              마감 23:59
            </div>
          </div>
        </header>

        <div className="px-4 py-5 pb-28 space-y-4">
          {/* 날짜 및 안내 */}
          <div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
              <Calendar className="w-3.5 h-3.5" />
              오늘 6월 5일 (수)
            </div>
            {isLateCheckin && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5" />
                마감 시간이 지났습니다. 제출하면 지각 체크인으로 기록됩니다.
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              최소 1개 작업을 업데이트하면 제출할 수 있습니다 ({updatedCount}/{tasks.length} 업데이트됨)
            </p>
          </div>

          {/* 작업별 체크인 */}
          {tasks.map(task => {
            const isExpanded = expanded.has(task.id);
            const subTasks = subTaskMap[task.id] || [];
            return (
              <div key={task.id} className={`bg-card border rounded-xl overflow-hidden transition-colors ${task.updated ? 'border-primary/30' : 'border-border'}`}>
                {/* 작업 헤더 (토글) */}
                <button
                  className="w-full px-4 py-4 text-left"
                  onClick={() => toggleExpand(task.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SizeBadge size={task.size} />
                      <span className="text-sm font-medium">{task.name}</span>
                      {task.updated && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  {!isExpanded && (
                    <p className="text-xs text-muted-foreground mt-1">{task.status} · {task.progress}%</p>
                  )}
                </button>

                {/* 체크인 입력 */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
                    {/* 상태 */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">상태</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['진행 전', '진행 중', '막힘', '완료'] as TaskStatus[]).map(s => (
                          <button
                            key={s}
                            onClick={() => updateTask(task.id, { status: s })}
                            className={`py-2 rounded-lg text-sm border transition-colors ${
                              task.status === s
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border bg-card hover:bg-accent'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 진행률 */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">진행률</label>
                      <div className="flex gap-1.5">
                        {([0, 25, 50, 75, 100] as ProgressValue[]).map(p => (
                          <button
                            key={p}
                            onClick={() => updateTask(task.id, { progress: p })}
                            className={`flex-1 py-2 rounded-lg text-xs border transition-colors ${
                              task.progress === p
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border bg-card hover:bg-accent'
                            }`}
                          >
                            {p}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 막힌 이유 (필수) */}
                    {task.status === '막힘' && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          막힌 이유 <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={task.blockReason}
                          onChange={e => updateTask(task.id, { blockReason: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card"
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

                    {/* 하위 작업 완료 체크 */}
                    {subTasks.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">하위 작업 완료</label>
                        <div className="space-y-2">
                          {subTasks.map(st => (
                            <button
                              key={st.id}
                              onClick={() => toggleSubTask(task.id, st.id)}
                              className="w-full flex items-center gap-2 text-left"
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                task.subTasksDone.includes(st.id) ? 'bg-primary border-primary' : 'border-border'
                              }`}>
                                {task.subTasksDone.includes(st.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <span className={`text-sm ${task.subTasksDone.includes(st.id) ? 'line-through text-muted-foreground' : ''}`}>
                                {st.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 고정 하단 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 py-4 bg-background border-t border-border">
          <button
            disabled={!canSubmit}
            onClick={() => navigate('/checkin-complete')}
            className={`w-full py-3.5 rounded-xl text-sm font-medium transition-opacity ${
              canSubmit ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {canSubmit ? `체크인 제출 (${updatedCount}/${tasks.length}개 업데이트)` : '최소 1개 작업을 업데이트해주세요'}
          </button>
        </div>
      </div>
    </div>
  );
}
