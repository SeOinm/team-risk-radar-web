import { useCallback } from "react";
import { Link, useParams } from "react-router";
import { ProjectLoader } from "@/components/ProjectLoader";
import { Btn } from "@/components/ds";
import { useApiQuery } from "@/hooks/useApiQuery";
import { checkinsApi } from "@/api/checkins";
import { checkinOverviewApi, type CheckinCounts } from "@/api/checkinOverview";
import type { ProjectResponse } from "@/api/projects";
export function ProjectCheckinStatus() {
  const { projectId = "" } = useParams();
  return (
    <ProjectLoader key={projectId} id={projectId}>
      {(p) => <Overview project={p} />}
    </ProjectLoader>
  );
}
function Counts({ data }: { data: CheckinCounts }) {
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[
        ["대상", data.eligible],
        ["제출", data.submitted],
        ["정시 제출", data.onTime],
        ["지각 제출", data.late],
        ["미제출 확정", data.missed],
        ["제출 대기", data.pending],
      ].map(([label, n]) => (
        <div key={label}>
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="text-lg font-semibold">{n}</dd>
        </div>
      ))}
    </dl>
  );
}
function Overview({ project }: { project: ProjectResponse }) {
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [summary, current] = await Promise.all([
        checkinOverviewApi.summary(project.id, signal),
        checkinsApi.current(project.id, signal),
      ]);
      const status = current.round
        ? await checkinOverviewApi.status(project.id, current.round.id, signal)
        : null;
      return { summary, status };
    },
    [project.id],
  );
  const q = useApiQuery(load);
  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 flex items-center gap-3 px-4 border-b border-border">
        <Link to={`/projects/${project.id}`} className="truncate text-sm">
          〈 {project.title}
        </Link>
        <Link to="/projects" className="ml-auto shrink-0 text-sm">
          홈
        </Link>
      </header>
      <main className="max-w-3xl mx-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">팀 체크인 현황</h1>
          <Btn disabled={q.loading} onClick={q.retry}>
            새로고침
          </Btn>
        </div>
        {q.loading ? (
          <p>현황을 불러오고 있습니다…</p>
        ) : q.error ? (
          <p role="alert">{q.error}</p>
        ) : (
          q.data && (
            <>
              <section className="border border-border rounded-md p-5 space-y-4">
                <h2 className="font-semibold">누적 체크인율</h2>
                <p className="text-2xl font-semibold">
                  {q.data.summary.eligible > 0
                    ? `${Math.round((q.data.summary.submitted / q.data.summary.eligible) * 1000) / 10}%`
                    : "집계 대상 없음"}
                </p>
                <Counts data={q.data.summary} />
                <p className="text-xs text-muted-foreground">
                  체크인마다 집계된 대상과 제출 건수를 합산한 값입니다.
                </p>
              </section>
              <section className="border border-border rounded-md p-5 space-y-4">
                <h2 className="font-semibold">
                  {q.data.status
                    ? `${q.data.status.scheduledDate} 제출 현황`
                    : "현재 제출 현황"}
                </h2>
                {q.data.status ? (
                  <>
                    <Counts data={q.data.status.summary} />
                    {q.data.status.summary.eligible === 0 && (
                      <p className="text-sm text-muted-foreground">
                        이번 체크인 제출 대상자가 없습니다.
                      </p>
                    )}
                  </>
                ) : (
                  <p>아직 체크인이 열리지 않았습니다.</p>
                )}
              </section>
            </>
          )
        )}
      </main>
    </div>
  );
}
