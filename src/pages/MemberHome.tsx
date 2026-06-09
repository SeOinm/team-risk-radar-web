import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { SizeBadge } from '@/components/SizeBadge';
import { sampleTasks, sampleMembers } from '@/data/sampleData';

const myMember = sampleMembers.find(m => m.id === 'm4')!; // 최유진 (팀원)
const myTasks = sampleTasks.filter(t => t.assignees.includes(myMember.id) && t.status !== '취소');
const unassignedTasks = sampleTasks.filter(t => t.assignees.length === 0 && t.status !== '완료' && t.status !== '취소');

export function MemberHome() {
  const navigate = useNavigate();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const todayCheckinDue = true;
  const alreadyCheckedIn = false;
  const nextCheckinDate = '6월 9일 (월)';

  const toggleExpand = (id: string) => {
    const next = new Set(expandedTasks);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedTasks(next);
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-sm bg-background min-h-screen">
        {/* 헤더 */}
        <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">팀플 리스크 레이더</span>
            </div>
            <button onClick={() => navigate('/projects')} className="text-xs text-muted-foreground">목록</button>
          </div>
        </header>

        <div className="px-4 py-5 space-y-4">
          {/* 프로젝트 */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">현재 프로젝트</p>
            <h2 className="mb-0.5">HCI 기말 발표 과제</h2>
            <p className="text-xs text-muted-foreground">인간컴퓨터상호작용 · 마감 6월 13일</p>
          </div>

          {/* 체크인 카드 */}
          {todayCheckinDue && !alreadyCheckedIn ? (
            <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">오늘 체크인 마감 23:59</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">작업 진행 상황을 1분 안에 공유해요</p>
              <button
                onClick={() => navigate('/checkin')}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
              >
                1분 체크인 하기
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">오늘 체크인 완료</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">다음 체크인: {nextCheckinDate}</p>
            </div>
          )}

          {/* 내 담당 작업 */}
          <section>
            <h3 className="mb-3 text-sm">내 담당 작업</h3>
            {myTasks.length === 0 ? (
              <div className="text-center py-8 bg-card border border-border rounded-xl border-dashed">
                <p className="text-sm text-muted-foreground">배정된 작업이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myTasks.map(task => {
                  const expanded = expandedTasks.has(task.id);
                  return (
                    <div key={task.id} className="bg-card border border-border rounded-xl overflow-hidden">
                      <button
                        className="w-full p-4 text-left"
                        onClick={() => toggleExpand(task.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <SizeBadge size={task.size} />
                              <span className="text-sm font-medium truncate">{task.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <StatusChip status={task.status} />
                              <span>{task.progress}%</span>
                              <span>마감 {task.dueDate.slice(5)}</span>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-1">
                            {task.delayed && (
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                            )}
                            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </div>
                        {/* 진행률 바 */}
                        <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </button>

                      {expanded && (
                        <div className="border-t border-border px-4 pb-3">
                          {task.subTasks.length > 0 && (
                            <div className="py-3 space-y-2">
                              {task.subTasks.map(st => (
                                <div key={st.id} className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${st.completed ? 'bg-primary border-primary' : 'border-border'}`}>
                                    {st.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className={`text-xs ${st.completed ? 'line-through text-muted-foreground' : ''}`}>{st.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => navigate(`/my-task/${task.id}`)}
                            className="text-xs text-primary hover:underline"
                          >
                            상세 보기 →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 미배정 작업 (보기만) */}
          {unassignedTasks.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm">미배정 작업</h3>
              <p className="text-xs text-muted-foreground mb-2">아직 담당자가 없는 작업이에요. 담당 배정은 팀장에게 문의하세요.</p>
              <div className="space-y-2">
                {unassignedTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between bg-card border border-dashed border-border rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <SizeBadge size={task.size} />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">마감 {task.dueDate.slice(5)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="pt-2 pb-6">
            <button
              onClick={() => navigate('/my-record')}
              className="w-full py-3 border border-border rounded-xl text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              내 참여 기록 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    '진행 전': 'text-slate-500',
    '진행 중': 'text-sky-600',
    '막힘': 'text-orange-600',
    '완료': 'text-emerald-600',
    '취소': 'text-slate-400 line-through',
  };
  return <span className={`font-medium ${map[status] || ''}`}>{status}</span>;
}
