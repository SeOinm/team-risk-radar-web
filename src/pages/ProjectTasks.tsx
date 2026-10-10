import { moveTask } from "@/lib/taskOrder";
import { ApiError } from "@/api/client";
import { Plus, ChevronDown, ChevronLeft, SlidersHorizontal, GripVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router";
import { ProjectLoader } from "@/components/ProjectLoader";
import { TaskForm } from "@/components/TaskForm";
import {
  Btn,
  Input,
  RiskScore,
  SizeBadgeDs,
  ProgressBar,
} from "@/components/ds";
import { tasksApi, TASK_STATUS, type Task } from "@/api/tasks";
import type { ProjectResponse } from "@/api/projects";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";
export function ProjectTasks() {
  const { projectId = "" } = useParams();
  return (
    <ProjectLoader key={projectId} id={projectId}>
      {(p) => <TaskBoardData project={p} />}
    </ProjectLoader>
  );
}
function TaskBoardData({ project }: { project: ProjectResponse }) {
  const load = useCallback(
    (signal: AbortSignal) => tasksApi.list(project.id, signal),
    [project.id],
  );
  const q = useApiQuery(load);
  const action = useApiAction();
  const navigate = useNavigate();
  const [form, setForm] = useState<"create" | "templates" | null>(null);
  const [filter, setFilter] = useState("전체");
  const [sort, setSort] = useState("기본 순서");
  const [cancelled, setCancelled] = useState(false);
  const writable =
    project.myRole !== "MEMBER" &&
    project.status === "IN_PROGRESS" &&
    !action.locked;
  const rows = (q.data ?? [])
    .filter((t) => {
      if (filter === "취소") return t.status === "CANCELLED";
      if (!cancelled && t.status === "CANCELLED") return false;
      if (filter === "미배정") return !t.assignees.length;
      if (filter === "막힘") return t.status === "BLOCKED";
      return true;
    })
    .sort((a, b) =>
      sort === "진행률"
        ? b.progress - a.progress
        : sort === "마감일"
          ? (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999")
          : a.sortOrder - b.sortOrder || a.id - b.id,
    );
  const tableRef = useRef<HTMLTableElement>(null);
  const dragging = useRef<{ source: number; target: number | null; placement: "before" | "after" } | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; title: string } | null>(null);
  const [dragSource, setDragSource] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: number; placement: "before" | "after" } | null>(null);
  const canReorder = writable && !action.busy && !q.loading && !q.error && !form && sort === "기본 순서" && filter === "전체" && !cancelled;
  const resetDrag = () => { dragging.current = null; setDragSource(null); setDropTarget(null); setGhost(null); };
  const reorder = (source: number, target: number, placement?: "before" | "after") => {
    if (!canReorder || source === target) return;
    const snapshot = q.data ?? [];
    const preview = moveTask(snapshot, source, target, placement).map((task, sortOrder) => ({ ...task, sortOrder }));
    if (!preview.length) return;
    void action.run(async () => {
      q.updateData(() => [...preview, ...snapshot.filter(task => task.status === 'CANCELLED')]);
      let saveError: unknown;
      try {
        const latest = await tasksApi.list(project.id);
        const signature = (items: Task[]) => items.filter(t => t.status !== 'CANCELLED').sort((a,b) => a.sortOrder-b.sortOrder || a.id-b.id).map(t => `${t.id}:${t.sortOrder}`).join(',');
        if (signature(latest) !== signature(snapshot)) throw new ApiError(409, 'ORDER_CHANGED', '작업 목록이 변경되었습니다. 최신 목록에서 다시 이동해주세요.');
        const ordered = moveTask(latest, source, target, placement);
        for (const [sortOrder, task] of ordered.entries()) {
          if (task.sortOrder === sortOrder) continue;
          await tasksApi.update(project.id, task.id, { title: task.title, size: task.size, dueDate: task.dueDate, sortOrder });
        }
      } catch (error) {
          saveError = error;
        }
        {
        // Read back partial saves without replacing the table with a loading screen.
        try {
          const saved = await tasksApi.list(project.id);
          q.updateData(() => saved);
        } catch (error) {
          q.updateData(() => snapshot);
          if (error instanceof ApiError && error.status === 401) throw error;
          throw new ApiError(409, 'ORDER_UNCONFIRMED', '저장된 순서를 확인하지 못했습니다. 이전 화면으로 복원했습니다. 최신 상태를 다시 불러와주세요.');
        }
      }

        if (saveError) throw saveError;
    }, () => {});
  };
  const refresh = () => {
    setForm(null);
    q.retry();
  };
  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 flex items-center border-b border-border px-4">
        <Link
          to={`/projects/${project.id}`}
          aria-label={`${project.title} 프로젝트 상세로 이동`}
          title={project.title}
          className="inline-flex min-w-0 max-w-full items-center gap-2 rounded text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="truncate">{project.title}</span>
        </Link>
      </header>
      <main className="max-w-6xl mx-auto p-6 space-y-4">
        <h1 className="text-lg font-semibold">작업 보드</h1>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center rounded-md bg-muted p-1" aria-label="작업 필터">
              {["전체", "미배정", "막힘", "취소"].map((f) => (
                <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
                  className={`h-7 px-3 rounded text-[12px] font-medium transition-colors ${filter === f ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {f}
                </button>
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Btn variant="ghost" size="sm"><SlidersHorizontal aria-hidden="true" className="w-3.5 h-3.5" />필터{cancelled ? " · 취소 포함" : ""}</Btn>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuCheckboxItem checked={cancelled} onCheckedChange={setCancelled}>취소 포함</DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>분석 필터 · 연동 보류</DropdownMenuLabel>
                {["지연", "마감 임박", "완료 근거 부족"].map((f) => <DropdownMenuItem key={f} disabled>{f}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {project.myRole !== "MEMBER" && (
            <div className="flex items-center gap-2 ml-auto">
              <Btn variant="ghost" disabled={!writable || action.busy} onClick={() => setForm("templates")}>템플릿으로 추가</Btn>
              <Btn variant="primary" disabled={!writable || action.busy} onClick={() => setForm("create")}>
                <Plus aria-hidden="true" className="w-4 h-4" />새 작업
              </Btn>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{q.loading ? "불러오는 중…" : q.error ? "" : `작업 ${rows.length}개`}</span>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            정렬
            <span className="relative">
              <select aria-label="작업 정렬" value={sort} onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-transparent h-8 pl-2 pr-6 text-[12px] text-foreground rounded outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {["기본 순서", "마감일", "진행률"].map((s) => <option key={s} value={s}>{s}</option>)}
                <option disabled>리스크 · 연동 보류</option>
              </select>
              <ChevronDown aria-hidden="true" className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
            </span>
          </label>
        </div>
        {project.status !== "IN_PROGRESS" && (
          <p>완료·종료된 프로젝트는 작업을 변경할 수 없습니다.</p>
        )}
        {action.error && <p role="alert">{action.error}</p>}
        {action.locked && (
          <Btn onClick={() => window.location.reload()}>최신 상태 불러오기</Btn>
        )}
        {form && (
          <section className="border border-border rounded p-5 space-y-3">
            <h2>{form === "create" ? "새 작업" : "작업 템플릿"}</h2>
            {form === "create" ? (
              <TaskForm
                busy={action.busy || !writable}
                onCancel={() => setForm(null)}
                onSave={(input) =>
                  void action.run(
                    () => tasksApi.create(project.id, input),
                    refresh,
                  )
                }
              />
            ) : (
              <Templates
                project={project}
                busy={action.busy || !writable}
                onCancel={() => setForm(null)}
                onSave={(template, dueDate) =>
                  void action.run(
                    () => tasksApi.fromTemplate(project.id, template, dueDate),
                    refresh,
                  )
                }
              />
            )}
          </section>
        )}
        {q.loading ? (
          <p role="status">작업을 불러오고 있습니다…</p>
        ) : q.error ? (
          <>
            <p role="alert">{q.error}</p>
            <Btn onClick={q.retry}>다시 시도</Btn>
          </>
        ) : (
          <div className="border border-border rounded overflow-x-auto">
            <table ref={tableRef} className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="w-10"><span className="sr-only">순서 변경</span></th>
                  {[
                    "작업명",
                    "담당자",
                    "상태",
                    "진행률",
                    "마감일",
                    "크기",
                    "리스크",
                  ].map((h) => (
                    <th
                      key={h}
                      className="p-3 text-left text-xs text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((t: Task) => (
                  <tr
                    key={t.id}
                    data-task-id={t.id}
                    className={`border-t border-border ${t.status === "CANCELLED" || dragSource === t.id ? "opacity-40" : ""}`}
                    style={dropTarget?.id === t.id ? { boxShadow: `inset 0 ${dropTarget.placement === "before" ? "3px" : "-3px"} 0 var(--brand-blue)` } : undefined}
                    data-drop-placement={dropTarget?.id === t.id ? dropTarget.placement : undefined}
                  >
                    <td className="px-2">
                      <button type="button" aria-label={`${t.title} 순서 이동`} disabled={!canReorder} className="touch-none cursor-grab active:cursor-grabbing disabled:cursor-default disabled:opacity-25 text-muted-foreground p-1 rounded focus-visible:ring-2 focus-visible:ring-ring"
                        onPointerDown={e => {
                          if (!canReorder || e.button !== 0) return;
                          e.preventDefault();
                          e.currentTarget.focus();
                          e.currentTarget.setPointerCapture(e.pointerId);
                          dragging.current = { source: t.id, target: null, placement: "before" };
                          setDragSource(t.id);
                          setGhost({ x: e.clientX, y: e.clientY, title: t.title });
                        }}
                        onPointerMove={e => {
                          const move = dragging.current;
                          if (!move) return;
                          setGhost({ x: e.clientX, y: e.clientY, title: t.title });
                          const row = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLTableRowElement>('tr[data-task-id]');
                          const target = Number(row?.dataset.taskId);
                          if (!row || !tableRef.current?.contains(row) || target === move.source) {
                            move.target = null;
                            setDropTarget(null);
                            return;
                          }
                          const rect = row.getBoundingClientRect();
                          const placement = e.clientY < rect.top + rect.height / 2 ? "before" : "after";
                          move.target = target;
                          move.placement = placement;
                          setDropTarget({ id: target, placement });
                        }}
                        onPointerUp={e => {
                          const move = dragging.current;
                          resetDrag();
                          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
                          if (move?.target != null) reorder(move.source, move.target, move.placement);
                        }}
                        onPointerCancel={resetDrag}
                        onLostPointerCapture={resetDrag}
                        onKeyDown={e => { if (e.key === 'Escape') { resetDrag(); return; } if (!canReorder || !['ArrowUp','ArrowDown'].includes(e.key)) return; e.preventDefault(); const index = rows.findIndex(r => r.id === t.id); const target = rows[index + (e.key === 'ArrowUp' ? -1 : 1)]; if (target) reorder(t.id, target.id); }}>
                        <GripVertical aria-hidden="true" className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        className="text-left hover:underline"
                        onClick={() =>
                          navigate(`/projects/${project.id}/tasks/${t.id}`)
                        }
                      >
                        {t.title}
                      </button>
                    </td>
                    <td className="p-3">
                      {t.assignees.map((a) => a.nickname).join(", ") ||
                        "미배정"}
                    </td>
                    <td className="p-3">{TASK_STATUS[t.status]}</td>
                    <td className="p-3 min-w-28">
                      <ProgressBar value={t.progress} />
                      <span>{t.progress}%</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {t.dueDate ?? "없음"}
                    </td>
                    <td className="p-3">
                      <SizeBadgeDs size={t.size} />
                    </td>
                    <td className="p-3">
                      <RiskScore score={null} />
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      표시할 작업이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {ghost && createPortal(
        <div aria-hidden="true" data-drag-preview className="fixed z-50 pointer-events-none flex items-center gap-3 rounded-md border border-brand-blue bg-white px-4 py-3 text-sm shadow-lg opacity-75"
          style={{ left: ghost.x + 16, top: ghost.y + 12, maxWidth: "min(420px, 70vw)" }}>
          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{ghost.title}</span>
        </div>, document.body,
      )}
    </div>
  );
}
function Templates({
  project,
  busy,
  onSave,
  onCancel,
}: {
  project: ProjectResponse;
  busy: boolean;
  onSave: (template: string, dueDate: string | null) => void;
  onCancel: () => void;
}) {
  const load = useCallback(
    (signal: AbortSignal) => tasksApi.templates(project.id, signal),
    [project.id],
  );
  const q = useApiQuery(load);
  const [selected, setSelected] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const template = q.data?.find((item) => item.template === selected);
  return (
    <div className="space-y-5">
      {q.loading ? (
        <p role="status">템플릿 로딩 중…</p>
      ) : q.error ? (
        <div className="space-y-2">
          <p role="alert">{q.error}</p>
          <Btn onClick={q.retry}>다시 시도</Btn>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-1">
              <label htmlFor="task-template" className="block text-[13px] font-medium text-[#374151]">템플릿</label>
              <select
                id="task-template" aria-label="작업 템플릿"
                disabled={busy} value={selected}
                onChange={(e) => { setSelected(e.target.value); setConfirmed(false); }}
                className="w-full h-8 px-3 text-[13px] bg-[#F9FAFB] border border-border rounded-md outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">선택해주세요</option>
                {q.data?.map((item) => <option key={item.template} value={item.template}>{item.name}</option>)}
              </select>
            </div>
            <Input label="공통 마감일 (선택)" aria-label="템플릿 공통 마감일" type="date" disabled={busy} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <section className="border border-border rounded-md overflow-hidden" aria-label="생성될 작업 미리보기">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-muted border-b border-border">
              <span className="text-[12px] font-medium">생성될 작업</span>
              <span className="text-[12px] text-muted-foreground">{template ? `${template.tasks.length}개` : '템플릿 선택 전'}</span>
            </div>
            {template ? (
              <ol className="divide-y divide-border">
                {template.tasks.map((task, index) => (
                  <li key={index} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-4 shrink-0 text-[11px] text-muted-foreground">{index + 1}</span>
                    <span className="flex-1 min-w-0 text-[13px]">{task.title}</span>
                    <SizeBadgeDs size={task.size} />
                  </li>
                ))}
              </ol>
            ) : <p className="px-4 py-6 text-center text-[12px] text-muted-foreground">템플릿을 선택하면 추가될 작업을 미리 볼 수 있습니다.</p>}
          </section>
          <label className="flex items-start gap-2.5 text-[12px] text-[#374151] cursor-pointer">
            <input type="checkbox" disabled={busy} checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
            <span className="leading-5">기존 작업 뒤에 새 작업이 추가되는 것을 확인했습니다.</span>
          </label>
        </>
      )}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Btn disabled={busy} onClick={onCancel}>취소</Btn>
        <Btn variant="primary" disabled={busy || !selected || !confirmed || q.loading || !!q.error} onClick={() => onSave(selected, dueDate || null)}>
          {busy ? '생성 중…' : '템플릿 작업 생성'}
        </Btn>
      </div>
    </div>
  );
}
