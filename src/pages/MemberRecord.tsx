import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { sampleTasks, sampleMembers } from '@/data/sampleData';

const myMemberId = 'm4';
const myMember = sampleMembers.find(m => m.id === myMemberId)!;
const myTasks = sampleTasks.filter(t => t.assignees.includes(myMemberId));

export function MemberRecord() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-sm bg-background min-h-screen">
        <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/member-home')} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2>내 참여 기록</h2>
          </div>
        </header>

        <div className="px-4 py-5 space-y-5">
          {/* 내 역할 */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {myMember.name[0]}
              </div>
              <div>
                <p className="font-medium text-sm">{myMember.name}</p>
                <p className="text-xs text-muted-foreground">{myMember.role} · HCI 기말 발표 과제</p>
              </div>
            </div>
          </div>

          {/* 내 작업 요약 */}
          <section>
            <h3 className="text-sm font-semibold mb-2">내 담당 작업 ({myTasks.length}개)</h3>
            <div className="space-y-2">
              {myTasks.map(task => (
                <div key={task.id} className="bg-card border border-border rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{task.title}</span>
                    <span className={`text-xs font-medium ${task.status === '완료' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{task.progress}%</span>
                  </div>
                  {/* 내가 만든 하위 작업 */}
                  {task.subTasks.filter(st => st.assigneeId === myMemberId).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">내 하위 작업</p>
                      {task.subTasks.filter(st => st.assigneeId === myMemberId).map(st => (
                        <div key={st.id} className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className={`w-3 h-3 ${st.completed ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                          <span className={st.completed ? 'line-through text-muted-foreground' : ''}>{st.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {myTasks.length === 0 && (
                <div className="text-center py-6 bg-card border border-dashed border-border rounded-xl text-sm text-muted-foreground">
                  배정된 작업이 없습니다
                </div>
              )}
            </div>
          </section>

          {/* 내 체크인 기록 */}
          <section>
            <h3 className="text-sm font-semibold mb-2">내 체크인 기록</h3>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {[
                { date: '6월 5일 (수)', status: '완료', note: '발표 대본 파트 분배 완료' },
                { date: '6월 3일 (월)', status: '완료', note: '' },
                { date: '5월 31일 (금)', status: '지각', note: '대본 작성 중' },
                { date: '5월 29일 (수)', status: '완료', note: '' },
                { date: '5월 27일 (월)', status: '완료', note: '' },
              ].map(r => (
                <div key={r.date} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm">{r.date}</span>
                    <RecordStatus status={r.status} />
                  </div>
                  {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* 내 지각/누락 */}
          <section>
            <h3 className="text-sm font-semibold mb-2">지각·누락 요약</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-amber-600">{myMember.lateCheckins}</p>
                <p className="text-xs text-muted-foreground">지각</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-red-600">{myMember.missedCheckins}</p>
                <p className="text-xs text-muted-foreground">누락</p>
              </div>
            </div>
          </section>

          {/* 전체 팀 리포트 비공개 안내 */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 border border-border rounded-lg text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>전체 팀 리포트는 팀장 및 공동 팀장만 조회할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordStatus({ status }: { status: string }) {
  if (status === '완료') return <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />완료</span>;
  if (status === '지각') return <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium"><Clock className="w-3.5 h-3.5" />지각</span>;
  return <span className="flex items-center gap-0.5 text-xs text-red-600 font-medium"><XCircle className="w-3.5 h-3.5" />누락</span>;
}
