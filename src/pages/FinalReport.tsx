import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { RoleBadge } from '@/components/RiskBadge';
import { sampleMembers } from '@/data/sampleData';

const projectSummary = {
  name: 'HCI 기말 발표 과제',
  course: '인간컴퓨터상호작용',
  startDate: '2024-04-01',
  endDate: '2024-06-13',
  totalTasks: 7,
  completedTasks: 1,
  totalCheckins: 15,
  completedCheckins: 12,
};

const memberSummary = [
  { id: 'm1', checkinRate: 100, completedTasks: 1, delayedTasks: 0, lateCheckins: 0, missedCheckins: 0, artifactLinks: 2 },
  { id: 'm2', checkinRate: 40, completedTasks: 0, delayedTasks: 1, lateCheckins: 0, missedCheckins: 2, artifactLinks: 0 },
  { id: 'm3', checkinRate: 100, completedTasks: 0, delayedTasks: 0, lateCheckins: 0, missedCheckins: 0, artifactLinks: 0 },
  { id: 'm4', checkinRate: 80, completedTasks: 0, delayedTasks: 0, lateCheckins: 1, missedCheckins: 0, artifactLinks: 0 },
];

const outputs = [
  { taskName: '주제 확정', assignee: '김지훈', date: '2024-05-01', link: 'https://docs.google.com/...' },
  { taskName: '자료 조사', assignee: '박서연', date: '2024-05-30', link: 'https://docs.google.com/...' },
];

const blockedHistory = [
  { taskName: '자료 조사', assignee: '박서연', date: '2024-05-28', reason: '자료 부족', resolved: false },
];

const checkinMissedHistory = [
  { name: '박서연', date: '2024-06-03', consecutive: 1 },
  { name: '박서연', date: '2024-06-05', consecutive: 2 },
];

const cancelledTasks: { title: string; cancelledAt: string; reason: string }[] = [];

const assigneeChanges: { taskName: string; from: string; to: string; date: string }[] = [];

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));

export function FinalReport() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="w-4 h-4" /> 대시보드
          </button>
          <div className="flex items-center justify-between">
            <h1>최종 리포트</h1>
            <p className="text-xs text-muted-foreground italic">PDF 내보내기 및 공유는 MVP 이후 제공 예정입니다</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* 프로젝트 요약 */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="mb-5">프로젝트 요약</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              {[
                ['수업', projectSummary.course],
                ['기간', `${projectSummary.startDate} ~ ${projectSummary.endDate}`],
                ['팀원', `${sampleMembers.length}명`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['전체 작업', `${projectSummary.completedTasks} / ${projectSummary.totalTasks} 완료`],
                ['체크인 완료율', `${Math.round((projectSummary.completedCheckins / projectSummary.totalCheckins) * 100)}%`],
                ['지연 작업', '1개'],
                ['취소 작업', '0개'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 팀원별 참여 요약 */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="mb-5">팀원별 참여 요약</h2>
          <div className="space-y-4">
            {memberSummary.map(ms => {
              const member = memberMap[ms.id];
              if (!member) return null;
              return (
                <div key={ms.id} className="border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {member.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        <RoleBadge role={member.role} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <StatCell label="체크인 참여율" value={`${ms.checkinRate}%`} highlight={ms.checkinRate < 70} />
                    <StatCell label="완료 작업" value={`${ms.completedTasks}개`} />
                    <StatCell label="지연 작업" value={`${ms.delayedTasks}개`} highlight={ms.delayedTasks > 0} />
                    <StatCell label="지각 체크인" value={`${ms.lateCheckins}회`} />
                    <StatCell label="누락 체크인" value={`${ms.missedCheckins}회`} highlight={ms.missedCheckins > 0} />
                    <StatCell label="산출물 링크" value={`${ms.artifactLinks}개`} highlight={ms.artifactLinks === 0} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 산출물 근거 */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="mb-4">산출물 근거</h2>
          {outputs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">등록된 산출물이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {outputs.map((o, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{o.taskName}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">{o.assignee} · {o.date}</p>
                  </div>
                  <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">링크 보기 →</a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 취소 작업 기록 */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="mb-4">취소 작업 기록</h2>
          {cancelledTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">취소된 작업이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {cancelledTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <XCircle className="w-4 h-4 text-slate-400" />
                  <span className="text-sm line-through text-muted-foreground">{t.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{t.cancelledAt}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 막힘 기록 */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="mb-4">막힘 기록</h2>
          {blockedHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">막힘 기록이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {blockedHistory.map((r, i) => (
                <div key={i} className="flex items-start justify-between p-4 rounded-xl border border-amber-200 bg-amber-50">
                  <div>
                    <p className="font-medium text-sm mb-0.5">{r.taskName}</p>
                    <p className="text-xs text-muted-foreground">{r.assignee} · {r.date} · 사유: {r.reason}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.resolved ? '해결됨' : '미해결'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 체크인 누락 기록 */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="mb-4">체크인 누락 기록</h2>
          {checkinMissedHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">모든 팀원이 정기적으로 체크인에 참여했습니다</p>
          ) : (
            <div className="space-y-2">
              {checkinMissedHistory.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">{r.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.date} · 연속 {r.consecutive}회 누락</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 담당자 변경 이력 */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h2 className="mb-4">담당자 변경 이력</h2>
          {assigneeChanges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">담당자 변경 이력이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {assigneeChanges.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <span className="text-sm">{c.taskName}</span>
                  <span className="text-xs text-muted-foreground">{c.from} → {c.to}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{c.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-2 rounded-lg ${highlight ? 'bg-red-50' : 'bg-muted/30'}`}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`font-semibold text-sm ${highlight ? 'text-red-600' : ''}`}>{value}</p>
    </div>
  );
}
