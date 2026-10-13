import { useCallback, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { ProjectLoader } from "@/components/ProjectLoader";
import { Btn, ProgressBar } from "@/components/ds";
import {
  checkinsApi,
  type CurrentCheckin,
  type CheckinSubmissionInput,
  type CheckinSnapshot,
} from "@/api/checkins";
import { ApiError } from "@/api/client";
import type { ProjectResponse } from "@/api/projects";
import { TASK_STATUS } from "@/api/tasks";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";

const date = (v: string) => new Date(v).toLocaleString("ko-KR");
const phaseLabels = {
  NOT_OPEN: "시작 전",
  ON_TIME: "정시 제출",
  LATE: "지각 제출",
  CLOSED: "마감",
};
const reasons: Record<string, string> = {
  NO_ROUND: "아직 체크인이 열리지 않았습니다.",
  CHECKIN_NOT_ELIGIBLE:
    "이번 체크인 제출 대상이 아닙니다. 체크인이 열린 뒤 담당자로 배정됐다면 다음 체크인부터 반영됩니다.",
  CHECKIN_NO_TARGETS: "제출할 대상 작업이 없습니다.",
  NO_TARGETS: "제출할 대상 작업이 없습니다.",
  NOT_OPEN: "아직 체크인 시작 시간이 아닙니다.",
  CLOSED: "체크인 제출 기간이 종료되었습니다.",
  ALREADY_SUBMITTED: "이미 제출한 체크인입니다.",
  PROJECT_NOT_WRITABLE: "현재 프로젝트에서는 체크인을 제출할 수 없습니다.",
};
export function ProjectCheckin() {
  const { projectId = "" } = useParams();
  return (
    <ProjectLoader key={projectId} id={projectId}>
      {(project) => <CheckinData project={project} />}
    </ProjectLoader>
  );
}
function CheckinData({ project }: { project: ProjectResponse }) {
  const load = useCallback(
    (signal: AbortSignal) => checkinsApi.current(project.id, signal),
    [project.id],
  );
  const q = useApiQuery(load);
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-12 border-b border-border bg-white flex items-center px-4 gap-3">
        <Link
          to={`/projects/${project.id}`}
          className="min-w-0 truncate text-sm text-muted-foreground hover:text-foreground"
        >
          〈 {project.title}
        </Link>
        <Link to="/projects" className="ml-auto text-sm shrink-0">
          홈
        </Link>
      </header>
      <main className="max-w-3xl mx-auto p-6 space-y-5">
        <div className="flex justify-between gap-3"><h1 className="text-lg font-semibold">체크인</h1><Link className="text-sm text-brand-blue hover:underline" to={`/projects/${project.id}/checkin-history`}>내 체크인 기록</Link></div>
        {q.loading ? (
          <p role="status">체크인을 불러오고 있습니다…</p>
        ) : q.error ? (
          <>
            <p role="alert">{q.error}</p>
            <Btn onClick={q.retry}>다시 시도</Btn>
          </>
        ) : (
          q.data && (
            <CheckinForm project={project} current={q.data} reload={q.retry} />
          )
        )}
      </main>
    </div>
  );
}
function TaskSummary({ task }: { task: CheckinSnapshot }) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold break-words">{task.title}</h2>
      <p className="text-sm">
        {TASK_STATUS[task.status as keyof typeof TASK_STATUS] ?? task.status} ·
        진행률 {task.progress}%
      </p>
      <ProgressBar value={task.progress} />
      <p className="text-xs text-muted-foreground">
        하위 작업 {task.completedChildren} / {task.totalChildren} 완료
      </p>
    </div>
  );
}
function CheckinForm({
  project,
  current,
  reload,
}: {
  project: ProjectResponse;
  current: CurrentCheckin;
  reload: () => void;
}) {
  const action = useApiAction();
  const pending = useRef<CheckinSubmissionInput | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<
    Record<
      number,
      { issueContent: string; requestToTeam: string; nextAction: string }
    >
  >(() =>
    Object.fromEntries(
      current.targets
        .filter((t) => t.current)
        .map((t) => [
          t.taskId,
          {
            issueContent: t.current?.issue?.open
              ? (t.current.issue.content ?? "")
              : "",
            requestToTeam:
              current.submission?.tasks.find((s) => s.taskId === t.taskId)
                ?.requestToTeam ??
              t.current?.requestToTeam ??
              "",
            nextAction:
              current.submission?.tasks.find((s) => s.taskId === t.taskId)
                ?.nextAction ??
              t.current?.nextAction ??
              "",
          },
        ]),
    ),
  );
  const targets = current.targets.filter((t) => t.excludedReason === null);
  const canSubmit =
    (editing
      ? current.canEdit && current.phase === "ON_TIME" && !!current.submission
      : current.canSubmit && !current.submission) &&
    !!current.round &&
    targets.length > 0 &&
    project.status === "IN_PROGRESS";
  const submit = () => {
    if (!canSubmit || action.busy || action.locked) return;
    void action.run(async () => {
      const body = pending.current ?? {
        requestKey: crypto.randomUUID(),
        expectedRevision: editing ? current.submission!.revision : 0,
        tasks: targets.map((t) => ({
          taskId: t.taskId,
          expectedVersion: t.version!,
          expectedIssueRevision: t.current?.issue?.revision ?? 0,
          ...draft[t.taskId],
        })),
      };
      pending.current = body;
      try {
        if (editing)
          await checkinsApi.update(project.id, current.round!.id, body);
        else
          await checkinsApi.submit(project.id, current.round!.id, {
            ...body,
            expectedRevision: 0,
          });
        setUncertain(false);
      } catch (error) {
        const ambiguous =
          error instanceof ApiError &&
          (error.status === 0 || error.status >= 500);
        setUncertain(ambiguous);
        if (!ambiguous) pending.current = null;
        throw error;
      }
    }, reload);
  };
  if (!current.round)
    return (
      <section className="rounded-md border border-border p-5 space-y-4">
        <p>아직 체크인이 열리지 않았습니다.</p>
        <Btn onClick={reload}>새로고침</Btn>
      </section>
    );
  if (current.submission && !editing)
    return (
      <section className="space-y-4">
        <div className="rounded-md border border-border p-5 space-y-2">
          <h2 className="font-semibold">
            {current.submission.late ? "지각 체크인" : "체크인"} 제출 완료
          </h2>
          <p className="text-sm">
            제출: {date(current.submission.submittedAt)}
          </p>
          <p className="text-xs text-muted-foreground">
            제출한 시점의 작업 내용입니다.
          </p>
          {current.canEdit &&
            current.phase === "ON_TIME" &&
            project.status === "IN_PROGRESS" && (
              <Btn
                onClick={() =>
                  void action.run(
                    async () => {
                      const latest = await checkinsApi.current(project.id);
                      if (
                        !latest.canEdit ||
                        latest.phase !== "ON_TIME" ||
                        !latest.submission ||
                        latest.submission.revision !==
                          current.submission!.revision ||
                        JSON.stringify(latest.targets) !==
                          JSON.stringify(current.targets)
                      ) {
                        reload();
                        return;
                      }
                      setEditing(true);
                    },
                    () => {},
                  )
                }
                disabled={action.busy || action.locked}
              >
                제출 내용 수정
              </Btn>
            )}
          {action.error && <p role="alert">{action.error}</p>}
          {current.submission.updatedAt !== current.submission.submittedAt && (
            <p className="text-sm">
              수정: {date(current.submission.updatedAt)}
            </p>
          )}
        </div>
        {current.submission.tasks.map((t) => (
          <section
            key={t.taskId}
            className="rounded-md border border-border p-5 space-y-3"
          >
            <TaskSummary task={t} />
            {t.issue?.open && (
              <p className="whitespace-pre-wrap text-sm">
                이슈: {t.issue.content}
              </p>
            )}
            {t.requestToTeam && (
              <p className="whitespace-pre-wrap text-sm">
                팀 요청: {t.requestToTeam}
              </p>
            )}
            {t.nextAction && (
              <p className="whitespace-pre-wrap text-sm">
                다음 행동: {t.nextAction}
              </p>
            )}
          </section>
        ))}
        <Btn onClick={reload}>새로고침</Btn>
      </section>
    );
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <section className="rounded-md border border-border p-4 space-y-2 text-sm">
        <h2 className="font-semibold">
          {current.round.scheduledDate} 체크인 ·{" "}
          {current.phase ? phaseLabels[current.phase] : ""}
        </h2>
        <p>시작: {date(current.round.opensAt)}</p>
        <p>마감: {date(current.round.deadlineAt)}</p>
        {current.phase === "LATE" && (
          <p className="text-orange-700">
            지각 제출로 기록됩니다. 제출 가능 기한:{" "}
            {date(current.round.lateUntilAt)}
          </p>
        )}
      </section>
      {!canSubmit && (
        <p role="status">
          {reasons[current.unavailableReason ?? ""] ??
            "현재 체크인을 제출할 수 없습니다."}
        </p>
      )}
      <fieldset
        disabled={!canSubmit || action.busy || action.locked || uncertain}
        className="space-y-4"
      >
        {current.targets.map((t) => (
          <section
            key={t.taskId}
            className="rounded-md border border-border p-5 space-y-4"
          >
            {t.excludedReason !== null ? (
              <>
                <h2>{t.titleAtOpen}</h2>
                <p className="text-sm text-muted-foreground">
                  이번 제출 대상에서 제외된 작업입니다.
                </p>
              </>
            ) : (
              t.current && (
                <>
                  <TaskSummary task={t.current} />
                  <Link
                    to={`/projects/${project.id}/tasks/${t.taskId}`}
                    className="inline-block text-sm text-brand-blue hover:underline"
                  >
                    작업 상세 보기
                  </Link>
                  {(
                    ["issueContent", "requestToTeam", "nextAction"] as const
                  ).map((key, index) => (
                    <label key={key} className="block space-y-1 text-sm">
                      <span>
                        {
                          [
                            "이슈 보고 (선택)",
                            "팀에 요청할 내용 (선택)",
                            "다음 행동 (선택)",
                          ][index]
                        }
                      </span>
                      <textarea
                        aria-label={`${t.current!.title} ${["이슈 보고", "팀 요청", "다음 행동"][index]}`}
                        maxLength={2000}
                        rows={2}
                        className="block w-full rounded border border-border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={draft[t.taskId]?.[key] ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            [t.taskId]: {
                              ...prev[t.taskId],
                              [key]: e.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                  ))}
                </>
              )
            )}
          </section>
        ))}
      </fieldset>
      {action.error && <p role="alert">{action.error}</p>}
      {uncertain && (
        <p className="text-sm">
          제출 결과를 확인하지 못했습니다. 같은 내용으로 다시 전송하거나 현재
          상태를 확인해주세요.
        </p>
      )}
      <div className="flex justify-end gap-2">
        {editing && !uncertain && (
          <Btn type="button" disabled={action.busy} onClick={reload}>
            수정 취소
          </Btn>
        )}
        <Btn type="button" disabled={action.busy} onClick={reload}>
          {action.locked || uncertain ? "현재 상태 확인" : "새로고침"}
        </Btn>
        <Btn
          type="submit"
          variant="primary"
          disabled={!canSubmit || action.busy || action.locked}
        >
          {action.busy
            ? "제출 중…"
            : uncertain
              ? "같은 내용 다시 전송"
              : editing
                ? "수정 저장"
                : `전체 ${targets.length}개 작업 제출`}
        </Btn>
      </div>
    </form>
  );
}
