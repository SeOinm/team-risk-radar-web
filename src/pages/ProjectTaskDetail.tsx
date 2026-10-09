import { useCallback, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { ProjectLoader } from "@/components/ProjectLoader";
import { TaskForm } from "@/components/TaskForm";
import {
  Btn,
  NavBack,
  RiskScore,
  SizeBadgeDs,
  ProgressBar,
  Input,
} from "@/components/ds";
import { projectsApi, type ProjectResponse } from "@/api/projects";
import {
  tasksApi,
  TASK_STATUS,
  type Task,
  type SubTask,
  type SubTaskInput,
} from "@/api/tasks";
import { teamApi, type Member } from "@/api/team";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";
import { useAuth } from "@/auth/context";

export function ProjectTaskDetail() {
  const { projectId = "", taskId = "" } = useParams();
  return (
    <ProjectLoader key={projectId} id={projectId}>
      {(p) => (
        <Detail key={`${projectId}:${taskId}`} project={p} taskId={taskId} />
      )}
    </ProjectLoader>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-border rounded-md overflow-hidden">
      <h2 className="px-4 py-3 bg-muted border-b border-border text-sm">
        {title}
      </h2>
      <div className="p-4 space-y-3">{children}</div>
    </section>
  );
}
function Detail({
  project,
  taskId,
}: {
  project: ProjectResponse;
  taskId: string;
}) {
  const navigate = useNavigate();
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [task, members, current] = await Promise.all([
        tasksApi.detail(project.id, taskId, signal),
        teamApi.members(project.id, signal),
        projectsApi.detail(String(project.id), signal),
      ]);
      return { task, members, project: current };
    },
    [project.id, taskId],
  );
  const q = useApiQuery(load);
  const action = useApiAction();
  const [editing, setEditing] = useState(false);
  const [cancel, setCancel] = useState(false);
  const t = q.data?.task;
  const current = q.data?.project ?? project;
  const manager = current.myRole !== "MEMBER";
  const writable =
    current.status === "IN_PROGRESS" &&
    t?.status !== "CANCELLED" &&
    !action.locked;
  const refresh = () => {
    setEditing(false);
    setCancel(false);
    q.retry();
  };
  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 border-b border-border flex items-center gap-2">
        <NavBack fallback={`/projects/${project.id}/tasks`} />
        <span className="text-sm font-semibold">작업 상세</span>
      </header>
      <main className="max-w-5xl mx-auto p-6 space-y-4">
        {action.error && <p role="alert">{action.error}</p>}
        {action.locked && (
          <Btn onClick={() => window.location.reload()}>최신 상태 불러오기</Btn>
        )}
        {action.notice && <p role="status">{action.notice}</p>}
        {q.loading ? (
          <p role="status">작업을 불러오고 있습니다…</p>
        ) : q.error ? (
          <>
            <p role="alert">{q.error}</p>
            <Btn onClick={q.retry}>다시 시도</Btn>
          </>
        ) : (
          t &&
          q.data && (
            <>
              <div className="flex gap-3 items-center flex-wrap">
                <div className="flex items-center gap-3 flex-wrap min-w-0 flex-1">
                  <h1 className="text-lg break-words">{t.title}</h1>
                  <SizeBadgeDs size={t.size} />
                  <RiskScore score={null} />
                </div>
                {manager && (
                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    <Btn
                      disabled={!writable || action.busy}
                      onClick={() => setEditing(true)}
                    >
                      작업 설정
                    </Btn>
                    {t.status === "CANCELLED" ? (
                      <Btn disabled title="복구 API 연결 대기">
                        복구 · 연결 대기
                      </Btn>
                    ) : (
                      <Btn
                        disabled={!writable || action.busy}
                        onClick={() => setCancel(true)}
                      >
                        작업 취소
                      </Btn>
                    )}
                  </div>
                )}
              </div>
              {!writable && (
                <p>
                  완료·종료된 프로젝트 또는 취소된 작업은 수정할 수 없습니다.
                </p>
              )}
              {cancel && (
                <Section title="작업 취소 확인">
                  <p>
                    작업을 취소할까요? 기록은 보존되며 현재 복구 API는 없습니다.
                  </p>
                  <Btn disabled={action.busy} onClick={() => setCancel(false)}>
                    돌아가기
                  </Btn>{" "}
                  <Btn
                    variant="danger"
                    disabled={action.busy || !writable}
                    onClick={() =>
                      void action.run(
                        () => tasksApi.cancel(project.id, t.id),
                        refresh,
                      )
                    }
                  >
                    취소 확정
                  </Btn>
                </Section>
              )}
              {editing && (
                <Section title="작업 설정">
                  <TaskForm
                    initial={t}
                    busy={action.busy || !writable}
                    onCancel={() => setEditing(false)}
                    onSave={(input) =>
                      void action.run(
                        () => tasksApi.update(project.id, t.id, input),
                        refresh,
                      )
                    }
                  />
                </Section>
              )}
              <div className="grid md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-4">
                  <Section title="리스크 원인">
                    <p className="text-muted-foreground">점수·통계 연동 보류</p>
                  </Section>
                  <Section title="진행률 분석">
                    <p>
                      {TASK_STATUS[t.status]} · 서버 진행률 {t.progress}%
                    </p>
                    <ProgressBar value={t.progress} />
                    <p className="text-xs text-muted-foreground">
                      진행률 비교 분석·체크인 기록은 연결 대기입니다. 하위
                      작업을 완료해도 부모 작업의 진행률·상태는 직접 변경되지
                      않습니다.
                    </p>
                  </Section>
                  <Children
                    project={current}
                    task={t}
                    members={q.data.members}
                    writable={!!writable}
                    manager={manager}
                  />
                  <Section title="체크인 기록">
                    <p>체크인 API 연결 대기</p>
                  </Section>
                  <Section title="산출물 링크">
                    <p>조회 응답 명세 확인 후 연결 예정입니다.</p>
                    <Btn disabled>산출물 링크 추가 · 연결 대기</Btn>
                  </Section>
                </div>
                <aside className="space-y-4">
                  <Section title="작업 정보">
                    <p>마감일: {t.dueDate ?? "없음"}</p>
                    
                  </Section>
                  <Assignees
                    project={current}
                    task={t}
                    members={q.data.members}
                    writable={!!writable && manager}
                    refresh={refresh}
                  />
                  <Histories project={current} task={t} />
                  <Section title="선행 작업">
                    <p>조회 응답 명세 확인 후 연결 예정입니다.</p>
                    <Btn disabled>선행 작업 설정 · 연결 대기</Btn>
                  </Section>
                  <Section title="후속 작업">
                    <p>선행 작업 조회 연결 후 표시됩니다.</p>
                  </Section>
                </aside>
              </div>
              <Btn onClick={() => navigate(`/projects/${project.id}/tasks`)}>
                작업 보드로 이동
              </Btn>
            </>
          )
        )}
      </main>
    </div>
  );
}
function Assignees({
  project,
  task,
  members,
  writable,
  refresh,
}: {
  project: ProjectResponse;
  task: Task;
  members: Member[];
  writable: boolean;
  refresh: () => void;
}) {
  const [selected, setSelected] = useState(
    task.assignees.map((a) => a.memberId),
  );
  const action = useApiAction();
  return (
    <Section title="담당자">
      <p>{task.assignees.map((a) => a.nickname).join(", ") || "미배정"}</p>
      {writable && (
        <>
          <fieldset
            disabled={action.busy || action.locked}
            className="space-y-2"
          >
            {members.map((m) => (
              <label key={m.id} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(m.id)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, m.id]
                        : selected.filter((id) => id !== m.id),
                    )
                  }
                />
                {m.nickname}
              </label>
            ))}
          </fieldset>
          <p className="text-xs text-muted-foreground">
            선택을 모두 해제하면 미배정으로 변경됩니다.
          </p>
          <Btn
            disabled={action.busy || action.locked}
            onClick={() =>
              void action.run(
                () => tasksApi.assignees(project.id, task.id, selected),
                refresh,
              )
            }
          >
            담당자 저장
          </Btn>
        </>
      )}
      {action.error && <p role="alert">{action.error}</p>}
      {action.locked && <Btn onClick={refresh}>최신 상태 불러오기</Btn>}
    </Section>
  );
}
function Histories({
  project,
  task,
}: {
  project: ProjectResponse;
  task: Task;
}) {
  const load = useCallback(
    (signal: AbortSignal) => tasksApi.histories(project.id, task.id, signal),
    [project.id, task.id],
  );
  const q = useApiQuery(load);
  return (
    <Section title="담당자 변경 이력">
      {q.loading ? (
        <p role="status">조회 중…</p>
      ) : q.error ? (
        <>
          <p role="alert">{q.error}</p>
          <Btn onClick={q.retry}>다시 시도</Btn>
        </>
      ) : q.data?.length ? (
        <ul className="space-y-2 text-xs">
          {q.data.map((h) => (
            <li key={h.id}>
              {h.nickname} · {h.action === "ASSIGN" ? "배정" : "해제"}
              <br />
              {new Date(h.changedAt).toLocaleString("ko-KR")} ·{" "}
              {h.changedByNickname}
            </li>
          ))}
        </ul>
      ) : (
        <p>변경 이력이 없습니다.</p>
      )}
    </Section>
  );
}
function Children({
  project,
  task,
  members,
  writable,
  manager,
}: {
  project: ProjectResponse;
  task: Task;
  members: Member[];
  writable: boolean;
  manager: boolean;
}) {
  const { user } = useAuth();
  const self = members.find((m) => m.userId === user?.id);
  const load = useCallback(
    (signal: AbortSignal) => tasksApi.children(project.id, task.id, signal),
    [project.id, task.id],
  );
  const q = useApiQuery(load);
  const action = useApiAction();
  const [editing, setEditing] = useState<SubTask | "new" | null>(null);
  const [remove, setRemove] = useState<SubTask | null>(null);
  const refresh = () => {
    setEditing(null);
    setRemove(null);
    q.retry();
  };
  return (
    <Section title="하위 작업">
      {q.loading ? (
        <p role="status">조회 중…</p>
      ) : q.error ? (
        <>
          <p role="alert">{q.error}</p>
          <Btn onClick={q.retry}>다시 시도</Btn>
        </>
      ) : (
        <>
          {!q.data?.length && <p>하위 작업이 없습니다.</p>}
          {q.data?.map((c) => (
            <div
              key={c.id}
              className="border-b border-border py-2 flex items-center gap-2 flex-wrap"
            >
              <input
                aria-label={`${c.title} 완료`}
                type="checkbox"
                checked={c.completed}
                disabled={
                  !writable ||
                  action.busy ||
                  action.locked ||
                  (!manager && c.assigneeMemberId !== self?.id)
                }
                onChange={(e) =>
                  void action.run(
                    () =>
                      tasksApi.completion(
                        project.id,
                        task.id,
                        c.id,
                        e.target.checked,
                      ),
                    refresh,
                  )
                }
              />
              <span className={`flex-1 ${c.completed ? "line-through" : ""}`}>
                {c.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {c.assigneeNickname ?? "미배정"}
              </span>
              {manager && (
                <>
                  <Btn
                    size="sm"
                    disabled={!writable || action.busy || action.locked}
                    onClick={() => setEditing(c)}
                  >
                    수정
                  </Btn>
                  <Btn
                    size="sm"
                    disabled={!writable || action.busy || action.locked}
                    onClick={() => setRemove(c)}
                  >
                    삭제
                  </Btn>
                </>
              )}
            </div>
          ))}
        </>
      )}
      {manager && (
        <Btn
          disabled={
            !writable || action.busy || action.locked || q.loading || !!q.error
          }
          onClick={() => setEditing("new")}
        >
          하위 작업 추가
        </Btn>
      )}
      {editing && (
        <SubTaskForm
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? undefined : editing}
          members={members}
          busy={action.busy || action.locked || !writable}
          onCancel={() => setEditing(null)}
          onSave={(input) =>
            void action.run(
              () =>
                editing === "new"
                  ? tasksApi.addChild(project.id, task.id, input)
                  : tasksApi.updateChild(
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
      {remove && (
        <div className="border border-border rounded p-3 space-y-2">
          <p>‘{remove.title}’ 하위 작업을 삭제할까요?</p>
          <Btn disabled={action.busy} onClick={() => setRemove(null)}>
            돌아가기
          </Btn>{" "}
          <Btn
            variant="danger"
            disabled={action.busy || action.locked || !writable}
            onClick={() =>
              void action.run(
                () => tasksApi.deleteChild(project.id, task.id, remove.id),
                refresh,
              )
            }
          >
            삭제 확인
          </Btn>
        </div>
      )}
      {action.error && <p role="alert">{action.error}</p>}
      {action.locked && (
        <Btn onClick={() => window.location.reload()}>최신 상태 불러오기</Btn>
      )}
      {action.notice && <p role="status">{action.notice}</p>}
    </Section>
  );
}
function SubTaskForm({
  initial,
  members,
  busy,
  onSave,
  onCancel,
}: {
  initial?: SubTask;
  members: Member[];
  busy: boolean;
  onSave: (input: SubTaskInput) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [member, setMember] = useState(
    initial?.assigneeMemberId?.toString() ?? "",
  );
  const [order, setOrder] = useState(initial?.sortOrder?.toString() ?? "");
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) {
          setError("하위 작업명을 입력해주세요.");
          return;
        }
        onSave({
          title: title.trim(),
          assigneeMemberId: member ? Number(member) : null,
          sortOrder: order ? Number(order) : null,
        });
      }}
      className="border border-border p-3 rounded space-y-3"
    >
      <fieldset disabled={busy} className="space-y-3">
        <Input
          label="하위 작업명"
          maxLength={100}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="block text-sm">
          하위 작업 담당자
          <select
            aria-label="하위 작업 담당자"
            className="ml-2 border rounded p-1"
            value={member}
            onChange={(e) => setMember(e.target.value)}
          >
            <option value="">미배정</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nickname}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="하위 작업 순서 (선택)"
          type="number"
          min={0}
          step={1}
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        />
        {error && <p role="alert">{error}</p>}
        <Btn type="button" onClick={onCancel}>
          돌아가기
        </Btn>{" "}
        <Btn type="submit" variant="primary">
          하위 작업 저장
        </Btn>
      </fieldset>
    </form>
  );
}
