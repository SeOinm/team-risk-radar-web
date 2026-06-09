import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { SizeBadge } from '@/components/SizeBadge';
import { RiskBadge } from '@/components/RiskBadge';
import { ArrowLeft, Link as LinkIcon, AlertCircle, AlertTriangle, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { sampleTasks, sampleMembers } from '@/data/sampleData';

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));

const checkinHistory = [
  { date: '2024-05-30', status: '진행 중', progress: 25, note: '논문 5편 검토 완료. 추가 자료 필요', outputLink: 'https://docs.google.com/...' },
  { date: '2024-05-28', status: '진행 중', progress: 10, note: '주제 관련 논문 리스트 작성', outputLink: null },
];

export function TaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const task = sampleTasks.find(t => t.id === id) || sampleTasks[1];
  const [cancelled, setCancelled] = useState(task.cancelled ?? false);

  const prereqTasks = task.prerequisiteIds.map(pid => sampleTasks.find(t => t.id === pid)).filter(Boolean);
  const dependentTasks = sampleTasks.filter(t => t.prerequisiteIds.includes(task.id));

  // 진행률 분석
  const subTaskDoneRatio = task.subTasks.length > 0
    ? Math.round((task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100)
    : null;
  const progressGap = subTaskDoneRatio !== null ? Math.abs(task.progress - subTaskDoneRatio) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="w-4 h-4" /> 뒤로
          </button>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={cancelled ? 'line-through text-muted-foreground' : ''}>{task.title}</h1>
              <SizeBadge size={task.size} />
              {task.delayed && <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">{task.delayDays}일 지연</span>}
              {cancelled && <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">취소됨</span>}
              <RiskBadge score={task.riskScore} />
            </div>
            <div className="flex gap-2">
              {!cancelled ? (
                <button
                  onClick={() => setCancelled(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm text-muted-foreground"
                >
                  <XCircle className="w-4 h-4" /> 작업 취소
                </button>
              ) : (
                <button
                  onClick={() => setCancelled(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm text-primary"
                >
                  <RotateCcw className="w-4 h-4" /> 복구
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* 리스크 이유 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h3 className="mb-4">이 작업이 왜 위험한지</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1.5">핵심 병목 작업</p>
                    <p className="text-sm text-muted-foreground mb-2">이 작업이 완료되지 않으면 후속 작업 {dependentTasks.length}개가 시작되지 못합니다</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {dependentTasks.map(t => (
                        <span key={t!.id} className="text-xs px-2 py-1 rounded-lg bg-white border border-red-200 text-red-700">{t!.title}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">담당자 업데이트 부족</p>
                    <p className="text-sm text-muted-foreground">박서연이 2회 연속 체크인하지 않았습니다. 작업 진행 상황을 확인하기 어렵습니다.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 진행률 분석 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h3 className="mb-4">진행률 분석</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {subTaskDoneRatio !== null && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">하위 작업 완료율</p>
                    <p className="text-lg font-bold">{subTaskDoneRatio}%</p>
                    <p className="text-xs text-muted-foreground">
                      {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length}개 완료
                    </p>
                  </div>
                )}
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">표시 진행률</p>
                  <p className="text-lg font-bold">{task.progress}%</p>
                  <p className="text-xs text-muted-foreground">체크인 기준</p>
                </div>
              </div>
              {progressGap >= 30 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>하위 작업 완료율과 표시 진행률의 차이가 {progressGap}%p입니다. 진행률 확인이 필요합니다.</p>
                </div>
              )}
            </section>

            {/* 하위 작업 */}
            {task.subTasks.length > 0 && (
              <section className="bg-card rounded-xl border border-border p-6">
                <h3 className="mb-4">하위 작업</h3>
                <div className="space-y-2">
                  {task.subTasks.map(st => (
                    <div key={st.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${st.completed ? 'bg-primary border-primary' : 'border-border'}`}>
                        {st.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`flex-1 text-sm ${st.completed ? 'line-through text-muted-foreground' : ''}`}>{st.title}</span>
                      <span className="text-xs text-muted-foreground">{memberMap[st.assigneeId]?.name || '미배정'}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 체크인 이력 */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h3 className="mb-4">체크인 이력</h3>
              {checkinHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">체크인 기록이 없습니다</p>
              ) : (
                <div className="space-y-4">
                  {checkinHistory.map((checkin, i) => (
                    <div key={i} className="relative pl-5 pb-4 border-l-2 border-border last:border-0 last:pb-0">
                      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-primary -translate-x-[7px]" />
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{checkin.date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">{checkin.status}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{checkin.progress}%</span>
                      </div>
                      {checkin.note && <p className="text-sm text-muted-foreground mb-1">{checkin.note}</p>}
                      {checkin.outputLink && (
                        <a href={checkin.outputLink} className="text-xs text-primary hover:underline flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> 산출물 링크
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="space-y-5">
            {/* 작업 정보 */}
            <section className="bg-card rounded-xl border border-border p-5">
              <h3 className="mb-4">작업 정보</h3>
              <div className="space-y-3">
                <InfoRow label="담당자">
                  <div className="flex flex-wrap gap-1">
                    {task.assignees.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">미배정</span>
                    ) : (
                      task.assignees.map(aid => (
                        <span key={aid} className="text-xs bg-muted px-2 py-0.5 rounded-full">{memberMap[aid]?.name}</span>
                      ))
                    )}
                  </div>
                </InfoRow>
                <InfoRow label="마감일">
                  <span className={`text-sm ${task.delayed ? 'text-orange-600 font-medium' : ''}`}>{task.dueDate}</span>
                </InfoRow>
                <InfoRow label="상태">
                  <span className="text-sm">{cancelled ? '취소' : task.status}</span>
                </InfoRow>
                <InfoRow label="크기"><SizeBadge size={task.size} /></InfoRow>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">진행률</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{task.progress}%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 선행 작업 */}
            {prereqTasks.length > 0 && (
              <section className="bg-card rounded-xl border border-border p-5">
                <h3 className="mb-3">선행 작업</h3>
                <div className="space-y-2">
                  {prereqTasks.map(t => t && (
                    <div key={t.id} className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium">{t.title}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{t.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">담당: {t.assignees.map(id => memberMap[id]?.name).join(', ') || '미배정'}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 후속 작업 */}
            {dependentTasks.length > 0 && (
              <section className="bg-card rounded-xl border border-border p-5">
                <h3 className="mb-3">후속 작업</h3>
                <div className="space-y-2">
                  {dependentTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => navigate(`/task/${t.id}`)}
                      className="w-full p-3 rounded-lg border border-border hover:bg-accent text-left transition-colors"
                    >
                      <span className="text-sm font-medium">{t.title}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">담당: {t.assignees.map(id => memberMap[id]?.name).join(', ') || '미배정'}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 산출물 링크 */}
            <section className="bg-card rounded-xl border border-border p-5">
              <h3 className="mb-3">산출물 ({task.artifactLinks}개)</h3>
              {task.artifactLinks === 0 ? (
                <p className="text-xs text-muted-foreground">등록된 산출물이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {Array.from({ length: task.artifactLinks }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <LinkIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-primary hover:underline cursor-pointer">산출물 링크 {i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}
