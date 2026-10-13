import { checkinStatusLabel } from "@/lib/checkinStatus";
import { useCallback, useState } from "react";
import { Link, useParams } from "react-router";
import { ProjectLoader } from "@/components/ProjectLoader";
import { Btn } from "@/components/ds";
import { CheckinSubmissionView } from "@/components/CheckinSubmissionView";
import { checkinOverviewApi } from "@/api/checkinOverview";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { ProjectResponse } from "@/api/projects";
export function ProjectCheckinHistory() {
  const { projectId = "" } = useParams();
  return (
    <ProjectLoader key={projectId} id={projectId}>
      {(p) => <History project={p} />}
    </ProjectLoader>
  );
}
function History({ project }: { project: ProjectResponse }) {
  const [cursors, setCursors] = useState<(number | undefined)[]>([undefined]);
  const cursor = cursors.at(-1);
  const load = useCallback(
    (signal: AbortSignal) =>
      checkinOverviewApi.history(project.id, cursor, signal),
    [project.id, cursor],
  );
  const q = useApiQuery(load);
  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 px-4 flex items-center gap-3 border-b border-border">
        <Link to={`/projects/${project.id}`} className="truncate text-sm">
          〈 {project.title}
        </Link>
        <Link to="/projects" className="ml-auto shrink-0 text-sm">
          홈
        </Link>
      </header>
      <main className="max-w-3xl mx-auto p-6 space-y-5">
        <div className="flex justify-between gap-3">
          <h1 className="text-lg font-semibold">내 체크인 기록</h1>
          <Btn disabled={q.loading} onClick={q.retry}>
            새로고침
          </Btn>
        </div>
        {q.loading ? (
          <p role="status">기록을 불러오고 있습니다…</p>
        ) : q.error ? (
          <>
            <p role="alert">{q.error}</p>
            <Btn onClick={q.retry}>다시 시도</Btn>
          </>
        ) : (
          q.data && (
            <>
              {!q.data.items.length && <p>체크인 기록이 없습니다.</p>}
              {q.data.items.map((h) => (
                <article
                  key={h.round.id}
                  className="rounded-md border border-border p-5 space-y-3"
                >
                  <div className="flex justify-between flex-wrap gap-2">
                    <h2 className="font-semibold">
                      {h.round.scheduledDate} 체크인
                    </h2>
                    <span className="text-sm">
                      {h.submission
                        ? h.submission.late
                          ? "지각 제출"
                          : "정시 제출"
                        : checkinStatusLabel(h.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    대상 작업 {h.targetCount}개
                  </p>
                  {h.submission ? (
                    <CheckinSubmissionView submission={h.submission} />
                  ) : (
                    <p className="text-sm">제출 내역이 없습니다.</p>
                  )}
                </article>
              ))}
            </>
          )
        )}
        <nav aria-label="기록 페이지" className="flex justify-end gap-2">
          <Btn
            disabled={q.loading || cursors.length === 1}
            onClick={() => setCursors((prev) => prev.slice(0, -1))}
          >
            이전
          </Btn>
          <Btn
            disabled={
              q.loading || !!q.error || q.data?.nextBeforeRoundId == null
            }
            onClick={() => {
              if (q.data?.nextBeforeRoundId != null)
                setCursors((prev) => [...prev, q.data!.nextBeforeRoundId!]);
            }}
          >
            다음
          </Btn>
        </nav>
      </main>
    </div>
  );
}
