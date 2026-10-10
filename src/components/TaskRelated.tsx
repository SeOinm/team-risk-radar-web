import { useCallback, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  tasksApi,
  TASK_STATUS,
  type Task,
  type Artifact,
  type ArtifactInput,
} from "@/api/tasks";
import type { ProjectResponse } from "@/api/projects";
import type { Member } from "@/api/team";
import { useAuth } from "@/auth/context";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";
import { Btn, Input } from "@/components/ds";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-border rounded-md overflow-hidden">
      <h2 className="px-4 py-3 bg-muted border-b border-border text-sm">
        {title}
      </h2>
      <div className="p-4 space-y-3">{children}</div>
    </section>
  );
}

export function TaskRelations({
  project,
  task,
  writable,
}: {
  project: ProjectResponse;
  task: Task;
  writable: boolean;
}) {
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [selected, tasks] = await Promise.all([
        tasksApi.prerequisites(project.id, task.id, signal),
        tasksApi.list(project.id, signal),
      ]);
      // No successors endpoint is available. Derive direct successors from each task's prerequisites.
      const relations = await Promise.all(
        tasks
          .filter((t) => t.id !== task.id)
          .map(async (t) => ({
            task: t,
            parents: await tasksApi.prerequisites(project.id, t.id, signal),
          })),
      );
      return {
        selected,
        tasks,
        successors: relations
          .filter((r) => r.parents.some((p) => p.taskId === task.id))
          .map((r) => r.task),
      };
    },
    [project.id, task.id],
  );
  const q = useApiQuery(load);
  const action = useApiAction();
  const [selected, setSelected] = useState<number[] | null>(null);
  const refresh = () => {
    setSelected(null);
    q.retry();
  };
  const taskLink = (
    id: number,
    title: string,
    status: keyof typeof TASK_STATUS,
  ) => (
    <Link
      to={`/projects/${project.id}/tasks/${id}`}
      className="text-brand-blue hover:underline break-words"
    >
      {title}{" "}
      <span className="text-xs text-muted-foreground">
        · {TASK_STATUS[status]}
      </span>
    </Link>
  );
  return (
    <>
      <Panel title="선행 작업">
        {q.loading ? (
          <p>조회 중…</p>
        ) : q.error ? (
          <>
            <p role="alert">{q.error}</p>
            <Btn onClick={q.retry}>다시 시도</Btn>
          </>
        ) : (
          <>
            {q.data?.selected.length ? (
              <ul className="space-y-2">
                {q.data.selected.map((t) => (
                  <li key={t.taskId}>
                    {taskLink(t.taskId, t.title, t.status)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>선행 작업이 없습니다.</p>
            )}
            {writable && selected === null && (
              <Btn
                disabled={action.locked}
                onClick={() =>
                  setSelected(q.data?.selected.map((t) => t.taskId) ?? [])
                }
              >
                선행 작업 설정
              </Btn>
            )}
            {selected !== null && (
              <fieldset
                disabled={!writable || action.busy || action.locked}
                className="space-y-3"
              >
                <p className="text-xs text-muted-foreground">
                  이 작업 전에 끝내야 하는 작업을 선택하세요. 모두 해제할 수도
                  있습니다.
                </p>
                {q.data?.tasks
                  .filter(
                    (t) =>
                      t.id !== task.id &&
                      (t.status !== "CANCELLED" || selected.includes(t.id)),
                  )
                  .map((t) => (
                    <label
                      key={t.id}
                      className="flex gap-2 items-start text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(t.id)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, t.id]
                              : selected.filter((id) => id !== t.id),
                          )
                        }
                      />
                      {t.title} · {TASK_STATUS[t.status]}
                    </label>
                  ))}
                <div className="flex justify-end gap-2">
                  <Btn onClick={() => setSelected(null)}>취소</Btn>
                  <Btn
                    variant="primary"
                    onClick={() =>
                      void action.run(
                        () =>
                          tasksApi.setPrerequisites(
                            project.id,
                            task.id,
                            selected,
                          ),
                        refresh,
                      )
                    }
                  >
                    선행 작업 저장
                  </Btn>
                </div>
              </fieldset>
            )}
          </>
        )}
        {action.error && <p role="alert">{action.error}</p>}
        {action.locked && (
          <Btn onClick={() => window.location.reload()}>최신 상태 불러오기</Btn>
        )}
      </Panel>
      <Panel title="후속 작업">
        {q.loading ? (
          <p>조회 중…</p>
        ) : q.error ? (
          <p>작업 관계를 불러오지 못했습니다.</p>
        ) : q.data?.successors.length ? (
          <ul className="space-y-2">
            {q.data.successors.map((t) => (
              <li key={t.id}>{taskLink(t.id, t.title, t.status)}</li>
            ))}
          </ul>
        ) : (
          <p>후속 작업이 없습니다.</p>
        )}
      </Panel>
    </>
  );
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export function TaskArtifacts({
  project,
  task,
  members,
  writable,
}: {
  project: ProjectResponse;
  task: Task;
  members: Member[];
  writable: boolean;
}) {
  const { user } = useAuth();
  const memberId = members.find((m) => m.userId === user?.id)?.id;
  const manager = project.myRole !== "MEMBER";
  const load = useCallback(
    (signal: AbortSignal) => tasksApi.artifacts(project.id, task.id, signal),
    [project.id, task.id],
  );
  const q = useApiQuery(load);
  const action = useApiAction();
  const [editing, setEditing] = useState<Artifact | "new" | null>(null);
  const [removing, setRemoving] = useState<Artifact | null>(null);
  const refresh = () => {
    setEditing(null);
    setRemoving(null);
    q.retry();
  };
  return (
    <Panel title="산출물 링크">
      {q.loading ? (
        <p>조회 중…</p>
      ) : q.error ? (
        <>
          <p role="alert">{q.error}</p>
          <Btn onClick={q.retry}>다시 시도</Btn>
        </>
      ) : (
        <>
          {!q.data?.length && <p>등록된 산출물이 없습니다.</p>}
          <ul className="space-y-3">
            {q.data?.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-b border-border pb-3">
                <div className="min-w-0 flex-1 space-y-1 break-words">
                {safeUrl(a.url) ? (
                  <a
                    href={safeUrl(a.url)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-blue hover:underline break-all"
                  >
                    {a.title || a.url}
                  </a>
                ) : (
                  <span>{a.title} (열 수 없는 링크)</span>
                )}
                <p className="text-xs text-muted-foreground">
                  {a.createdByNickname} ·{" "}
                  {new Date(a.createdAt).toLocaleString("ko-KR")}
                </p>
                </div>
                {writable && (manager || memberId === a.createdByMemberId) && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Btn
                      size="sm"
                      disabled={action.busy || action.locked}
                      onClick={() => {
                        setRemoving(null);
                        setEditing(a);
                      }}
                    >
                      수정
                    </Btn>
                    <Btn
                      size="sm"
                      disabled={action.busy || action.locked}
                      onClick={() => {
                        setEditing(null);
                        setRemoving(a);
                      }}
                    >
                      삭제
                    </Btn>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {writable && !editing && !removing && (
            <Btn
              disabled={action.busy || action.locked}
              onClick={() => setEditing("new")}
            >
              산출물 링크 추가
            </Btn>
          )}
        </>
      )}
      {editing && (
        <ArtifactForm
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? undefined : editing}
          disabled={!writable || action.busy || action.locked}
          onCancel={() => setEditing(null)}
          onSave={(input) =>
            void action.run(
              () =>
                editing === "new"
                  ? tasksApi.addArtifact(project.id, task.id, input)
                  : tasksApi.updateArtifact(
                      project.id,
                      task.id,
                      editing.id,
                      input,
                    ),
              refresh,
            )
          }
        />
      )}
      {removing && (
        <div className="border rounded p-3 space-y-3">
          <p>‘{removing.title}’ 링크를 삭제할까요?</p>
          <div className="flex justify-end gap-2">
            <Btn disabled={action.busy} onClick={() => setRemoving(null)}>
              취소
            </Btn>
            <Btn
              variant="danger"
              disabled={!writable || action.busy || action.locked}
              onClick={() =>
                void action.run(
                  () =>
                    tasksApi.deleteArtifact(project.id, task.id, removing.id),
                  refresh,
                )
              }
            >
              삭제 확인
            </Btn>
          </div>
        </div>
      )}
      {action.error && <p role="alert">{action.error}</p>}
      {action.locked && (
        <Btn onClick={() => window.location.reload()}>최신 상태 불러오기</Btn>
      )}
    </Panel>
  );
}
function ArtifactForm({
  initial,
  disabled,
  onCancel,
  onSave,
}: {
  initial?: Artifact;
  disabled: boolean;
  onCancel: () => void;
  onSave: (input: ArtifactInput) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!safeUrl(url.trim())) {
          setError(
            "http:// 또는 https://로 시작하는 올바른 링크를 입력해주세요.",
          );
          return;
        }
        onSave({ title: title.trim(), url: url.trim() });
      }}
    >
      <fieldset
        disabled={disabled}
        className="border border-border rounded p-3 space-y-3"
      >
        <Input
          label="산출물 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          label="산출물 URL"
          required
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
        />
        {error && <p role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <Btn type="button" onClick={onCancel}>취소</Btn>
          <Btn type="submit" variant="primary">
            산출물 저장
          </Btn>
        </div>
      </fieldset>
    </form>
  );
}
