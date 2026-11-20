import { Link } from 'react-router';
import { sampleMembers } from '@/data/sampleData';
import { Badge, RoleBadgeDs, NavBack } from '@/components/ds';

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
  { id: 'm1', checkinRate: 100, completedTasks: 1, delayedTasks: 0, lateCheckins: 0, missedCheckins: 0 },
  { id: 'm2', checkinRate: 40, completedTasks: 0, delayedTasks: 1, lateCheckins: 0, missedCheckins: 2 },
  { id: 'm3', checkinRate: 100, completedTasks: 0, delayedTasks: 0, lateCheckins: 0, missedCheckins: 0 },
  { id: 'm4', checkinRate: 80, completedTasks: 0, delayedTasks: 0, lateCheckins: 1, missedCheckins: 0 },
];

const blockedHistory = [
  { taskName: '자료 조사', assignee: '박서연', date: '2024-05-28', reason: '자료 부족', resolved: false },
];

const checkinMissedHistory = [
  { name: '박서연', date: '2024-06-03', consecutive: 1 },
  { name: '박서연', date: '2024-06-05', consecutive: 2 },
];

const cancelledTasks: { title: string; cancelledAt: string }[] = [];
const assigneeChanges: { taskName: string; from: string; to: string; date: string }[] = [];

const memberMap = Object.fromEntries(sampleMembers.map(m => [m.id, m]));

const activity = [
  ...blockedHistory.map(item => ({
    date: item.date,
    title: item.taskName,
    detail: `${item.assignee} · ${item.reason}`,
    label: item.resolved ? '막힘 해결' : '막힘',
    variant: item.resolved ? 'safe' as const : 'caution' as const,
  })),
  ...checkinMissedHistory.map(item => ({
    date: item.date,
    title: item.name,
    detail: `연속 ${item.consecutive}회 누락`,
    label: '체크인 누락',
    variant: 'critical' as const,
  })),
  ...cancelledTasks.map(item => ({
    date: item.cancelledAt,
    title: item.title,
    detail: '',
    label: '작업 취소',
    variant: 'default' as const,
  })),
  ...assigneeChanges.map(item => ({
    date: item.date,
    title: item.taskName,
    detail: `${item.from} → ${item.to}`,
    label: '담당자 변경',
    variant: 'default' as const,
  })),
].sort((a, b) => b.date.localeCompare(a.date));

export function FinalReport() {
  const checkinRate = Math.round(projectSummary.completedCheckins / projectSummary.totalCheckins * 100);
  const delayedTasks = memberSummary.reduce((total, member) => total + member.delayedTasks, 0);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 pr-6">
          <div className="flex h-full min-w-0 items-center gap-2">
            <NavBack fallback="/dashboard" />
            <span className="truncate text-sm font-medium">최종 리포트</span>
          </div>
          <Link to="/task-board" className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
            작업 보드
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 sm:py-12">
        <section aria-labelledby="report-title">
          <h1 id="report-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">{projectSummary.name}</h1>
          <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-base text-muted-foreground">
            <span>{projectSummary.course}</span>
            <span aria-hidden="true">·</span>
            <span>{projectSummary.startDate} ~ {projectSummary.endDate}</span>
          </p>
          <div className="mt-7 grid gap-5 rounded-xl border border-border bg-slate-50/70 p-5 sm:grid-cols-2 sm:gap-0 sm:p-6">
            <dl className="grid grid-cols-2 items-center gap-4 sm:pr-6">
              <div>
                <dt className="text-sm font-medium text-muted-foreground sm:text-base">완료 작업</dt>
                <dd className="mt-2 text-3xl font-semibold tabular-nums sm:text-4xl">
                  {projectSummary.completedTasks}<span className="text-base font-medium text-muted-foreground"> / {projectSummary.totalTasks}</span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground sm:text-base">지연 작업</dt>
                <dd className="mt-2 text-3xl font-semibold tabular-nums sm:text-4xl">{delayedTasks}<span className="ml-1 text-base font-medium text-muted-foreground">개</span></dd>
              </div>
            </dl>
            <dl className="grid grid-cols-[1fr_auto] items-center gap-x-4 border-t border-border pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
              <dt className="self-end text-sm font-medium text-muted-foreground sm:text-base">체크인 완료율</dt>
              <dd className="col-start-2 row-span-2 row-start-1">
                <div className="grid size-16 place-items-center rounded-full sm:size-20"
                  style={{ background: `conic-gradient(var(--color-blue-600) 0 ${checkinRate}%, var(--color-slate-200) ${checkinRate}% 100%)` }}>
                  <span className="grid size-[3.25rem] place-items-center rounded-full bg-white text-lg font-semibold tabular-nums sm:size-[4.125rem] sm:text-2xl">
                    {checkinRate}%
                  </span>
                </div>
              </dd>
              <dd className="mt-1 self-start text-base font-semibold tabular-nums">
                {projectSummary.totalCheckins}건 중 {projectSummary.completedCheckins}건 완료
              </dd>
            </dl>
          </div>
        </section>

        <section className="mt-9" aria-labelledby="participation-title">
          <h2 id="participation-title" className="text-xl font-semibold">팀원별 참여 <span className="ml-1 text-sm font-normal text-muted-foreground">{sampleMembers.length}명</span></h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-base" aria-labelledby="participation-title">
              <thead className="border-y border-border bg-slate-50/70 text-sm text-muted-foreground">
                <tr>
                  <th scope="col" className="px-2 py-2.5 font-medium">팀원</th>
                  <th scope="col" className="px-2 py-2.5 font-medium">체크인율</th>
                  <th scope="col" className="px-2 py-2.5 text-right font-medium">완료 작업</th>
                  <th scope="col" className="px-2 py-2.5 text-right font-medium">지연 작업</th>
                  <th scope="col" className="px-2 py-2.5 text-right font-medium">지각</th>
                  <th scope="col" className="px-2 py-2.5 text-right font-medium">누락</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border border-b border-border">
                {memberSummary.map(summary => {
                  const member = memberMap[summary.id];
                  if (!member) return null;
                  return (
                    <tr key={summary.id}>
                      <th scope="row" className="px-2 py-3 font-medium">
                        <div className="flex flex-wrap items-center gap-2">
                          {member.name}
                          <RoleBadgeDs role={member.role} />
                        </div>
                      </th>
                      <td className="px-2 py-3 font-medium tabular-nums">{summary.checkinRate}%</td>
                      <td className="px-2 py-3 text-right tabular-nums">{summary.completedTasks}개</td>
                      <td className="px-2 py-3 text-right tabular-nums">{summary.delayedTasks}개</td>
                      <td className="px-2 py-3 text-right tabular-nums">{summary.lateCheckins}회</td>
                      <td className="px-2 py-3 text-right tabular-nums">{summary.missedCheckins}회</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-9" aria-labelledby="activity-title">
          <h2 id="activity-title" className="text-xl font-semibold">주요 기록</h2>
          {activity.length === 0 ? (
            <p className="mt-3 border-y border-border py-4 text-sm text-muted-foreground">기록된 활동이 없습니다.</p>
          ) : (
            <ol className="mt-3 divide-y divide-border border-y border-border">
              {activity.map((item, index) => (
                <li key={`${item.date}-${index}`} className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr] sm:gap-3">
                  <time dateTime={item.date} className="text-sm tabular-nums text-muted-foreground sm:pt-1">{item.date}</time>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
                    <Badge variant={item.variant}>{item.label}</Badge>
                    <span className="font-medium">{item.title}</span>
                    {item.detail && <span className="text-sm text-muted-foreground">{item.detail}</span>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
