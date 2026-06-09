import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { RoleBadge } from '@/components/RiskBadge';
import { sampleMembers, sampleTasks } from '@/data/sampleData';

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  '안정적으로 참여 중': { label: '안정적으로 참여 중', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  '확인 필요': { label: '확인 필요', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  '작업량 과다': { label: '작업량 과다', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  '배정된 작업 없음': { label: '배정된 작업 없음', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
  '산출물 근거 부족': { label: '산출물 근거 부족', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  '지연 영향 큼': { label: '지연 영향 큼', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export function MemberParticipation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const member = sampleMembers.find(m => m.id === id) || sampleMembers[1]; // 기본: 박서연
  const myTasks = sampleTasks.filter(t => t.assignees.includes(member.id));

  // 박서연의 경우 두 개의 상태 라벨
  const statusKeys = member.id === 'm2'
    ? ['작업량 과다', '확인 필요']
    : [member.statusLabel];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/members')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" /> 팀원 관리
          </button>
          <div className="h-4 border-l border-border" />
          <h1>팀원 참여 요약</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* 팀원 프로필 */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {member.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2>{member.name}</h2>
                  <RoleBadge role={member.role} />
                </div>
                <p className="text-sm text-muted-foreground">가입일 {member.joinDate}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {statusKeys.map(key => {
                const s = statusLabels[key];
                return s ? (
                  <span key={key} className={`px-3 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.color}`}>{s.label}</span>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* 수치 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '담당 작업 수', value: `${myTasks.length}개`, sub: `전체 작업의 ${member.workload}%` },
            { label: '체크인 참여율', value: `${member.checkinRate}%`, sub: `지각 ${member.lateCheckins}회` },
            { label: '누락 횟수', value: `${member.missedCheckins}회`, sub: member.missedCheckins > 0 ? '연속 누락' : '정상' },
            { label: '산출물 링크', value: `${myTasks.reduce((s, t) => s + t.artifactLinks, 0)}개`, sub: '등록됨' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="font-bold text-lg">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* 체크인 현황 경고 (박서연) */}
        {member.missedCheckins > 0 && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{member.missedCheckins}회 연속 체크인 누락</p>
              <p className="text-xs text-red-600">마지막 체크인: 5월 28일 · 담당 작업의 진행 상황을 확인하기 어렵습니다</p>
            </div>
          </div>
        )}

        {/* 담당 작업 */}
        <section>
          <h3 className="mb-3 text-sm font-semibold">담당 작업 ({myTasks.length}개)</h3>
          <div className="space-y-2">
            {myTasks.map(task => (
              <div key={task.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{task.title}</span>
                    {task.delayed && (
                      <span className="text-xs text-orange-600 font-medium flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" />{task.delayDays}일 지연
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={task.status === '완료' ? 'text-emerald-600' : task.status === '막힘' ? 'text-orange-600' : ''}>
                      {task.status}
                    </span>
                    <span>{task.progress}%</span>
                    <span>마감 {task.dueDate.slice(5)}</span>
                    <span>산출물 {task.artifactLinks}개</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* 진행률 바 */}
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                  </div>
                  <button onClick={() => navigate(`/task/${task.id}`)} className="text-xs text-primary hover:underline">상세</button>
                </div>
              </div>
            ))}
            {myTasks.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground bg-card border border-dashed border-border rounded-xl">
                배정된 작업이 없습니다
              </div>
            )}
          </div>
        </section>

        {/* 체크인 기록 간략 */}
        <section>
          <h3 className="mb-3 text-sm font-semibold">최근 체크인 기록</h3>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {[
              { date: '6월 5일 (수)', status: '누락' },
              { date: '6월 3일 (월)', status: '누락' },
              { date: '5월 31일 (금)', status: '완료' },
              { date: '5월 29일 (수)', status: '완료' },
              { date: '5월 27일 (월)', status: '완료' },
            ].map(r => (
              <div key={r.date} className="px-5 py-3 flex items-center justify-between">
                <span className="text-sm">{r.date}</span>
                <RecordStatus status={r.status} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function RecordStatus({ status }: { status: string }) {
  if (status === '완료') return <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />완료</span>;
  if (status === '지각') return <span className="flex items-center gap-1 text-xs text-amber-600 font-medium"><Clock className="w-3.5 h-3.5" />지각</span>;
  return <span className="flex items-center gap-1 text-xs text-red-600 font-medium"><XCircle className="w-3.5 h-3.5" />누락</span>;
}
