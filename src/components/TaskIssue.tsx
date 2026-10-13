import { useCallback, useState } from "react";
import { checkinOverviewApi } from "@/api/checkinOverview";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";
import { useAuth } from "@/auth/context";
import type { ProjectResponse } from "@/api/projects";
import type { Task } from "@/api/tasks";
import type { Member } from "@/api/team";
import { Btn } from "@/components/ds";
export function TaskIssue({
  project,
  task,
  members,
}: {
  project: ProjectResponse;
  task: Task;
  members: Member[];
}) {
  const { user } = useAuth();
  const self = members.find((m) => m.userId === user?.id);
  const load = useCallback(
    (signal: AbortSignal) =>
      checkinOverviewApi.issue(project.id, task.id, signal),
    [project.id, task.id],
  );
  const q = useApiQuery(load);
  const action = useApiAction();
  const [confirm, setConfirm] = useState(false);
  const canResolve =
    project.status !== "CLOSED" &&
    (project.myRole !== "MEMBER" ||
      task.assignees.some((a) => a.memberId === self?.id));
  return (
    <section className="border border-border rounded-md overflow-hidden">
      <h2 className="px-4 py-3 bg-muted border-b border-border text-sm">
        작업 이슈
      </h2>
      <div className="p-4 space-y-3">
        {q.loading ? (
          <p>조회 중…</p>
        ) : q.error ? (
          <>
            <p role="alert">{q.error}</p>
            <Btn onClick={q.retry}>다시 시도</Btn>
          </>
        ) : (
          q.data && (
            <>
              <p>
                {q.data.open
                  ? "해결이 필요한 이슈"
                  : q.data.resolvedAt
                    ? "해결된 이슈"
                    : "보고된 이슈가 없습니다."}
              </p>
              {q.data.content && (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {q.data.content}
                </p>
              )}
              {q.data.reportedAt && (
                <p className="text-xs text-muted-foreground">
                  보고: {new Date(q.data.reportedAt).toLocaleString("ko-KR")}
                </p>
              )}
              {q.data.resolvedAt && (
                <p className="text-xs text-muted-foreground">
                  해결: {new Date(q.data.resolvedAt).toLocaleString("ko-KR")}
                </p>
              )}
              {q.data.open && canResolve && !confirm && (
                <Btn
                  disabled={action.busy || action.locked}
                  onClick={() => setConfirm(true)}
                >
                  이슈 해결
                </Btn>
              )}
              {confirm && q.data.open && canResolve && (
                <div className="rounded border border-border p-3 space-y-3">
                  <p>이 이슈를 해결한 것으로 표시할까요?</p>
                  <div className="flex justify-end gap-2">
                    <Btn
                      disabled={action.busy}
                      onClick={() => setConfirm(false)}
                    >
                      취소
                    </Btn>
                    <Btn
                      variant="primary"
                      disabled={action.busy || action.locked}
                      onClick={() =>
                        void action.run(
                          async () => {
                            const updated = await checkinOverviewApi.resolve(
                              project.id,
                              task.id,
                              q.data!.revision,
                            );
                            q.updateData(() => updated);
                          },
                          () => setConfirm(false),
                        )
                      }
                    >
                      해결 확인
                    </Btn>
                  </div>
                </div>
              )}
            </>
          )
        )}
        {action.error && <p role="alert">{action.error}</p>}
        {action.locked && (
          <Btn onClick={() => window.location.reload()}>최신 상태 불러오기</Btn>
        )}
      </div>
    </section>
  );
}
