import type { CheckinSubmission } from "@/api/checkinOverview";
import { TASK_STATUS } from "@/api/tasks";

export function CheckinSubmissionView({
  submission,
}: {
  submission: CheckinSubmission;
}) {
  return (
    <details className="rounded border border-border p-3">
      <summary className="cursor-pointer text-sm font-medium">
        제출 당시 내용 보기
      </summary>
      <div className="mt-3 space-y-4">
        <p className="text-xs text-muted-foreground">
          제출: {new Date(submission.submittedAt).toLocaleString("ko-KR")}
          {submission.updatedAt !== submission.submittedAt && (
            <>
              {" "}
              · 수정: {new Date(submission.updatedAt).toLocaleString("ko-KR")}
            </>
          )}
        </p>
        {submission.tasks.map((t) => (
          <section
            key={t.taskId}
            className="border-t border-border pt-3 space-y-2"
          >
            <h3 className="font-semibold break-words">{t.title}</h3>
            <p className="text-sm">
              {TASK_STATUS[t.status as keyof typeof TASK_STATUS] ?? t.status} ·{" "}
              {t.progress}% · 하위 작업 {t.completedChildren}/{t.totalChildren}
            </p>
            <p className="text-sm whitespace-pre-wrap break-words">
              이슈: {t.issue?.content || "없음"}
              {t.issue?.content && ` (${t.issue.open ? "미해결" : "해결"})`}
            </p>
            {t.requestToTeam && (
              <p className="text-sm whitespace-pre-wrap break-words">
                팀 요청: {t.requestToTeam}
              </p>
            )}
            {t.nextAction && (
              <p className="text-sm whitespace-pre-wrap break-words">
                다음 행동: {t.nextAction}
              </p>
            )}
          </section>
        ))}
      </div>
    </details>
  );
}
